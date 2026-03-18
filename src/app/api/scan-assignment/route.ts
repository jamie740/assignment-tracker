import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Fetch courses so GPT can try to match one
    const { data: courses } = await supabase.from("courses").select("id, name");
    const courseList = (courses ?? []).map((c: { id: string; name: string }) => `${c.name} (id: ${c.id})`).join(", ");

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${image}` },
            },
            {
              type: "text",
              text: `You are helping a student log an assignment from a photo. Extract the following from the image and return ONLY valid JSON — no markdown, no explanation.

Today's date is ${new Date().toISOString().split("T")[0]}.

Available courses: ${courseList || "none yet"}

Return this exact JSON shape:
{
  "title": "short assignment title (required, make a reasonable guess if unclear)",
  "due_date": "YYYY-MM-DD or null if not visible",
  "summary": "any useful details like page numbers, topics, or instructions (optional, null if nothing useful)",
  "course_id": "the id of the best matching course from the list, or null if unsure"
}

IMPORTANT due date rules:
- The due date must be between today and 30 days from today.
- If the image shows only a month and day (e.g. "March 21"), pick the year that puts that date within the next 30 days.
- If the date has already passed this year, use next year.
- If no due date is visible, return null.
- Keep title concise (under 60 chars).`,
            },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "";
    // Strip markdown code fences if present
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const extracted = JSON.parse(text);

    return NextResponse.json({ success: true, data: extracted });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Failed to scan image" }, { status: 500 });
  }
}
