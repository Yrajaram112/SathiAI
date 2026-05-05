import { NextResponse } from "next/server";

/** Stub — wire to email / CRM later (Prompt 11+). */
export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Waitlist not enabled yet." },
    { status: 501 },
  );
}
