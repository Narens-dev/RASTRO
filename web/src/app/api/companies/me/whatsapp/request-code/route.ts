import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { requireAuthToken } from "@/lib/auth-cookie";

const bodySchema = z.object({ phone: z.string().min(7) });

interface RequestCodeResponse {
  ok: true;
  phone: string;
  expiresAt: string;
  devCode?: string;
}

export const POST = handle(async (req) => {
  const token = await requireAuthToken();
  const input = bodySchema.parse(await req.json());
  return fetchRastroApi<RequestCodeResponse>("/api/companies/me/whatsapp/request-code", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
});
