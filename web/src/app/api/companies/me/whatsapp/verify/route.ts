import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { requireAuthToken } from "@/lib/auth-cookie";
import type { Company } from "@/types/rastro";

const bodySchema = z.object({ code: z.string().min(4) });

export const POST = handle(async (req) => {
  const token = await requireAuthToken();
  const input = bodySchema.parse(await req.json());
  return fetchRastroApi<{ company: Company }>("/api/companies/me/whatsapp/verify", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
});
