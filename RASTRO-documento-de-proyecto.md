# RASTRO
### Sigue el rastro del dinero público

**Documento de proyecto — Hackathon Croma / Datos Abiertos Colombia**

---

## 1. Resumen ejecutivo

RASTRO es una plataforma que consolida y cruza automáticamente fuentes oficiales dispersas del Estado colombiano (SECOP, RUES, Rama Judicial, Procuraduría, Contraloría) para generar, en segundos, un **expediente de riesgo trazable** de cualquier contratista o entidad estatal — y del mismo motor de datos, genera **alertas de oportunidad de negocio** para pequeñas y medianas empresas.

No creamos información nueva: toda la que mostramos ya es pública por ley. Lo que aportamos es **cruce, interpretación y accesibilidad** de datos que hoy están dispersos en al menos cinco sistemas distintos, sin conexión entre sí, y fuera del alcance práctico de un ciudadano, periodista o funcionario sin conocimiento técnico.

**Principio no negociable del producto:** RASTRO nunca emite un veredicto. Cada hallazgo se presenta como un nivel de evidencia con su fuente oficial citada, preservando la presunción de inocencia.

---

## 2. Génesis del proyecto: de 10 ideas a 1

Al iniciar el hackathon se generó una lluvia de 10 ideas usando el acceso a Croma, desde lo más ambicioso hasta lo más aterrizado. De esas 10, se seleccionaron **3 como las más prometedoras**:

| # | Idea original | En qué consistía |
|---|---|---|
| **1** | Radar de Corrupción en Tiempo Real | Cruzar contratistas del Estado con sus sanciones fiscales/disciplinarias activas para detectar quién sigue ganando contratos pese a tener antecedentes. |
| **5** | Mapa de Contratación Pública | Visualización interactiva de cuánta plata mueve cada entidad estatal, a quién se la adjudica, y si hay patrones de concentración en un solo proveedor. |
| **7** | Alerta de Licitaciones a la Medida | Bot que notifica a pequeñas empresas cuando aparece una licitación que coincide con su sector, verificando que estén habilitadas para participar. |

### Cómo se fusionaron en RASTRO

Las tres ideas apuntaban al mismo dato base (contratación pública en SECOP) desde ángulos distintos: **la idea 1 detecta el riesgo, la idea 5 lo visualiza, la idea 7 lo convierte en oportunidad de negocio.** En vez de construir tres productos separados, se diseñó **un solo motor de cruce de datos con dos superficies de uso**:

- **Modo Transparencia** (fusión de las ideas 1 y 5): ficha de riesgo por contratista/entidad, con mapa de relaciones entre consorcios, uniones temporales y sus integrantes reales.
- **Modo Oportunidad** (idea 7): licitaciones abiertas filtradas por sector, dirigidas a pymes.

Esta fusión resolvió además una tensión de diseño importante: *"si esto es información pública, ¿por qué no dársela a todo el mundo sin restricción?"* — la respuesta fue diseñar el acceso por consumidor: el Estado y las veedurías usan el modo transparencia con mayor profundidad, mientras que las pymes acceden libremente al modo oportunidad, que es información de menor sensibilidad.

---

## 3. En qué consiste el proyecto

RASTRO tiene **tres pilares funcionales**:

1. **Verificación (Modo Transparencia):** el usuario busca un NIT, cédula o nombre de entidad/empresa. RASTRO cruza en paralelo seis fuentes oficiales y devuelve un expediente con niveles de evidencia (alto / sin hallazgo / limpio), cada uno con su fuente citada y fecha de consulta.

2. **Seguimiento (Contract tracking):** para un contrato específico, RASTRO muestra su línea de tiempo, ejecución financiera (valor, facturado, pagado, pendiente) y una señal automática que compara el avance del pago contra el avance del plazo — sin depender de reportes de avance físico, que no existen como dato público estructurado.

3. **Oportunidad (Modo Pyme):** el mismo motor de datos, usado en la dirección contraria — en vez de buscar riesgo, busca licitaciones abiertas que coinciden con el sector de una pequeña empresa, con contexto competitivo (quién ha ganado procesos similares en esa entidad antes).

**Consumidor final:** el Estado (control interno, veedurías institucionales) como usuario primario, con proyección directa a la ciudadanía (periodistas, veedurías ciudadanas, pymes) — cada uno con el nivel de profundidad de información apropiado a su rol.

---

## 4. Oportunidades para pymes — el diferencial adicional

