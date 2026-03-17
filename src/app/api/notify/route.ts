import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import twilio from "twilio";

export async function GET(req: Request) {
  // Protect this endpoint with a secret so only Vercel Cron can call it
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  const today = new Date();

  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatForDB = (d: Date) => d.toISOString().split("T")[0];

  // Fetch assignments due in 3 days or tomorrow that aren't submitted
  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .in("due_date", [formatForDB(in3Days), formatForDB(tomorrow)])
    .neq("status", "submitted");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const messages: string[] = [];

  for (const a of assignments ?? []) {
    const daysUntil = a.due_date === formatForDB(tomorrow) ? 1 : 3;
    const msg = `📚 Reminder: "${a.title}" (${a.course?.name ?? "Unknown"}) is due in ${daysUntil} day${daysUntil > 1 ? "s" : ""}.`;

    await twilioClient.messages.create({
      body: msg,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: process.env.MY_PHONE_NUMBER!,
    });

    messages.push(msg);
  }

  return NextResponse.json({ sent: messages.length, messages });
}
