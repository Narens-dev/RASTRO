# RASTRO

### Sigue el rastro del dinero público

RASTRO cruza en paralelo seis fuentes oficiales del Estado colombiano (SECOP, RUES, Rama Judicial, Procuraduría, Contraloría, Contaduría) para generar, en segundos:

- **Modo Transparencia** — un expediente de riesgo trazable para cualquier NIT, cédula o nombre de entidad/empresa, con niveles de evidencia (🟥 alto / ⬜ sin hallazgo / 🟩 limpio) citando fuente y fecha de consulta. RASTRO nunca emite un veredicto.
- **Seguimiento de contratos** — línea de tiempo, ejecución financiera y una señal automática que compara avance de plazo vs. avance de pago/ejecución.
- **Modo Oportunidad** — licitaciones activas de SECOP filtradas por sector, ubicación y valor, con historial de ganadores anteriores — pensado para pymes.
- **Alertas de oportunidad** — una empresa se suscribe por sector/ubicación y recibe un correo apenas RASTRO detecta una licitación nueva que coincide, para que todas las pymes partan con la misma información al mismo tiempo.
- **Apartado Empresas** — cuentas verificadas por NIT (RUES) para consultar, por cédula, un estudio de seguridad de persona natural: antecedentes penales, disciplinarios y fiscales, procesos judiciales, afiliación a EPS y multas de tránsito, cruzados en un solo dossier con el mismo modelo de niveles de evidencia. Acceso restringido — no es información pública como el expediente de NIT.

Ver [`RASTRO-documento-de-proyecto.md`](./RASTRO-documento-de-proyecto.md) para el documento de proyecto completo (contexto de hackathon, identidad de marca, decisiones de arquitectura).

## Arquitectura

Puerto/adaptador (hexagonal ligero): `src/ports/GovDataSource.js` define el contrato único que consume todo el motor de negocio. Dos implementaciones:

- `src/adapters/CromaAdapter.js` — cliente MCP real, conectado directo a `CROMA_MCP_URL` (sin pasar por un LLM en cada consulta). Maneja jobs asíncronos (`status: "pending"` + polling) y normaliza cada respuesta cruda a la forma del puerto.
- `src/adapters/MockAdapter.js` — fixtures de respaldo fieles a la forma real de Croma, para demostrar el producto si Croma falla o se satura.

`src/dataSource.js` es el punto de composición: elige el adaptador primario según `DATA_SOURCE`, envuelve cada llamada en caché en memoria con TTL (`src/cache/memoryCache.js`), y degrada automáticamente a `MockAdapter` si la fuente primaria falla.

RASTRO era completamente stateless (todo se recalculaba contra Croma en cada consulta); las alertas de oportunidad y las cuentas de empresa son lo primero que necesita persistencia real. `src/store/jsonStore.js` es un almacén mínimo sin dependencias (un archivo JSON por colección, en `data/`, gitignored) — suficiente para el volumen de un hackathon/demo; Postgres es el camino natural si el volumen lo justifica. El envío de correo sigue el mismo patrón puerto/adaptador que Croma: `src/adapters/email/EmailPort.js` + `MockEmailAdapter.js` (registra el envío en `data/outbox_emails.json` en vez de enviar de verdad — conectar un proveedor real es un adaptador nuevo, sin tocar el resto del sistema).

