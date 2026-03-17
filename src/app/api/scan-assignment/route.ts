import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";

    // Fetch courses so Claude can try to match one
    const { data: courses } = await supabase.from("courses").select("id, name");
    const courseList = (courses ?? []).map((c: { id: string; name: string }) => `${c.name} (id: ${c.id})`).join(", ");

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `You are helping a student log an assignment from a photo. Extract the following from the image and return ONLY valid JSON — no markdown, no explanation.

Available courses: ${courseList || "none yet"}

Return this exact JSON shape:
{
  "title": "short assignment title (required, make a reasonable guess if unclear)",
  "due_date": "YYYY-MM-DD or null if not visible",
  "summary": "any useful details like page numbers, topics, or instructions (optional, null if nothing useful)",
  "course_id": "the id of the best matching course from the list, or null if unsure"
}

If no due date is visible, return null for due_date. Keep title concise (under 60 chars).`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const extracted = JSON.parse(text);

    return NextResponse.json({ success: true, data: extracted });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Failed to scan image" }, { status: 500 });
  }
}
