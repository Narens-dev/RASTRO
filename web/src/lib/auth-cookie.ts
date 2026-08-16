/**
 * Sesión de empresa — el JWT que emite el backend Express (src/services/companies.js)
 * se guarda en una cookie httpOnly puesta por los route handlers de Next, nunca
 * expuesta a JS del navegador. Las rutas protegidas la leen server-side y la
 * reenvían como `Authorization: Bearer` hacia el backend.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api";

export const AUTH_COOKIE = "rastro_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días — igual que la expiración del JWT.

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.delete(AUTH_COOKIE);
  return res;
}

export async function getAuthToken() {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

/** For use inside `handle()` route handlers — throws the standard 401 envelope when absent. */
export async function requireAuthToken() {
  const token = await getAuthToken();
  if (!token) throw new ApiError(401, "unauthenticated", "No has iniciado sesión.");
  return token;
}
