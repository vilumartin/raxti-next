import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300; // 5 minutes for large files

// Helper: decode base64 data URL to buffer
function decodeBase64Audio(audioData: string): { buffer: Buffer; mimeType: string; extension: string } {
  // Handle both "data:mime;base64,..." and plain base64 strings
  let mimeType = "audio/mpeg";
  let base64 = audioData;

  const dataUrlMatch = audioData.match(/^data:([^;]*);base64,([\s\S]+)$/);
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1] || "audio/mpeg";
    base64 = dataUrlMatch[2];
  } else if (!audioData.startsWith("data:")) {
    // Assume raw base64 string — treat as mp3
    base64 = audioData;
  } else {
    throw new Error("Invalid audio data format");
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) throw new Error("Audio data is empty");

  // Map MIME type to extension — M4A can arrive as audio/x-m4a, audio/mp4,
  // video/mp4 or audio/aac depending on the browser
  let extension = "mp3";
  const mime = mimeType.toLowerCase();
  if (mime.includes("wav") || mime.includes("wave")) extension = "wav";
  else if (mime.includes("webm")) extension = "webm";
  else if (mime.includes("ogg")) extension = "ogg";
  else if (mime.includes("flac")) extension = "flac";
  else if (
    mime.includes("m4a") ||
    mime.includes("mp4") ||
    mime.includes("aac") ||
    mime.includes("x-m4a")
  ) {
    extension = "m4a";
    // Whisper accepts m4a files but needs a recognised MIME type
    if (!mime.includes("audio/")) mimeType = "audio/mp4";
  } else if (mime.includes("mpeg") || mime.includes("mp3")) extension = "mp3";
  // Fallback: keep mp3 extension which Whisper always accepts

  return { buffer, mimeType, extension };
}

// Helper: transcribe audio buffer via OpenAI Whisper
async function transcribeBuffer(
  buffer: Buffer,
  mimeType: string,
  extension: string,
  language: string,
  openAIApiKey: string,
): Promise<{ transcript: string; segments: any[] }> {
  // Whisper accepts: mp3, mp4, mpeg, mpga, m4a, wav, webm
  // For M4A/AAC we use audio/mp4 MIME and m4a extension
  const whisperMime = mimeType || "audio/mpeg";
  const whisperExt = extension || "mp3";

  const buildFormData = (mime: string, ext: string) => {
    const fd = new FormData();
    fd.append("file", new Blob([new Uint8Array(buffer)], { type: mime }), `audio.${ext}`);
    fd.append("model", "whisper-1");
    if (language && language !== "auto") fd.append("language", language);
    fd.append("response_format", "verbose_json");
    return fd;
  };

  let res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openAIApiKey}` },
    body: buildFormData(whisperMime, whisperExt),
  });

  // If M4A upload fails, retry with mp3 extension/mime as Whisper fallback
  if (!res.ok && (extension === "m4a")) {
    console.warn("M4A upload failed, retrying as mp3...");
    res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAIApiKey}` },
      body: buildFormData("audio/mpeg", "mp3"),
    });
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper API error: ${err}`);
  }

  const result = await res.json();
  return { transcript: result.text || "", segments: result.segments || [] };
}

// Helper: generate summary + action items via GPT-4o-mini
async function generateSummary(
  transcript: string,
  outputLanguage: string,
  openAIApiKey: string,
): Promise<{ summary: string; actionItems: string[] }> {
  const langName = outputLanguage === "en" ? "English" : outputLanguage;
  const prompt = `Please analyze the following transcript and provide:
1. A concise summary (2-3 paragraphs)
2. A list of action items (if any)

Please respond in ${langName}.

Transcript:
${transcript}

Please format your response as JSON with this structure:
{
  "summary": "Your summary here",
  "actionItems": ["Action item 1", "Action item 2"]
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openAIApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that creates summaries and extracts action items from transcripts. Always respond with valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const result = await res.json();
  try {
    const parsed = JSON.parse(result.choices[0].message.content);
    return { summary: parsed.summary || "", actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [] };
  } catch {
    return { summary: result.choices[0].message.content.substring(0, 500), actionItems: [] };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioData, inputLanguage = "en", outputLanguage = "en", userId, skipSummary = false, isInternalCall = false } = body;

    if (!audioData) return NextResponse.json({ error: "No audio data provided" }, { status: 400 });

    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

    // Check PRO status
    let isPro = isInternalCall;
    if (!isPro && userId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader) {
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );
          const token = authHeader.replace("Bearer ", "");
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            // Check subscription via internal call
            const subRes = await fetch(new URL("/api/check-subscription", req.url).toString(), {
              headers: { Authorization: authHeader },
            });
            const subData = await subRes.json();
            isPro = subData?.subscribed === true;
          }
        } catch (err) {
          console.warn("Could not verify PRO status:", err);
        }
      }
    }

    // Decode audio
    const { buffer, mimeType, extension } = decodeBase64Audio(audioData);
    const fileSizeMB = buffer.length / (1024 * 1024);

    // Enforce size limits
    const maxSize = isPro ? 75 : 25;
    if (fileSizeMB > maxSize) {
      return NextResponse.json({
        error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds the ${isPro ? "PRO" : "free"} limit of ${maxSize}MB.`,
      }, { status: 400 });
    }

    const MAX_WHISPER_SIZE = 23; // MB

    let transcript = "";
    let segments: any[] = [];

    if (fileSizeMB <= MAX_WHISPER_SIZE) {
      // Single file processing
      const result = await transcribeBuffer(buffer, mimeType, extension, inputLanguage, openAIApiKey);
      transcript = result.transcript;
      segments = result.segments;
    } else if (isPro) {
      // Chunked processing for PRO users
      const chunkSizeBytes = MAX_WHISPER_SIZE * 1024 * 1024;
      const numChunks = Math.ceil(buffer.length / chunkSizeBytes);
      let combinedTranscript = "";

      for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSizeBytes;
        const end = Math.min(buffer.length, (i + 1) * chunkSizeBytes);
        const chunk = buffer.subarray(start, end);
        try {
          const result = await transcribeBuffer(
            Buffer.from(chunk),
            mimeType,
            extension,
            inputLanguage,
            openAIApiKey,
          );
          combinedTranscript += (combinedTranscript ? " " : "") + result.transcript;
          const adjustedSegments = result.segments.map((s: any, idx: number) => ({
            ...s,
            id: i * 1000 + idx,
          }));
          segments.push(...adjustedSegments);
        } catch (err) {
          console.warn(`Chunk ${i + 1} failed:`, err);
        }
      }
      transcript = combinedTranscript || "Partial transcription from chunks";
    } else {
      return NextResponse.json({
        error: `File size (${fileSizeMB.toFixed(1)}MB) requires PRO subscription for advanced processing.`,
      }, { status: 400 });
    }

    let summary = "";
    let actionItems: string[] = [];

    if (!skipSummary && transcript) {
      const summaryResult = await generateSummary(transcript, outputLanguage, openAIApiKey);
      summary = summaryResult.summary;
      actionItems = summaryResult.actionItems;
    }

    return NextResponse.json({ transcript, summary, actionItems, segments });
  } catch (error: any) {
    console.error("Error in process-audio:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
