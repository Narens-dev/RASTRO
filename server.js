import "dotenv/config";
import express from "express";
import { buildDataSource } from "./src/dataSource.js";
import { buildApiRouter } from "./src/routes/api.js";
import { buildEmailAdapter } from "./src/adapters/email/index.js";
import { buildWhatsAppAdapter } from "./src/adapters/whatsapp/index.js";
import { pollNewOpportunities } from "./src/services/notifications.js";

// API pura — el frontend activo es web/ (Next.js, puerto 3100), que consume
// esta API vía RASTRO_API_URL. Este servidor no sirve HTML.
const app = express();
const source = buildDataSource();
const emailAdapter = buildEmailAdapter();
const whatsappAdapter = buildWhatsAppAdapter();

app.use(express.json());
app.use("/api", buildApiRouter(source, emailAdapter, whatsappAdapter));

app.use((req, res) => {
  res.status(404).json({ error: "not_found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RASTRO API escuchando en http://localhost:${PORT} (fuente de datos: ${source.mode})`);
});

// Sondeo automático de oportunidades nuevas para disparar alertas por correo
// a empresas suscritas — además del endpoint manual POST /api/opportunities/poll
// (útil para forzar el chequeo durante una demo sin esperar el intervalo).
const POLL_INTERVAL_MS = Number(process.env.OPPORTUNITY_POLL_INTERVAL_MS) || 15 * 60 * 1000;
setInterval(() => {
  pollNewOpportunities(source, emailAdapter).catch((err) => {
    console.warn(`[RASTRO] Sondeo automático de oportunidades falló: ${err.message}`);
  });
}, POLL_INTERVAL_MS);
