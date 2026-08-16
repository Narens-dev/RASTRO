import { z } from "zod";

import { handle } from "@/lib/api";
import { fetchRastroApi } from "@/lib/rastro-api";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

interface BeginLoginResponse {
  ok: true;
  email: string;
  expiresAt: string;
  devCode?: string;
}

/** Paso 1 del login en dos pasos: valida credenciales y envía el código — no hay cookie de sesión todavía. */
export const POST = handle(async (req) => {
  const input = loginSchema.parse(await req.json());
  return fetchRastroApi<BeginLoginResponse>("/api/companies/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
});
