import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { requireAuthToken } from "@/lib/auth-cookie";
import type { AiSummaryResponse } from "@/types/rastro";

const paramsSchema = z.object({
  docType: z.enum(["CC", "CE"]),
  doc: z.string().min(1),
});

/** Resumen con IA del estudio de seguridad — protegido igual que el dossier. */
export const GET = handle(async (req, ctx) => {
  const token = await requireAuthToken();
  const { docType, doc } = paramsSchema.parse(await ctx.params);
  const name = req.nextUrl.searchParams.get("name");
  const qs = name ? `?name=${encodeURIComponent(name)}` : "";
  return fetchRastroApi<AiSummaryResponse>(`/api/personas/${docType}/${encodeURIComponent(doc)}/summary${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
});