Este es un componente que muchos proyectos de transparencia pasan por alto, y es exactamente donde RASTRO se distingue: **el mismo dato que sirve para vigilar corrupción sirve para nivelar la cancha de las pequeñas empresas.**

### Por qué esto importa
Las pymes colombianas rara vez tienen el tiempo o el personal dedicado a rastrear manualmente el SECOP en busca de licitaciones que les apliquen. Las grandes empresas sí tienen esa capacidad — lo que genera una asimetría de información que perpetúa que los mismos proveedores grandes concentren la contratación estatal.

### Cómo funciona el Modo Oportunidad
- La pyme define su **sector** (mapeado internamente a códigos UNSPSC), **ubicación** y **rango de valor** de interés.
- RASTRO filtra procesos de SECOP en estado activo (abierto, en evaluación) — nunca procesos ya cerrados.
- Por cada licitación, se muestra opcionalmente el **historial de ganadores anteriores** en procesos similares de esa misma entidad, dándole a la pyme inteligencia competitiva real antes de decidir si participa.
- Es la única parte del producto que puede ser **100% pública y sin restricción de acceso**, porque no expone juicios de riesgo sobre personas o empresas — solo oportunidades de negocio ya públicas en SECOP, organizadas de forma legible.

### Valor de negocio de este módulo
Además del impacto social (democratizar el acceso a contratación estatal), este módulo tiene una vía de sostenibilidad futura clara: cámaras de comercio, gremios sectoriales o fondos de fomento a mipymes son consumidores institucionales naturales de esta funcionalidad, con capacidad de pago — a diferencia del módulo de transparencia, que es principalmente de interés público.

---

## 5. Identidad de marca

**Nombre:** RASTRO — evoca la idea de que el gasto público deja huella, y que esa huella es rastreable.

**Paleta de color:**

| Color | Hex (referencia) | Uso |
|---|---|---|
| Verde esmeralda (primario) | `#046A38` | Marca, navegación, acento principal — referencia directa a un recurso natural emblemático de Colombia, asociado a valor y verificación |
| Esmeralda oscuro | `#033D21` | Texto sobre fondos claros, estados hover |
| Dorado | `#C9A227` | Acento secundario — recursos/valor público, elementos de énfasis puntual (montos, hallazgos importantes) |
| Negro tinta | `#14110F` | Texto principal, estructura |
| Fondo neutro | `#F7F5F0` / blanco | Superficie base, para máxima legibilidad de datos densos |

Esta paleta debe reservar el dorado para momentos puntuales de énfasis (nunca como color de fondo extendido) para que mantenga su peso visual — la regla es "un acento, gastado con disciplina", no decoración repetida.

---

## 6. Herramientas y cómo se usan

| Herramienta | Rol en el proyecto | Cómo se usa |
|---|---|---|
| **Croma (API/MCP)** | Fuente de datos oficiales | Cliente MCP conectado directo desde el backend a `api.croma.run/mcp`, sin pasar por un LLM en cada consulta — se usan los endpoints de SECOP, RUES, Rama Judicial, Procuraduría y Contraloría |
| **Node.js + Express** | Backend | Un solo servicio REST; concentra el motor de cruce de datos y expone los endpoints que consume el frontend |
| **Patrón puerto/adaptador (hexagonal ligero)** | Aislamiento de la fuente de datos | Una interfaz `GovDataSource` con dos implementaciones: `CromaAdapter` (real) y `MockAdapter` (fixtures de respaldo) — permite seguir demostrando el producto si Croma falla o se satura durante la demo |
| **Caché en memoria (Map + TTL)** | Rendimiento y resiliencia | Evita golpear repetidamente a Croma con la misma consulta; TTL de 10 minutos es suficiente para el ciclo de vida de una demo o sesión de uso |
| **IA generativa (API de Claude)** | Interpretación asistida | Un endpoint opcional que redacta un resumen ejecutivo en lenguaje natural del expediente ya cruzado — nunca decide el nivel de riesgo, solo narra lo que el motor determinístico ya calculó; se degrada de forma segura si la API falla |
| **HTML/JS vanilla** | Frontend | Sin build step ni framework, para minimizar fricción de configuración en el tiempo disponible; se construye al final, sobre endpoints ya probados |
| **Railway o Render** | Despliegue | Alternativas con soporte para procesos Node de larga duración (a diferencia de plataformas serverless, que no llevan bien conexiones persistentes tipo MCP) |

---

## 7. Módulos del proyecto

