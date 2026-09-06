import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return parseInt(match[1] || "0") * 60 + parseInt(match[2] || "0") + Math.ceil(parseInt(match[3] || "0") / 60);
}

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, outputLanguage = "en", userId } = await req.json();
    if (!videoUrl) return NextResponse.json({ error: "Video URL is required" }, { status: 400 });

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    if (!youtubeApiKey) return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
    if (!rapidApiKey) return NextResponse.json({ error: "RapidAPI key not configured" }, { status: 500 });

    const videoId = extractVideoId(videoUrl);
    if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

    // Get video details
    const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${youtubeApiKey}`);
    if (!videoRes.ok) throw new Error("Failed to fetch video details");
    const videoData = await videoRes.json();
    if (!videoData.items?.length) throw new Error("Video not found or not accessible");

    const video = videoData.items[0];
    const videoTitle = video.snippet.title;
    const videoDuration = video.contentDetails.duration;
    const durationMinutes = parseDurationToMinutes(videoDuration);

    // Request MP3 conversion via RapidAPI
    const encodedUrl = encodeURIComponent(videoUrl);
    const rapidRes = await fetch(`https://youtube-to-mp315.p.rapidapi.com/download?url=${encodedUrl}&format=mp3&quality=0`, {
      method: "POST",
      headers: { "X-RapidAPI-Key": rapidApiKey, "X-RapidAPI-Host": "youtube-to-mp315.p.rapidapi.com" },
    });

    if (!rapidRes.ok) throw new Error(`Audio conversion request failed: ${rapidRes.statusText}`);
    const conversionData = await rapidRes.json();

    let downloadUrl = conversionData.downloadUrl;
    let status = conversionData.status;
    const conversionId = conversionData.id;

    // Poll for completion
    if (status === "CONVERTING") {
      const maxAttempts = Math.min(60 + durationMinutes * 3, 180);
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await fetch(`https://youtube-to-mp315.p.rapidapi.com/status/${conversionId}`, {
          headers: { "X-RapidAPI-Key": rapidApiKey, "X-RapidAPI-Host": "youtube-to-mp315.p.rapidapi.com" },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          status = statusData.status;
          downloadUrl = statusData.downloadUrl;
          if (status === "AVAILABLE") break;
          if (status === "CONVERSION_ERROR") throw new Error("Audio conversion failed. This video may be protected or unavailable.");
        }
      }
    }

    if (status !== "AVAILABLE" || !downloadUrl) {
      throw new Error("Audio conversion timed out. Please try again with a shorter video.");
    }

    // Download the audio file
    const audioFileRes = await fetch(downloadUrl);
    if (!audioFileRes.ok) throw new Error("Failed to download audio file");

    const audioBuffer = await audioFileRes.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");
    const audioDataUrl = `data:audio/mp3;base64,${base64}`;

    // Process via internal process-audio route
    const authHeader = req.headers.get("authorization");
    const processRes = await fetch(new URL("/api/process-audio", req.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({
        audioData: audioDataUrl,
        inputLanguage: "auto",
        outputLanguage,
        userId,
        isInternalCall: true,
      }),
    });

    const processData = await processRes.json();
    if (!processRes.ok || processData?.error) {
      throw new Error(processData?.error || "Audio processing failed");
    }

    return NextResponse.json({
      transcript: processData.transcript,
      summary: processData.summary,
      actionItems: processData.actionItems,
      segments: processData.segments,
      videoTitle,
      videoDuration,
    });
  } catch (error: any) {
    console.error("YouTube extractor error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
