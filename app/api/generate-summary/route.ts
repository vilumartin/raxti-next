import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcript, outputLanguage = "en" } = await req.json();
    if (!transcript) return NextResponse.json({ error: "Transcript is required" }, { status: 400 });

    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

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
          { role: "system", content: "You are a helpful assistant. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    try {
      const parsed = JSON.parse(result.choices[0].message.content);
      return NextResponse.json({ summary: parsed.summary || "", actionItems: parsed.actionItems || [] });
    } catch {
      return NextResponse.json({ summary: result.choices[0].message.content, actionItems: [] });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
