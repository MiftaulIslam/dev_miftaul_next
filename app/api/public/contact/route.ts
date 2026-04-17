import { NextResponse } from "next/server";

import { createMessage } from "@/lib/dashboard/db";
import { sendContactEmail } from "@/lib/mail";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function normalize(payload: ContactPayload) {
  return {
    name: payload.name?.trim() ?? "",
    email: payload.email?.trim() ?? "",
    subject: payload.subject?.trim() ?? "",
    message: payload.message?.trim() ?? "",
  };
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as ContactPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const data = normalize(payload);
  if (!data.name || !data.email || !data.subject || !data.message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!isEmail(data.email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const created = await createMessage({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
  });

  try {
    await sendContactEmail(data);
  } catch {
    return NextResponse.json(
      { error: "Message saved, but email send failed. Check SMTP settings.", saved: true },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, id: created.id });
}

