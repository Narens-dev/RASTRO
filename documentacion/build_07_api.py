# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docstyles import *  # noqa

story = []
story += cover_page(
    "ARQUITECTURA DE LA API",
    "Arquitectura de la API",
    "Convenciones REST, autenticación y catálogo completo de endpoints del backend.",
)

story.append(h1("1. Convenciones generales"))
story.append(bullets([
    "Base URL del backend: <code>http://localhost:3000</code> en desarrollo (variable <code>RASTRO_API_URL</code> en el frontend).",
    "Todas las rutas cuelgan de <code>/api</code>. Cualquier otra ruta responde <code>404</code> con <code>{\"error\":\"not_found\"}</code> — el backend no sirve HTML.",
    "El frontend nunca llama a este backend directamente desde el navegador: siempre pasa por sus propias rutas <code>app/api/**</code>, que validan la entrada con <b>zod</b> y agregan la cabecera de autenticación.",
    "Envelope de respuesta del lado del frontend (Next.js): éxito → <code>{ data: ... }</code>; error → <code>{ error: { code, message, issues? } }</code>. El backend Express responde el payload plano o <code>{ error: string }</code>.",
    "Autenticación: JWT firmado (7 días de expiración) en cabecera <code>Authorization: Bearer &lt;token&gt;</code>. El navegador nunca ve el token — vive en una cookie <code>httpOnly</code> puesta por el frontend.",
]))

story.append(h1("2. Catálogo de endpoints"))

def api_table(rows):
    story.append(make_table(
        ["Método", "Ruta", "Auth", "Descripción"],
        rows, col_widths=[1.7*cm, 6.3*cm, 1.6*cm, 6.9*cm],
    ))
    story.append(spacer(0.25))

story.append(h2("2.1 Meta y búsqueda"))
api_table([
    ["GET", "/api/meta", "No", "Estado de la fuente de datos, sectores, ubicaciones y entidades semilla."],
    ["GET", "/api/search?q=", "No", "Búsqueda cascada por NIT/cédula (directo a RUES) o por nombre (variantes de normalización)."],
])

story.append(h2("2.2 Modo Transparencia"))
api_table([
    ["GET", "/api/entity/:docType/:doc", "No", "Expediente de riesgo — cruza 6 fuentes oficiales en paralelo. docType: NIT, CC o CE."],
    ["GET", "/api/entity/:docType/:doc/summary", "No", "Resumen ejecutivo narrativo con IA sobre ese mismo expediente."],
    ["GET", "/api/contract/:contractId", "No", "Seguimiento financiero, línea de tiempo y señal de alineación de un contrato SECOP."],
])

story.append(h2("2.3 Modo Oportunidad"))
api_table([
    ["GET", "/api/opportunities", "No", "Licitaciones activas de las entidades semilla. Filtros: sector, location, minValue, maxValue, winners=true."],
    ["GET", "/api/concentration/:nit", "No", "Concentración de adjudicaciones recientes de una entidad contratante, por proveedor real."],
    ["POST", "/api/opportunities/poll", "Sí", "Dispara manualmente el sondeo de oportunidades nuevas (uso: demo/cron externo)."],
])

story.append(h2("2.4 Cuentas de empresa"))
api_table([
    ["POST", "/api/companies/register", "No", "Registra una cuenta; exige NIT activo en RUES."],
    ["POST", "/api/companies/login", "No", "Paso 1 del login: valida credenciales y envía código de 6 dígitos por correo. No emite token."],
    ["POST", "/api/companies/login/verify", "No", "Paso 2 del login: confirma el código y emite el token de sesión."],
    ["GET", "/api/companies/me", "Sí", "Datos públicos de la cuenta autenticada."],
    ["PUT", "/api/companies/me/subscription", "Sí", "Actualiza preferencias de alerta (activo, sector, ubicación)."],
    ["GET", "/api/companies/me/notifications", "Sí", "Historial de alertas de oportunidad enviadas a esa cuenta."],
    ["POST", "/api/companies/me/whatsapp/request-code", "Sí", "Genera y envía un código de verificación de WhatsApp."],
    ["POST", "/api/companies/me/whatsapp/verify", "Sí", "Confirma el código y marca el número como verificado."],
])

story.append(h2("2.5 Estudio de seguridad (persona natural)"))
api_table([
    ["GET", "/api/personas/:docType/:doc", "Sí", "Dossier de antecedentes por cédula. docType: CC o CE."],
    ["GET", "/api/personas/:docType/:doc/summary", "Sí", "Resumen ejecutivo narrativo con IA sobre ese dossier."],
])

story.append(h1("3. Contratos de datos clave"))
story.append(h2("3.1 Expediente"))
story.append(p(
    "<code>{ doc, docType, name, evidence: [{ source, level, summary, date, detail }], "
    "counts: { alto, sin_hallazgo, limpio }, contractHistory: [...] }</code>. El campo <code>level</code> "
    "solo puede ser <code>\"alto\"</code>, <code>\"sin_hallazgo\"</code> o <code>\"limpio\"</code> — nunca "
    "un número. No existe ningún campo de puntaje agregado en la respuesta."
))
story.append(h2("3.2 Seguimiento de contrato"))
story.append(p(
    "<code>{ contract: { object, entity, provider, totalValueFormatted, invoicedFormatted, "
    "paidToDateFormatted, pendingFormatted, deliveryPlan, additions, guarantees }, "
    "alignment: { status, label, detail, timeElapsedPct, paidPct, physicalProgressPct } }</code>. "
    "<code>alignment.status</code> es uno de: <code>alineado</code>, <code>adelantado</code>, "
    "<code>alerta_atraso</code>, <code>sin_datos</code>."
))
story.append(h2("3.3 Concentración de contratistas"))
story.append(p(
    "<code>{ entityNit, entityName, sampleSize, processesAwarded, totalValueAnalyzed, "
    "topProviders: [{ name, document, contractCount, totalValue, pctOfValue, hasGroupContract }], "
    "top3ConcentrationPct }</code>. Siempre incluye <code>sampleSize</code> y <code>processesAwarded</code> "
    "para que la interfaz pueda comunicar honestamente sobre qué muestra se calculó el porcentaje."
))

build_pdf("07-Arquitectura-de-la-API.pdf", "Arquitectura de la API", story)
