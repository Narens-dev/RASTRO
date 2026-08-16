import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";

export const GET = handle(async () => {
  return fetchRastroApi("/api/meta");
});
