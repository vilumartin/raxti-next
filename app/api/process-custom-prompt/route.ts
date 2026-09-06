import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcript, prompt, outputLanguage = "en" } = await req.json();
    if (!transcript || !prompt) {
      return NextResponse.json({ error: "Transcript and prompt are required" }, { status: 400 });
    }

    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

    const langName = outputLanguage === "en" ? "English" : outputLanguage;
    const fullPrompt = `${prompt}\n\nPlease respond in ${langName}.\n\nTranscript:\n${transcript}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAIApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant that processes transcripts according to specific instructions." },
          { role: "user", content: fullPrompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    return NextResponse.json({ result: result.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
