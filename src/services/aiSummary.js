import Anthropic from "@anthropic-ai/sdk";

/**
 * Módulo 6 — Resumen con IA (opcional).
 * Redacta un resumen ejecutivo en lenguaje natural del expediente YA
 * cruzado por scoreEngine. Nunca decide el nivel de riesgo: solo narra lo
 * que el motor determinístico ya calculó, y siempre deja la evidencia cruda
 * visible debajo como fuente de verdad. Se degrada de forma segura —
 * devuelve { available: false } — si falta la API key o si la llamada falla.
 */

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `Eres el redactor de resúmenes de RASTRO, una plataforma de transparencia sobre contratación pública en Colombia.
Recibes un expediente YA CLASIFICADO por un motor determinístico (niveles: alto / sin_hallazgo / limpio, por fuente).
Reglas estrictas:
- Nunca emitas un veredicto de culpabilidad ni uses palabras como "corrupto", "culpable" o "criminal".
- Nunca inventes hallazgos que no estén en los datos recibidos.
- Preserva la presunción de inocencia: un hallazgo "alto" es evidencia a verificar, no una condena.
- Cita la fuente de cada hallazgo que menciones.
- Máximo 120 palabras, tono claro y directo, en español neutro para Colombia.`;

export async function summarizeExpediente(expediente) {
  const anthropic = getClient();
  if (!anthropic) return { available: false, reason: "ANTHROPIC_API_KEY no configurada" };

  const payload = {
    nombre: expediente.name,
    documento: expediente.doc,
    tipoDocumento: expediente.docType,
    evidencia: expediente.evidence.map((e) => ({ fuente: e.source, nivel: e.level, resumen: e.summary })),
    conteos: expediente.counts,
  };

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Redacta el resumen ejecutivo para este expediente:\n${JSON.stringify(payload, null, 2)}` }],
    });
    const text = message.content.find((c) => c.type === "text")?.text?.trim();
    if (!text) throw new Error("Respuesta vacía del modelo");
    return { available: true, text };
  } catch (err) {
    console.warn(`[RASTRO] Resumen IA no disponible: ${err.message}`);
    return { available: false, reason: err.message };
  }
}
