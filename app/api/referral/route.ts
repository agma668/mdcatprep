import { NextResponse } from "next/server";
import { getReferralInfo } from "@/app/actions/referral";

export async function GET() {
  const info = await getReferralInfo();
  if (!info) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(info);
}
