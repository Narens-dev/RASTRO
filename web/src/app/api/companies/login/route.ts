import { z } from "zod";
import { NextResponse } from "next/server";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { setAuthCookie } from "@/lib/auth-cookie";
import type { Company } from "@/types/rastro";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const POST = handle(async (req) => {
  const input = loginSchema.parse(await req.json());
  const upstream = await fetchRastroApi<{ company: Company; token: string }>("/api/companies/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const res = NextResponse.json({ data: { company: upstream.company } }, { status: 200 });
  return setAuthCookie(res, upstream.token);
});
