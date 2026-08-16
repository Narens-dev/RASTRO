import { z } from "zod";
import { NextResponse } from "next/server";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { setAuthCookie } from "@/lib/auth-cookie";
import type { Company } from "@/types/rastro";

const registerSchema = z.object({
  nit: z.string().trim().min(5).max(20),
  email: z.email(),
  password: z.string().min(8).max(200),
  sector: z.string().optional(),
  location: z.string().optional(),
});

export const POST = handle(async (req) => {
  const input = registerSchema.parse(await req.json());
  const upstream = await fetchRastroApi<{ company: Company; token: string }>("/api/companies/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const res = NextResponse.json({ data: { company: upstream.company } }, { status: 201 });
  return setAuthCookie(res, upstream.token);
});
