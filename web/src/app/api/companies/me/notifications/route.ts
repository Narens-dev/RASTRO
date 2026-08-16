import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";
import { requireAuthToken } from "@/lib/auth-cookie";
import type { OpportunityNotification } from "@/types/rastro";

export const GET = handle(async () => {
  const token = await requireAuthToken();
  return fetchRastroApi<{ count: number; notifications: OpportunityNotification[] }>(
    "/api/companies/me/notifications",
    { headers: { Authorization: `Bearer ${token}` } },
  );
});
