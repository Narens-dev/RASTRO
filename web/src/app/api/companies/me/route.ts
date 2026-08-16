import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { requireAuthToken } from "@/lib/auth-cookie";
import type { Company } from "@/types/rastro";

export const GET = handle(async () => {
  const token = await requireAuthToken();
  return fetchRastroApi<{ company: Company }>("/api/companies/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
});

const subscriptionSchema = z.object({
  active: z.boolean(),
  sector: z.string(),
  location: z.string(),
});

export const PUT = handle(async (req) => {
  const token = await requireAuthToken();
  const input = subscriptionSchema.parse(await req.json());
  return fetchRastroApi<{ company: Company }>("/api/companies/me/subscription", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
});
