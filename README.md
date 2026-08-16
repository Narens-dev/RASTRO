# RASTRO

Motor de transparencia en contratación pública colombiana. RASTRO cruza en paralelo seis fuentes oficiales del Estado (SECOP, RUES, Rama Judicial, Procuraduría, Contraloría, Contaduría) para generar, en segundos, un expediente de riesgo trazable de cualquier contratista o entidad estatal — y usa el mismo motor de datos para generar oportunidades de negocio verificables para pequeñas y medianas empresas.

Proyecto desarrollado para el hackathon Croma / Datos Abiertos Colombia.

## Tabla de contenidos

- [Qué hace RASTRO](#qué-hace-rastro)
- [Principio de producto](#principio-de-producto)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [API REST](#api-rest)
- [Documentación del proyecto](#documentación-del-proyecto)
- [Limitaciones conocidas](#limitaciones-conocidas)

## Qué hace RASTRO

**Modo Transparencia.** Búsqueda pública por NIT, cédula o nombre de empresa/entidad. El resultado es un expediente con un nivel de evidencia por cada una de las seis fuentes consultadas (Alto, Sin hallazgo o Limpio), citando la fuente oficial y la fecha de consulta.

**Seguimiento de contratos.** Para un contrato específico: ejecución financiera (valor total, facturado, pagado, pendiente), línea de tiempo de hitos y adiciones, y una señal automática que compara el avance de plazo transcurrido contra el avance de pago o ejecución física.

**Modo Oportunidad.** Licitaciones activas de SECOP filtrables por sector, ubicación y valor, con el historial de ganadores anteriores en procesos similares de la misma entidad, y un indicador de qué tan concentrada está la contratación reciente de esa entidad entre pocos proveedores.

**Alertas de oportunidad.** Una empresa se suscribe por sector y ubicación; RASTRO sondea SECOP de forma periódica y notifica por correo a todas las empresas suscritas que coincidan, al mismo tiempo, para que ninguna tenga ventaja de información sobre otra.

**Apartado Empresas.** Cuentas verificadas contra RUES (el NIT de registro debe existir y estar activo), con inicio de sesión en dos pasos (código de verificación enviado por correo), verificación de número de WhatsApp, y acceso restringido a un estudio de seguridad de persona natural por cédula: antecedentes penales, disciplinarios y fiscales, procesos judiciales, afiliación al sistema de salud y multas de tránsito, cruzados en un solo dossier con el mismo modelo de niveles de evidencia. A diferencia del expediente de NIT, esta información es sensible y no es de acceso público — se advierte explícitamente sobre la Ley de Habeas Data (Ley 1581 de 2012) antes de cada consulta.

Ver [`RASTRO-documento-de-proyecto.md`](./RASTRO-documento-de-proyecto.md) para el contexto completo del hackathon, la identidad de marca y las decisiones de producto que dieron origen al proyecto.

## Principio de producto

RASTRO nunca emite un veredicto. Cada hallazgo se presenta de forma individual, con su fuente y su fecha, preservando la presunción de inocencia. Ningún resultado —ni el motor determinístico ni el resumen generado por inteligencia artificial— combina la evidencia de varias fuentes en un puntaje, semáforo o recomendación única. La ausencia de un hallazgo ("sin hallazgo") tampoco se presenta como sinónimo de "limpio": algunas fuentes oficiales tienen subregistro documentado, y el producto lo comunica de forma explícita en vez de simplificarlo.

## Arquitectura

El sistema se compone de dos procesos independientes:

- **Backend** (`server.js` + `src/`) — API REST pura sobre Express. No sirve HTML ni archivos estáticos; su único propósito es exponer la lógica de negocio bajo `/api`.
- **Frontend** (`web/`) — aplicación Next.js. Renderiza la interfaz y actúa como el único cliente autorizado de la API: el navegador nunca llama al backend directamente, siempre pasa por rutas propias `app/api/**` que validan la entrada y agregan la autenticación correspondiente.

El acceso a datos externos sigue un patrón de puertos y adaptadores. `src/ports/GovDataSource.js` define el contrato único que consume todo el motor de negocio, con dos implementaciones intercambiables:

- `src/adapters/CromaAdapter.js` — cliente MCP real, conectado directo a `CROMA_MCP_URL`, sin pasar por un modelo de lenguaje en cada consulta. Maneja los trabajos asíncronos que Croma expone para fuentes lentas (`status: "pending"` con sondeo) y normaliza cada respuesta cruda a la forma que define el puerto.
- `src/adapters/MockAdapter.js` — datos de respaldo fieles a la forma real de Croma, usados automáticamente si la fuente primaria falla, se satura o no hay credenciales configuradas.

`src/dataSource.js` es el punto único de composición: elige el adaptador primario según `DATA_SOURCE`, envuelve cada uno de los trece métodos del puerto con caché en memoria (`src/cache/memoryCache.js`, TTL configurable), y degrada automáticamente al adaptador de respaldo si el primario falla — sin que el resto del sistema tenga que saberlo. El estado de salud se calcula sobre una ventana móvil de las últimas doce llamadas y se expone en `GET /api/meta` como `degraded`.

El mismo patrón se repite para los canales de notificación: `src/adapters/email/EmailPort.js` y `src/adapters/whatsapp/WhatsAppPort.js` son las interfaces; `MockEmailAdapter` y `MockWhatsAppAdapter` son los adaptadores activos por defecto — registran cada envío en `data/outbox_emails.json` y `data/outbox_whatsapp.json` respectivamente, y devuelven el código o mensaje generado directamente en la respuesta de la API (marcado explícitamente como modo de demostración) en vez de fingir un envío real. Conectar un proveedor real (por ejemplo Resend o SendGrid para correo, Twilio o la API de WhatsApp Business para WhatsApp) consiste en agregar un adaptador nuevo que implemente el puerto correspondiente, sin modificar los servicios que ya lo usan.

RASTRO es mayormente sin estado: la información de contratación se recalcula en cada consulta contra Croma, con caché de corta duración. Lo que sí necesita sobrevivir a un reinicio del proceso —cuentas de empresa, historial de notificaciones, oportunidades ya vistas— se persiste en archivos JSON planos a través de `src/store/jsonStore.js`, suficiente para el volumen de un hackathon o una demostración. Migrar esta capa a una base de datos relacional es el camino natural de evolución si el volumen de empresas registradas lo justifica.

## Estructura del proyecto

```
server.js                        Backend Express — API pura, sin frontend
src/
  ports/
    GovDataSource.js              Contrato único de acceso a fuentes oficiales
  adapters/
    CromaAdapter.js                Cliente MCP real
    MockAdapter.js                 Datos de respaldo
    fixtures/                      Datos de demostración (formas reales, entidades ficticias)
    email/
      EmailPort.js                 Interfaz de envío de correo
      MockEmailAdapter.js          Adaptador simulado (outbox en data/)
      index.js                     Selección de adaptador por EMAIL_PROVIDER
    whatsapp/
      WhatsAppPort.js               Interfaz de envío de WhatsApp
      MockWhatsAppAdapter.js        Adaptador simulado (outbox en data/)
      index.js                      Selección de adaptador por WHATSAPP_PROVIDER
  dataSource.js                    Composición: selección de fuente, caché y resiliencia
  cache/memoryCache.js             Caché en memoria con expiración
  store/jsonStore.js               Persistencia mínima en JSON
  middleware/auth.js               Verificación de JWT para rutas protegidas
  config/opportunitySeeds.js       Entidades semilla y sectores para Modo Oportunidad
  services/
    normalize.js                   Normalización de texto para búsqueda
    search.js                      Búsqueda con cascada de variantes de normalización
    evidence.js                    Niveles de evidencia compartidos (alto, sin hallazgo, limpio)
    scoreEngine.js                 Construcción del expediente de riesgo (seis fuentes)
    backgroundCheck.js             Estudio de seguridad de persona natural
    contractTracking.js            Seguimiento de un contrato individual
    opportunities.js               Licitaciones activas y ganadores anteriores
    concentration.js               Concentración de contratistas por entidad
    notifications.js               Detección y envío de alertas de oportunidad
    companies.js                   Cuentas de empresa: registro, login en dos pasos, suscripción, WhatsApp
    aiSummary.js                   Resumen ejecutivo narrativo con inteligencia artificial (opcional)
  routes/api.js                    Enrutador REST — único punto de contacto con el frontend
data/                             Persistencia JSON (excluida de control de versiones)
documentacion/                    Documentación formal del proyecto en PDF (ver más abajo)
web/                              Frontend Next.js (ver web/AGENTS.md para sus propias convenciones)
  src/
    app/                           Rutas de página y rutas de API (proxy autenticado hacia el backend)
    views/                         Componentes de vista, uno por página o sección
    lib/                           Cliente de API, manejo de cookies de sesión, utilidades de servidor
    types/rastro.ts                Tipos compartidos que reflejan los contratos de datos del backend
```

## Requisitos previos

- Node.js 18.17 o superior.
- Una API key de Croma si se va a usar `DATA_SOURCE=croma` (opcional — el sistema funciona sin ella usando datos de respaldo).
- Una API key de Anthropic si se quiere habilitar el resumen ejecutivo con inteligencia artificial (opcional).

## Instalación

El backend y el frontend son dos proyectos npm independientes; cada uno requiere su propia instalación y su propio archivo de variables de entorno. Ninguno de los dos incluye datos sensibles por defecto — sin configuración adicional, el backend arranca en modo `mock` y el frontend funciona igual, sin necesitar credenciales de ningún proveedor externo.

```bash
# Backend (raíz del repositorio)
npm install
# Crear .env en la raíz con, como mínimo, DATA_SOURCE=mock — ver la tabla de variables más abajo

# Frontend
cd web
npm install
# Crear web/.env.local con RASTRO_API_URL=http://localhost:3000 — ver la tabla de variables más abajo
cd ..
```

## Variables de entorno

### Backend (`.env`, en la raíz del repositorio)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DATA_SOURCE` | `mock` para datos de respaldo locales, o `croma` para conectar a la fuente real | `mock` |
| `CROMA_MCP_URL` | Endpoint MCP de Croma | `https://api.croma.run/mcp` |
| `CROMA_API_KEY` | Credencial de Croma. Solo se usa si `DATA_SOURCE=croma` | vacío |
| `ANTHROPIC_API_KEY` | Habilita el resumen ejecutivo con inteligencia artificial. Sin ella, los endpoints de resumen responden de forma segura con `available: false` | vacío |
| `CACHE_TTL_MS` | Duración de la caché en memoria, en milisegundos | `600000` (10 minutos) |
| `PORT` | Puerto donde escucha la API | `3000` |
| `JWT_SECRET` | Firma los tokens de sesión de empresa. Debe cambiarse antes de cualquier despliegue que no sea local o de demostración | valor de desarrollo incluido en el código |
| `RASTRO_ESTADO_EMAILS` | Lista de correos, separados por coma, a los que el registro asigna el rol `estado` en vez de `empresa` | vacío (todo registro es `empresa`) |
| `EMAIL_PROVIDER` | Proveedor de envío de correo. Cualquier valor distinto de `mock` cae de vuelta a `mock` hasta que exista un adaptador real | `mock` |
| `WHATSAPP_PROVIDER` | Proveedor de envío de WhatsApp. Mismo comportamiento que `EMAIL_PROVIDER` | `mock` |
| `OPPORTUNITY_POLL_INTERVAL_MS` | Frecuencia del sondeo automático de oportunidades nuevas | `900000` (15 minutos) |
| `DATA_DIR` | Carpeta de persistencia JSON | `./data` |

### Frontend (`web/.env.local`)

| Variable | Descripción |
|---|---|
| `RASTRO_API_URL` | URL base de la API del backend. En desarrollo local, `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | Origen público del sitio, usado para URLs canónicas, metadatos Open Graph, `robots.txt` y `sitemap.xml` |
| `CONTACT_ENDPOINT` | Opcional. Si se define, la ruta de contacto reenvía los mensajes a esa URL; si no, los registra del lado del servidor |

## Ejecución

Los dos procesos deben correr en paralelo.

```bash
# Terminal 1 — backend (API en http://localhost:3000)
npm start

# Terminal 2 — frontend (interfaz en http://localhost:3100)
npm --prefix web run dev
```

Abrir `http://localhost:3100` en el navegador. El backend no sirve ninguna interfaz por sí mismo; visitar directamente `http://localhost:3000` solo devuelve respuestas JSON de la API.

Para producción, el frontend se construye y sirve con `npm --prefix web run build` seguido de `npm --prefix web run start`; el backend se ejecuta igual con `npm start`. Ambos procesos deben desplegarse por separado, y el frontend necesita que `RASTRO_API_URL` apunte a la URL pública del backend desplegado.

## API REST

Base URL en desarrollo: `http://localhost:3000`. Todas las rutas cuelgan de `/api`; cualquier otra ruta responde `404`. Los endpoints marcados como protegidos requieren la cabecera `Authorization: Bearer <token>`, con el token emitido por `POST /api/companies/login/verify`.

| Método | Ruta | Protegido | Descripción |
|---|---|---|---|
| GET | `/api/meta` | No | Estado de la fuente de datos, sectores, ubicaciones y entidades semilla |
| GET | `/api/search?q=` | No | Búsqueda por NIT, cédula o nombre, con cascada de normalización |
| GET | `/api/entity/:docType/:doc` | No | Expediente de riesgo — cruza seis fuentes oficiales en paralelo |
| GET | `/api/entity/:docType/:doc/summary` | No | Resumen ejecutivo con inteligencia artificial sobre ese expediente |
| GET | `/api/contract/:contractId` | No | Seguimiento financiero, línea de tiempo y señal de alineación de un contrato |
| GET | `/api/opportunities` | No | Licitaciones activas. Filtros: `sector`, `location`, `minValue`, `maxValue`, `winners` |
| GET | `/api/concentration/:nit` | No | Concentración de adjudicaciones recientes de una entidad contratante |
| POST | `/api/companies/register` | No | Crea una cuenta de empresa; exige un NIT activo en RUES |
| POST | `/api/companies/login` | No | Primer paso del inicio de sesión: valida credenciales y envía un código por correo |
| POST | `/api/companies/login/verify` | No | Segundo paso: confirma el código y entrega el token de sesión |
| GET | `/api/companies/me` | Sí | Datos de la cuenta autenticada |
| PUT | `/api/companies/me/subscription` | Sí | Actualiza las preferencias de alerta (`active`, `sector`, `location`) |
| GET | `/api/companies/me/notifications` | Sí | Historial de alertas enviadas a la cuenta |
| POST | `/api/companies/me/whatsapp/request-code` | Sí | Genera y envía un código de verificación de WhatsApp |
| POST | `/api/companies/me/whatsapp/verify` | Sí | Confirma el código y marca el número como verificado |
| POST | `/api/opportunities/poll` | Sí | Fuerza el sondeo de oportunidades nuevas, sin esperar el intervalo automático |
| GET | `/api/personas/:docType/:doc` | Sí | Estudio de seguridad de una persona natural por cédula |
| GET | `/api/personas/:docType/:doc/summary` | Sí | Resumen ejecutivo con inteligencia artificial sobre ese estudio de seguridad |

## Documentación del proyecto

La carpeta [`documentacion/`](./documentacion) contiene la documentación formal del proyecto en formato PDF: documento de requerimientos de producto, requerimientos funcionales y no funcionales, historias de usuario, tecnologías usadas, arquitectura del sistema, arquitectura de la API, y diagramas UML (casos de uso, clases y secuencia). Los diagramas se generan a partir de los archivos fuente `.mmd` incluidos en `documentacion/diagramas/`; los documentos se generan con los scripts de Python `documentacion/build_*.py`.

## Limitaciones conocidas

- **Modo Oportunidad usa un conjunto curado de entidades semilla** (`src/config/opportunitySeeds.js`), no un índice global de SECOP por sector: Croma expone búsqueda de procesos por entidad contratante (NIT), no una búsqueda global por sector. Ampliar esta lista es el camino natural de evolución.
- **Las entidades de muy alto volumen de contratación** pueden tardar más de lo esperado en responder desde Croma; cada consulta que agrega varias fuentes tiene un límite de tiempo por entidad, y si no responde a tiempo esa consulta particular degrada a datos de respaldo, quedando en caché para reintentarse tras expirar el TTL.
- **"Ganadores anteriores" se infiere** del nombre de procesos ya cerrados en Contratación directa, con un criterio que exige que ese nombre luzca como el de una persona o empresa real. Cuando no hay suficiente certeza, se omite en vez de mostrar un dato posiblemente incorrecto.
- **La concentración de contratistas usa proveedor y valor reales de una muestra de procesos recientes**, no un mapa de integrantes de consorcio: Croma no expone la composición societaria de una unión temporal como dato estructurado, porque ese tipo de asociación no es persona jurídica propia y no se registra en RUES.
- **Las alertas de oportunidad son de suscripción voluntaria**, no un directorio de cámara de comercio: ni Croma ni RUES exponen el correo de contacto de las empresas registradas en una zona. Una empresa se suscribe con su sector y ubicación, y RASTRO la notifica cuando detecta un proceso nuevo que coincide, al mismo tiempo que a cualquier otra empresa suscrita.
- **El registro de empresa verifica el NIT contra RUES, pero no verifica al representante legal.** No existe en el alcance actual un mecanismo de verificación de identidad del firmante. El rol `estado` tampoco es auto-asignable: solo se otorga a los correos incluidos en `RASTRO_ESTADO_EMAILS`.
- **El estudio de seguridad por cédula expone información personal sensible.** Queda detrás de autenticación y advierte explícitamente sobre la Ley de Habeas Data, pero el alcance actual no implementa un flujo de consentimiento del titular ni un registro de auditoría de quién consultó a quién — ambos serían necesarios antes de cualquier uso en producción real.
- **El envío de correo y de WhatsApp es simulado por defecto.** Cada envío se registra en `data/outbox_emails.json` o `data/outbox_whatsapp.json` y el código o mensaje generado se devuelve directamente en la respuesta de la API, marcado como modo de demostración. Conectar un proveedor real consiste en agregar un adaptador que implemente `EmailPort` o `WhatsAppPort`, sin modificar la lógica de negocio existente.
