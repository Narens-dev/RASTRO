import { z } from "zod";
import { NextResponse } from "next/server";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { setAuthCookie } from "@/lib/auth-cookie";
import type { Company } from "@/types/rastro";

const verifySchema = z.object({
  email: z.email(),
  code: z.string().min(4),
});

/** Paso 2 del login en dos pasos: confirma el código y recién ahí pone la cookie de sesión. */
export const POST = handle(async (req) => {
  const input = verifySchema.parse(await req.json());
  const upstream = await fetchRastroApi<{ company: Company; token: string }>("/api/companies/login/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const res = NextResponse.json({ data: { company: upstream.company } }, { status: 200 });
  return setAuthCookie(res, upstream.token);
});