```
src/
  ports/GovDataSource.js       Contrato único fuente-de-datos
  adapters/
    CromaAdapter.js             Cliente MCP real
    MockAdapter.js               Fixtures de respaldo
    fixtures/                   Datos de demo (formas reales, entidades ficticias)
    email/                       EmailPort + MockEmailAdapter (mismo patrón que GovDataSource)
  dataSource.js                Composición: selección + caché + fallback
  cache/memoryCache.js         Caché en memoria con TTL
  store/jsonStore.js           Persistencia mínima en JSON (empresas, oportunidades ya notificadas)
  middleware/auth.js           JWT — gatea el estudio de seguridad y el panel de empresa
  config/opportunitySeeds.js   Entidades semilla y sectores para Modo Oportunidad
  services/
    normalize.js                Normalización de texto para búsqueda
    search.js                   Módulo 3 — búsqueda con cascada de fallback
    evidence.js                  Niveles de evidencia compartidos (alto/sin hallazgo/limpio)
    scoreEngine.js               Módulo 2 — cruce de 6 fuentes para NIT/empresa
    backgroundCheck.js           Estudio de seguridad de persona natural (apartado Empresas)
    contractTracking.js         Módulo 4 — seguimiento de contrato
    opportunities.js            Módulo 5 — oportunidades pyme
    notifications.js             Alertas de oportunidad por correo (detección + envío)
    companies.js                 Cuentas de empresa: registro (verificado por NIT), login, suscripción
    aiSummary.js                Módulo 6 — resumen ejecutivo con Claude (opcional)
  routes/api.js                 Módulo 8 — API REST
public/                         Módulo 9 — frontend legacy (HTML/JS vanilla, sin build step)
web/                            Frontend Next.js activo (ver web/AGENTS.md) — proxya src/ vía app/api/**
```

## Instalación

Requiere Node.js ≥ 18.17.

```bash
npm install
cp .env.example .env
```

Edita `.env`:

| Variable | Descripción |
|---|---|
| `DATA_SOURCE` | `mock` (por defecto, sin credenciales) o `croma` (fuente real) |
| `CROMA_MCP_URL` | Endpoint MCP de Croma (por defecto `https://api.croma.run/mcp`) |
| `CROMA_API_KEY` | Credencial de Croma — solo necesaria si `DATA_SOURCE=croma` |
| `ANTHROPIC_API_KEY` | Opcional — habilita el resumen ejecutivo con IA (Módulo 6). Sin ella, ese endpoint responde `{ available: false }` de forma segura |
| `CACHE_TTL_MS` | TTL de la caché en memoria, en ms (10 min por defecto) |
| `PORT` | Puerto del servidor (3000 por defecto) |
| `JWT_SECRET` | Firma los tokens de sesión de empresa — cambiar el valor por defecto antes de desplegar |
| `RASTRO_ESTADO_EMAILS` | Correos (separados por coma) a los que el registro les asigna el rol `estado` en vez de `empresa`. Sin esto, todo auto-registro es rol `empresa` |
| `EMAIL_PROVIDER` | `mock` (por defecto) — registra los correos en `data/outbox_emails.json` en vez de enviarlos. No hay proveedor real conectado todavía (ver `src/adapters/email/`) |
| `OPPORTUNITY_POLL_INTERVAL_MS` | Cada cuánto se sondean oportunidades nuevas para disparar alertas (15 min por defecto). También se puede forzar con `POST /api/opportunities/poll` |
| `DATA_DIR` | Carpeta de persistencia JSON (`./data` por defecto) |

## Uso

```bash
npm start          # node server.js
npm run dev         # node --watch server.js — recarga automática
```

Abre `http://localhost:3000`.

## API REST

| Endpoint | Descripción |
|---|---|
| `GET /api/search?q=` | Búsqueda por NIT/cédula o nombre (cascada de normalización) |
| `GET /api/entity/:docType/:doc` | Expediente completo (evidencia de 6 fuentes + historial de contratos) |
| `GET /api/entity/:docType/:doc/summary` | Resumen ejecutivo con IA (opcional) |
| `GET /api/contract/:contractId` | Seguimiento de un contrato específico |
| `GET /api/opportunities` | Licitaciones activas — filtros: `sector`, `location`, `minValue`, `maxValue`, `winners` |
| `GET /api/meta` | Configuración para el frontend (sectores, ubicaciones, estado de la fuente de datos) |
| `POST /api/companies/register` | Crea una cuenta de empresa — exige NIT activo en RUES |
| `POST /api/companies/login` | Inicia sesión, devuelve JWT |
| `GET /api/companies/me` 🔒 | Datos de la cuenta autenticada |
| `PUT /api/companies/me/subscription` 🔒 | Actualiza preferencias de alerta (`active`, `sector`, `location`) |
| `GET /api/companies/me/notifications` 🔒 | Historial de alertas enviadas a la cuenta |
| `POST /api/opportunities/poll` 🔒 | Fuerza el sondeo de oportunidades nuevas + envío de alertas (además del cron automático) |
| `GET /api/personas/:docType/:doc` 🔒 | Estudio de seguridad por cédula (antecedentes, EPS, multas — ver Limitaciones) |

