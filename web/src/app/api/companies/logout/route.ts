import { NextResponse } from "next/server";

import { handle } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth-cookie";

export const POST = handle(async () => {
  const res = NextResponse.json({ data: { ok: true } });
  return clearAuthCookie(res);
});
