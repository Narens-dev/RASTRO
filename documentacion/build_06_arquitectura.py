# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docstyles import *  # noqa

story = []
story += cover_page(
    "ARQUITECTURA DEL SISTEMA",
    "Arquitectura del Sistema",
    "Vista de contenedores, patrón de puertos y adaptadores, resiliencia y despliegue.",
)

story.append(h1("1. Vista general"))
story.append(p(
    "RASTRO se compone de dos procesos independientes que se despliegan por separado: un backend "
    "Express que expone una API REST pura (sin servir HTML), y un frontend Next.js que renderiza la "
    "interfaz y actúa como proxy autenticado hacia esa API. El backend nunca es alcanzado directamente "
    "por el navegador — todas las llamadas del cliente van a rutas propias <code>/api/*</code> del frontend, que "
    "reenvían la petición al backend agregando las cabeceras de autenticación necesarias."
))
story += diagram_image("06-arquitectura-sistema.png",
                        "Figura 1 — Vista de contenedores de RASTRO.")

story.append(h1("2. Patrón de puertos y adaptadores"))
story.append(p(
    "El núcleo de negocio (servicios en <code>src/services/</code>) nunca depende de una implementación concreta "
    "de acceso a datos externos — depende de interfaces (\"puertos\"): <b>GovDataSource</b> para las "
    "fuentes oficiales, <b>EmailPort</b> para el envío de correo y <b>WhatsAppPort</b> para WhatsApp. "
    "Cada puerto tiene al menos dos adaptadores: uno real (Croma) y uno simulado (Mock), que implementan "
    "exactamente la misma interfaz."
))
story.append(p(
    "Esto tiene dos consecuencias directas en el comportamiento del producto: primero, se puede "
    "reemplazar por completo la fuente de datos, el proveedor de correo o el de WhatsApp cambiando "
    "una variable de entorno y un archivo de adaptador nuevo, sin tocar ningún servicio de negocio. "
    "Segundo, y más importante en producción, permite degradar automáticamente ante una falla externa "
    "sin que el resto del sistema se entere."
))

story.append(h2("2.1 Composición y resiliencia — <code>dataSource.js</code>"))
story.append(p(
    "Es el único punto donde se decide qué adaptador de <i>GovDataSource</i> está activo. Envuelve "
    "cada uno de sus 13 métodos con dos capas:"
))
story.append(bullets([
    "<b>Caché en memoria</b> con TTL de 10 minutos, por método y argumentos — evita golpear a Croma "
    "con la misma consulta repetida durante una sesión de uso o una demo.",
    "<b>Degradación automática</b>: si la llamada al adaptador primario (Croma) falla, se reintenta "
    "una vez con una conexión nueva y, si sigue fallando, cae de forma transparente al adaptador de "
    "respaldo (Mock) — sin lanzar error hacia el servicio que la llamó.",
]))
story.append(p(
    "El estado de salud se calcula sobre una ventana móvil de las últimas 12 llamadas de cualquier "
    "método: si más de la mitad de esas llamadas cayeron a respaldo, <code>source.degraded</code> se reporta como "
    "verdadero — visible en <code>GET /api/meta</code> para que el frontend (y el equipo) sepan en qué modo está "
    "operando el sistema en cada momento."
))

story.append(h2("2.2 Adaptadores simulados como ciudadanos de primera clase"))
story.append(p(
    "Los adaptadores Mock no son solo un recurso de pruebas: son la razón por la que el producto nunca "
    "se cae por completo. <code>MockAdapter</code> responde con un conjunto curado de entidades, oportunidades y "
    "contratos de ejemplo. <code>MockEmailAdapter</code> y <code>MockWhatsAppAdapter</code> registran cada envío en "
    "<code>data/outbox_emails.json</code> / <code>data/outbox_whatsapp.json</code> en vez de contactar un proveedor real, "
    "y devuelven el código/mensaje generado directamente en la respuesta de la API cuando no hay un "
    "proveedor real configurado — marcado explícitamente como \"modo demo\" en la interfaz."
))

story.append(h1("3. Módulos del backend"))
rows = [
    ["search.js", "Búsqueda y cascada de normalización de nombre → NIT/cédula."],
    ["scoreEngine.js", "Construye el expediente de riesgo cruzando 6 fuentes en paralelo."],
    ["contractTracking.js", "Ejecución financiera, línea de tiempo y señal de alineación de un contrato."],
    ["opportunities.js", "Licitaciones activas por entidades semilla, filtros y ganadores anteriores."],
    ["concentration.js", "Concentración de adjudicaciones recientes por proveedor, con datos reales."],
    ["backgroundCheck.js", "Dossier de persona natural (estudio de seguridad), acceso restringido."],
    ["companies.js", "Cuentas de empresa: registro, login en dos pasos, suscripción, verificación de WhatsApp."],
    ["notifications.js", "Sondeo periódico de oportunidades nuevas y disparo de alertas por correo."],
    ["aiSummary.js", "Resumen ejecutivo narrativo con Claude, nunca un veredicto."],
    ["evidence.js / normalize.js", "Utilidades compartidas de clasificación de evidencia y normalización de texto."],
]
story.append(make_table(["Módulo", "Responsabilidad"], rows, col_widths=[4.6*cm, 11.9*cm]))

