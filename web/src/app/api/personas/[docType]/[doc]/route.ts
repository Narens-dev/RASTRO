import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { requireAuthToken } from "@/lib/auth-cookie";
import type { PersonaDossier } from "@/types/rastro";

const paramsSchema = z.object({
  docType: z.enum(["CC", "CE"]),
  doc: z.string().min(1),
});

/** Estudio de seguridad por cédula — protegido: solo cuentas de empresa/estado autenticadas. */
export const GET = handle(async (req, ctx) => {
  const token = await requireAuthToken();
  const { docType, doc } = paramsSchema.parse(await ctx.params);
  const name = req.nextUrl.searchParams.get("name");
  const qs = name ? `?name=${encodeURIComponent(name)}` : "";
  return fetchRastroApi<PersonaDossier>(`/api/personas/${docType}/${encodeURIComponent(doc)}${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
});
