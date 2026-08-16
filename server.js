import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDataSource } from "./src/dataSource.js";
import { buildApiRouter } from "./src/routes/api.js";
import { buildEmailAdapter } from "./src/adapters/email/index.js";
import { pollNewOpportunities } from "./src/services/notifications.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const source = buildDataSource();
const emailAdapter = buildEmailAdapter();

app.use(express.json());
app.use("/api", buildApiRouter(source, emailAdapter));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"), (err) => {
    if (err) res.status(404).send("No encontrado.");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RASTRO escuchando en http://localhost:${PORT} (fuente de datos: ${source.mode})`);
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
