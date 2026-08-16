# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docstyles import *  # noqa

story = []
story += cover_page(
    "ARQUITECTURA DE LA API DE CROMA",
    "Arquitectura de la API de Croma",
    "Protocolo, patrones de respuesta, catálogo de herramientas y capa de normalización de la fuente de datos externa que sostiene a RASTRO.",
)

story.append(h1("1. Qué es Croma"))
story.append(p(
    "Croma es un servidor MCP (Model Context Protocol) que expone registros públicos del Estado "
    "colombiano como herramientas invocables — cada fuente oficial (SECOP, RUES, Rama Judicial, "
    "Procuraduría, Contraloría, Contaduría, ADRES, SIMIT, Policía Nacional) corresponde a una o más "
    "herramientas con nombre y esquema de parámetros propios. RASTRO se conecta a Croma como cliente "
    "MCP directo desde el backend — no hay un modelo de lenguaje en el camino de cada consulta; el "
    "cliente llama a la herramienta, recibe una respuesta estructurada y la normaliza."
))

story.append(h1("2. Protocolo y transporte"))
story.append(bullets([
    "<b>Transporte:</b> MCP sobre HTTPS, vía <code>StreamableHTTPClientTransport</code> del SDK oficial (<code>@modelcontextprotocol/sdk</code>).",
    "<b>Endpoint:</b> <code>CROMA_MCP_URL</code>, por defecto <code>https://api.croma.run/mcp</code>.",
    "<b>Autenticación:</b> cabecera <code>Authorization: Bearer &lt;CROMA_API_KEY&gt;</code>.",
    "<b>Conexión persistente:</b> el backend mantiene un único cliente MCP conectado durante todo el ciclo de vida del proceso, reutilizado entre consultas — no se reconecta en cada llamada.",
    "<b>Timeout por llamada:</b> 30 segundos. Suficiente margen para fuentes lentas de alto volumen sin bloquear una consulta indefinidamente.",
]))

story.append(h1("3. Patrones de respuesta"))
story.append(h2("3.1 Respuesta síncrona"))
story.append(p(
    "La mayoría de las herramientas responden de inmediato con <code>{ status: \"completed\", data: {...} }</code>."
))
story.append(h2("3.2 Trabajo asíncrono (fuentes lentas)"))
story.append(p(
    "Algunas fuentes —Contaduría es el caso observado en producción— responden primero con "
    "<code>{ status: \"pending\", job_id, status_url }</code>. El cliente sondea <code>status_url</code> "
    "cada 1.5 segundos, hasta 20 intentos, hasta recibir <code>completed</code> o <code>failed</code>."
))
story.append(h2("3.3 \"No encontrado\" como respuesta válida"))
story.append(p(
    "Cuando el sujeto consultado no tiene registro en una fuente, Croma responde <code>found: false</code> "
    "de forma explícita — es una respuesta definitiva, no un error ni una ausencia de dato. RASTRO la "
    "trata como tal: se clasifica como \"sin hallazgo\", nunca se reintenta ni se oculta."
))
story.append(h2("3.4 Límite de tasa"))
story.append(p(
    "Croma aplica límite de tasa por organización. El error observado directamente durante el desarrollo "
    "tiene esta forma exacta:"
))
story.append(quote('"Rate limit exceeded for this organization. Try again in 13645 seconds."'))
story.append(p(
    "RASTRO no reintenta automáticamente ante este error — lo trata como cualquier otra falla del "
    "adaptador primario y degrada de inmediato a los datos de respaldo (ver sección 4), para que un "
    "límite de tasa nunca bloquee una consulta ni deje al usuario esperando."
))

story.append(h1("4. Resiliencia del lado de RASTRO"))
story.append(p(
    "Dos capas de recuperación ante fallas, en orden:"
))
story.append(bullets([
    "<b>Reintento de sesión</b> (<code>CromaAdapter._call</code>): si la llamada falla por un problema de "
    "conexión (la sesión MCP persistente puede caer por inactividad o un corte de red y quedar \"viva\" "
    "pero rota), se descarta el cliente cacheado y se reintenta una vez con una conexión nueva antes de "
    "propagar el error.",
    "<b>Degradación a datos de respaldo</b> (<code>dataSource.js</code>): si el reintento también falla "
    "—incluye el caso de límite de tasa—, la llamada cae de forma transparente a <code>MockAdapter</code>, "
    "que implementa el mismo contrato. El servicio de negocio que la invocó nunca se entera de cuál de "
    "los dos adaptadores respondió.",
]))
story += diagram_image("07-croma-ciclo-llamada.png",
                        "Figura 1 — Ciclo de vida de una llamada a Croma, incluyendo trabajo asíncrono y degradación por límite de tasa.",
                        max_width=18.5)
story.append(PageBreak())