🔒 = requiere `Authorization: Bearer <token>` (JWT emitido por `/api/companies/login` o `/register`).

## Limitaciones conocidas

- **Modo Oportunidad usa un conjunto curado de entidades "semilla"** (`src/config/opportunitySeeds.js`), no un índice global de SECOP por sector — Croma expone búsqueda de procesos por entidad contratante (NIT), no una búsqueda global por sector. Ampliar esta lista es el camino natural de evolución.
- **Entidades de muy alto volumen de contratación** (ej. Bogotá) pueden tardar más de lo esperado en Croma; cada consulta de oportunidades tiene un tope de 10s por entidad — si una no responde a tiempo, esa consulta particular degrada a datos de respaldo para esa entidad (quedan cacheados y se reintentan tras expirar el TTL).
- **"Ganadores anteriores"** se infiere del campo `name` de procesos ya cerrados en Contratación directa, con un heurístico que exige que luzca como nombre de persona/empresa (sufijo legal o patrón de nombre propio, sin sustantivos administrativos genéricos). Cuando no hay suficiente certeza, se omite en vez de mostrar un dato posiblemente incorrecto.
- El boletín SIBOR de responsabilidad fiscal (Contraloría) certifica personas naturales, no personas jurídicas — para un NIT ese nivel de evidencia se marca como "sin hallazgo — no aplica" en vez de forzar una consulta inválida.
- **Las alertas de oportunidad son opt-in, no un directorio de Cámara de Comercio.** Ni Croma ni RUES exponen el correo de contacto de las empresas registradas en una cámara — no existe una fuente oficial para "todas las empresas de la zona X". En vez de eso, una empresa se suscribe voluntariamente con su sector/ubicación; RASTRO la notifica cuando Modo Oportunidad detecta un proceso nuevo que coincide. Cumple el objetivo (que todas las empresas suscritas se enteren al mismo tiempo) sin inventar una lista de correos.
- **El registro de empresa verifica el NIT contra RUES, pero no verifica al representante legal.** Cualquiera puede registrar una cuenta a nombre de un NIT activo — no hay un mecanismo de verificación de identidad (ej. firma digital, validación con la DIAN) en el alcance de este hackathon. El rol `estado` tampoco es auto-asignable: solo se otorga a los correos listados en `RASTRO_ESTADO_EMAILS` (provisión manual).
- **El estudio de seguridad por cédula expone información personal sensible** (antecedentes penales, afiliación a salud, multas) — a diferencia del expediente de NIT, esto no es información pública sin restricción. Queda detrás de autenticación, pero el alcance actual no implementa un flujo de consentimiento del titular ni un registro de auditoría de quién consultó a quién — ambos serían necesarios antes de un uso en producción bajo la Ley de Habeas Data (Ley 1581/2012).
- **El envío de correo es simulado** (`EMAIL_PROVIDER=mock`): cada alerta se registra en `data/outbox_emails.json` y es consultable vía `GET /api/companies/me/notifications`, pero no llega a una bandeja de entrada real todavía. Conectar un proveedor (Resend, SendGrid, SES) es agregar un adaptador que implemente `EmailPort`, sin tocar `notifications.js` ni las rutas.
