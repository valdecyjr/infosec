import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "secbot_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function GET(req: NextRequest) {
  const existing = req.cookies.get(COOKIE_NAME)?.value;
  if (existing && existing.length === 36) {
    return NextResponse.json({ sessionId: existing });
  }
  const sessionId = uuidv4();
  const res = NextResponse.json({ sessionId });
  res.cookies.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