story.append(h1("5. Catálogo de herramientas usadas por RASTRO"))
story.append(p(
    "Croma expone decenas de herramientas — incluye fuentes de Perú y México, y varias fuentes "
    "colombianas adicionales (DIAN, Consejo de Estado, SCJN, RUNT, entre otras) que RASTRO no consulta "
    "por estar fuera de su alcance de producto. Esta es la lista de las catorce herramientas que sí usa, "
    "todas mapeadas en <code>src/adapters/CromaAdapter.js</code>."
))
rows = [
    ["rues_entity_by_nit", "RUES", "Resolver un NIT: registro mercantil, estado, representantes, indicadores financieros."],
    ["rues_entities_by_name", "RUES", "Búsqueda por nombre, paginada — alimenta la cascada de normalización de search.js."],
    ["secop_processes_by_entity", "SECOP II", "Listado liviano de procesos de una entidad contratante. No trae proveedor ni valor adjudicado."],
    ["secop_process", "SECOP II", "Detalle de un proceso: adjudicaciones reales (proveedor, valor, indicador de consorcio/UT). Única fuente de este dato."],
    ["secop_contract", "SECOP II", "Seguimiento financiero de un contrato: valor, facturado, pagado, adiciones, garantías, plan de entrega."],
    ["secop_contracts_by_provider", "SECOP II", "Historial de contratos ganados por un proveedor específico."],
    ["secop_sanctions_by_provider", "SECOP II", "Sanciones contractuales registradas contra un proveedor."],
    ["procuraduria_disciplinary_records", "Procuraduría (SIRI)", "Antecedentes disciplinarios."],
    ["contraloria_fiscal_records", "Contraloría (SIBOR)", "Responsabilidad fiscal. Certifica solo personas naturales — para un NIT se marca \"no aplica\"."],
    ["rama_judicial_cases_by_entity", "Rama Judicial (CPNU)", "Procesos judiciales activos. Requiere nombre completo, no solo el número de documento."],
    ["contaduria_state_delinquent_debtors", "Contaduría (Boletín de Deudores Morosos)", "Nunca responde found:false — certifica un veredicto explícito para dos leyes distintas (901/2004 y 1066/2006)."],
    ["policia_criminal_records", "Policía Nacional", "Antecedentes penales."],
    ["adres_affiliation_status", "ADRES (BDUA)", "Afiliación vigente al sistema de salud."],
    ["simit_account_status", "SIMIT", "Multas de tránsito pendientes y acuerdos de pago."],
]
story.append(make_table(["Herramienta Croma", "Fuente oficial que representa", "Uso y notas relevantes en RASTRO"],
                          rows, col_widths=[4.3*cm, 3.6*cm, 8.2*cm], small_body=True))

story.append(h1("6. Capa de normalización — CromaAdapter.js"))
story.append(p(
    "Cada método de <code>CromaAdapter</code> cumple el mismo contrato: recibe los argumentos que define "
    "el puerto <code>GovDataSource</code>, invoca la herramienta Croma correspondiente, y traduce la "
    "forma cruda de esa herramienta (nombres de campo en inglés y snake_case, estructuras propias de "
    "cada fuente) a la forma estable que el resto de RASTRO consume. Esta capa es la única parte del "
    "sistema que conoce el formato real de Croma — si Croma cambia un nombre de campo o el proveedor de "
    "datos cambia por completo, el ajuste ocurre aquí, sin tocar <code>scoreEngine.js</code>, "
    "<code>concentration.js</code> ni ningún otro servicio de negocio."
))

story.append(h1("7. Límite estructural descubierto: consorcios y uniones temporales"))
story.append(p(
    "Durante el desarrollo se investigó directamente si Croma expone la composición de un consorcio o "
    "unión temporal como dato estructurado — necesario para construir un mapa de relaciones entre "
    "integrantes. El hallazgo, verificado en producción:"
))
story.append(bullets([
    "<code>secop_process</code> marca <code>is_group: true</code> cuando el ganador de un contrato es un "
    "consorcio o unión temporal, y entrega su nombre comercial completo en texto libre — por ejemplo "
    "<i>\"UNION TEMPORAL CALI 2024-SBS-SOLIDARIA-CHUBB-MAPFRE-PREVISORA\"</i>.",
    "Ese nombre no viene acompañado de una lista estructurada de NIT por integrante.",
    "Se buscó esa misma unión temporal por nombre en <code>rues_entities_by_name</code>: cero resultados. "
    "Confirma que, en Colombia, un consorcio o unión temporal no es persona jurídica propia y por lo "
    "tanto no se registra en cámara de comercio con sus integrantes listados — no es una limitación de "
    "Croma, es una característica del marco legal que representa.",
]))
story.append(p(
    "Por esta razón, <code>concentration.js</code> usa el proveedor y el valor real de cada adjudicación "
    "(el dato que sí es estructurado y confiable) en vez de intentar reconstruir la composición de un "
    "consorcio a partir de su nombre en texto libre — que produciría un dato adivinado, no verificado, "
    "en contradicción directa con el principio de evidencia trazable del producto."
))

build_pdf("07-Arquitectura-API-Croma.pdf", "Arquitectura de la API de Croma", story)
