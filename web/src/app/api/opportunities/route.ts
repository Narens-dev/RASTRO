import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";

const stringParam = () =>
  z.preprocess((v) => (v === null ? undefined : v), z.string().optional());

const querySchema = z.object({
  sector: stringParam(),
  location: stringParam(),
  minValue: stringParam(),
  maxValue: stringParam(),
  winners: stringParam(),
});

export const GET = handle(async (req) => {
  const params = req.nextUrl.searchParams;
  const parsed = querySchema.parse({
    sector: params.get("sector"),
    location: params.get("location"),
    minValue: params.get("minValue"),
    maxValue: params.get("maxValue"),
    winners: params.get("winners"),
  });

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(parsed)) {
    if (value) qs.set(key, value);
  }

  return fetchRastroApi(`/api/opportunities?${qs.toString()}`);
});
