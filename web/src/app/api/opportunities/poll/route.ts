import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { requireAuthToken } from "@/lib/auth-cookie";

/** Dispara el sondeo manual de oportunidades nuevas — útil para demostrar el flujo de alertas sin esperar el cron. */
export const POST = handle(async () => {
  const token = await requireAuthToken();
  return fetchRastroApi("/api/opportunities/poll", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
});
