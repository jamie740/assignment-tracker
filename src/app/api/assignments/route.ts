import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .order("due_date");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { course_id, title, summary, due_date, status } = body;
  const { data, error } = await supabase
    .from("assignments")
    .insert({ course_id, title, summary: summary || null, due_date, status: status ?? "not_started" })
    .select("*, course:courses(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
