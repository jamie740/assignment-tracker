import { NextResponse } from "next/server";
import twilio from "twilio";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  const url = new URL(req.url);
  const time = url.searchParams.get("time") ?? "afterschool";

  const messages: Record<string, string> = {
    afterschool: "📚 After school reminder: open your Assignment Tracker and log anything new from today!",
    evening: "📋 Evening check-in: any assignments to add before tomorrow? Open your tracker and stay on top of it!",
  };

  const body = messages[time] ?? messages["afterschool"];

  await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: process.env.MY_PHONE_NUMBER!,
  });

  return NextResponse.json({ sent: true, message: body });
}