El proyecto se divide en módulos independientes para que el desarrollo (en solitario) sea ordenado y cada pieza se pueda probar por separado antes de integrarla.

### Módulo 1 — Conexión a datos (`adapters/` + `ports/`)
**Qué hace:** define la interfaz `GovDataSource` y sus dos implementaciones (Croma real / mock de respaldo).
**Finalidad:** aislar el resto del sistema de los detalles de conexión a Croma, para poder degradar a datos de respaldo sin tocar ninguna otra parte del código si la fuente real falla.

### Módulo 2 — Motor de score (`services/scoreEngine.js`)
**Qué hace:** recibe un NIT/cédula, dispara en paralelo las llamadas a las seis fuentes relevantes, y clasifica cada hallazgo en un nivel de evidencia (alto / sin hallazgo / limpio) con su fuente y fecha.
**Finalidad:** es el corazón del producto — convierte datos crudos dispersos en un expediente legible y honesto, sin emitir veredictos.

### Módulo 3 — Búsqueda y normalización (`services/search.js`)
**Qué hace:** implementa la cascada de normalización de texto (tildes, mayúsculas, sufijos legales) y la búsqueda en fallback progresivo hasta encontrar candidatos.
**Finalidad:** que una búsqueda por nombre funcione aunque el usuario no escriba el nombre exacto como aparece en el registro oficial, sin asumir automáticamente una coincidencia ambigua.

### Módulo 4 — Seguimiento de contratos (`services/contractTracking.js`)
**Qué hace:** dado un `contract_id`, construye la línea de tiempo y la ejecución financiera, y calcula la señal de alineación tiempo/pago.
**Finalidad:** dar visibilidad de ejecución de un contrato específico sin depender de datos de avance físico que no existen como dato público estructurado.

### Módulo 5 — Oportunidades pyme (`services/opportunities.js`)
**Qué hace:** filtra procesos de contratación activos por sector/ubicación/valor, y opcionalmente adjunta el historial de ganadores previos de esa entidad.
**Finalidad:** nivelar el acceso a información de contratación estatal para pequeñas empresas — el módulo de mayor proyección de sostenibilidad institucional del proyecto.

### Módulo 6 — Resumen con IA (`services/aiSummary.js`)
**Qué hace:** envía el expediente ya cruzado (JSON estructurado) a la API de Claude y recibe un resumen ejecutivo en lenguaje natural.
**Finalidad:** hacer el expediente más accesible para alguien sin formación técnica o legal, dejando siempre visible la evidencia cruda como fuente de verdad debajo del resumen.

### Módulo 7 — Caché (`cache/memoryCache.js`)
**Qué hace:** almacena resultados de consultas recientes con expiración automática.
**Finalidad:** reducir latencia y proteger la demo de fallos por saturación o lentitud intermitente de Croma (observada durante las pruebas de este proyecto en endpoints como RUNT y SICAAC).

### Módulo 8 — API REST (`routes/api.js`)
**Qué hace:** expone los endpoints públicos (`/api/search`, `/api/entity/:nit`, `/api/entity/:nit/contract/:id`, `/api/opportunities`) que consume el frontend.
**Finalidad:** ser el único punto de contacto entre el frontend y toda la lógica de negocio de los módulos anteriores.

### Módulo 9 — Frontend (`public/`)
**Qué hace:** interfaz de usuario para las cuatro vistas del producto (inicio, ficha de expediente, seguimiento de contrato, oportunidades).
**Finalidad:** se construye **al final**, una vez los ocho módulos anteriores estén probados y devolviendo datos reales — evita invertir tiempo visual sobre un backend que aún podría cambiar de forma.

---

## 8. Principio transversal: niveles de evidencia, nunca veredictos

Todo módulo que produzca un resultado visible al usuario debe respetar esta jerarquía de presentación, validada durante el desarrollo del proyecto:

| Nivel | Significado | Ejemplo de fuente |
|---|---|---|
| 🟥 Alto | Hallazgo verificable con impacto directo (financiero, judicial, disciplinario) | RUES, Rama Judicial, Procuraduría |
| ⬜ Sin hallazgo | Fuente consultada sin resultado — no equivale a "limpio" si la fuente tiene subregistro conocido | SECOP sanciones (subregistro documentado en Circular 002/2026) |
| 🟩 Limpio | Verificación positiva explícita | Contraloría, Procuraduría sin antecedentes |

Ningún resultado debe combinarse en un score numérico único sin mostrar su nivel y fuente de origen individual.