story.append(h1("4. Persistencia"))
story.append(p(
    "RASTRO es mayormente <i>stateless</i>: la información de contratación se recalcula en cada "
    "consulta contra Croma (con caché de corta duración). Lo que sí necesita sobrevivir a un reinicio "
    "del proceso se guarda en archivos JSON planos (<code>src/store/jsonStore.js</code>), suficiente para el "
    "volumen de un hackathon/demo:"
))
story.append(bullets([
    "<code>data/companies.json</code> — cuentas de empresa, suscripciones, estado de verificación de WhatsApp.",
    "<code>data/outbox_emails.json</code> y <code>data/outbox_whatsapp.json</code> — historial de envíos simulados.",
    "<code>data/seen_opportunities.json</code> — oportunidades ya notificadas, para no alertar dos veces.",
]))
story.append(p(
    "El camino natural de evolución si el volumen de empresas registradas lo justifica es migrar esta "
    "capa a una base de datos relacional (Postgres), sin cambiar la interfaz que ya usan los servicios."
))

story.append(h1("5. Despliegue"))
story.append(p(
    "Los dos procesos se despliegan y escalan de forma independiente. El backend (<code>server.js</code>) "
    "corre como un proceso Node de larga duración (necesario para mantener viva la conexión MCP "
    "persistente con Croma y el sondeo periódico de oportunidades). El frontend (<code>web/</code>) es "
    "una aplicación Next.js estándar, desplegable en Vercel, que se comunica con el backend a través de "
    "la variable de entorno <code>RASTRO_API_URL</code>."
))

story.append(h1("6. Apéndice — API REST de RASTRO"))
story.append(p(
    "Catálogo completo de los endpoints que expone el backend bajo <code>/api</code>. Todos responden "
    "JSON; ninguno sirve HTML. Los marcados como protegidos exigen la cabecera "
    "<code>Authorization: Bearer &lt;token&gt;</code>, con el token emitido por "
    "<code>POST /api/companies/login/verify</code>. Para el detalle de la arquitectura de la fuente de "
    "datos externa que consumen estos endpoints, ver el documento \"Arquitectura de la API de Croma\"."
))
rows = [
    ["GET", "/api/meta", "No", "Estado de la fuente de datos, sectores, ubicaciones y entidades semilla"],
    ["GET", "/api/search?q=", "No", "Búsqueda por NIT, cédula o nombre, con cascada de normalización"],
    ["GET", "/api/entity/:docType/:doc", "No", "Expediente de riesgo — cruza seis fuentes oficiales en paralelo"],
    ["GET", "/api/entity/:docType/:doc/summary", "No", "Resumen ejecutivo con inteligencia artificial sobre ese expediente"],
    ["GET", "/api/contract/:contractId", "No", "Seguimiento financiero, línea de tiempo y señal de alineación de un contrato"],
    ["GET", "/api/opportunities", "No", "Licitaciones activas. Filtros: sector, location, minValue, maxValue, winners"],
    ["GET", "/api/concentration/:nit", "No", "Concentración de adjudicaciones recientes de una entidad contratante"],
    ["POST", "/api/companies/register", "No", "Crea una cuenta de empresa; exige un NIT activo en RUES"],
    ["POST", "/api/companies/login", "No", "Primer paso del inicio de sesión: valida credenciales y envía un código por correo"],
    ["POST", "/api/companies/login/verify", "No", "Segundo paso: confirma el código y entrega el token de sesión"],
    ["GET", "/api/companies/me", "Sí", "Datos de la cuenta autenticada"],
    ["PUT", "/api/companies/me/subscription", "Sí", "Actualiza las preferencias de alerta"],
    ["GET", "/api/companies/me/notifications", "Sí", "Historial de alertas enviadas a la cuenta"],
    ["POST", "/api/companies/me/whatsapp/request-code", "Sí", "Genera y envía un código de verificación de WhatsApp"],
    ["POST", "/api/companies/me/whatsapp/verify", "Sí", "Confirma el código y marca el número como verificado"],
    ["POST", "/api/opportunities/poll", "Sí", "Fuerza el sondeo de oportunidades nuevas"],
    ["GET", "/api/personas/:docType/:doc", "Sí", "Estudio de seguridad de una persona natural por cédula"],
    ["GET", "/api/personas/:docType/:doc/summary", "Sí", "Resumen ejecutivo con inteligencia artificial sobre ese estudio"],
]
story.append(make_table(["Método", "Ruta", "Protegido", "Descripción"], rows,
                          col_widths=[1.6*cm, 5.6*cm, 1.9*cm, 7.7*cm], small_body=True))

build_pdf("06-Arquitectura-del-Sistema.pdf", "Arquitectura del Sistema", story)
