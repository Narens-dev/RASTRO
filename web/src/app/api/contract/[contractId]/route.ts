import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";

const paramsSchema = z.object({ contractId: z.string().min(1) });

export const GET = handle(async (_req, ctx) => {
  const { contractId } = paramsSchema.parse(await ctx.params);
  return fetchRastroApi(`/api/contract/${encodeURIComponent(contractId)}`);
});
