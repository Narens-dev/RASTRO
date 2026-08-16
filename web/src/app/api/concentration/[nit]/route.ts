import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";

const paramsSchema = z.object({ nit: z.string().min(1) });

export const GET = handle(async (_req, ctx) => {
  const { nit } = paramsSchema.parse(await ctx.params);
  return fetchRastroApi(`/api/concentration/${encodeURIComponent(nit)}`);
});
