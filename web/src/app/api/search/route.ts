import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";

const querySchema = z.object({ q: z.string().min(1) });

export const GET = handle(async (req) => {
  const { q } = querySchema.parse({
    q: req.nextUrl.searchParams.get("q") ?? "",
  });
  return fetchRastroApi(`/api/search?q=${encodeURIComponent(q)}`);
});
