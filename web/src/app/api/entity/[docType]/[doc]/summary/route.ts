import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";

const paramsSchema = z.object({
  docType: z.enum(["NIT", "CC", "CE"]),
  doc: z.string().min(1),
});

export const GET = handle(async (req, ctx) => {
  const { docType, doc } = paramsSchema.parse(await ctx.params);
  const name = req.nextUrl.searchParams.get("name");
  const qs = name ? `?name=${encodeURIComponent(name)}` : "";
  return fetchRastroApi(`/api/entity/${docType}/${encodeURIComponent(doc)}/summary${qs}`);
});
