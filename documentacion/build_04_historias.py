# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docstyles import *  # noqa
from reportlab.platypus import KeepTogether

story = []
story += cover_page(
    "HISTORIAS DE USUARIO",
    "Historias de Usuario",
    "Formato Como / Quiero / Para, con criterios de aceptación — organizadas por perfil de usuario.",
)

def story_card(code, role, want, purpose, criteria):
    block = []
    block.append(h3(f"{code} — Como {role}"))
    block.append(p(f'<b>Quiero</b> {want}'))
    block.append(p(f'<b>Para</b> {purpose}'))
    crit_html = "<br/>".join([f"✓ {c}" for c in criteria])
    block.append(Paragraph(crit_html, STYLES["BodySmall"]))
    block.append(rule())
    return KeepTogether(block)

story.append(h1("Perfil: Ciudadano / Periodista / Veeduría"))
story.append(story_card(
    "US-01", "periodista de investigación",
    "buscar una empresa o persona por NIT, cédula o nombre desde una sola caja de búsqueda",
    "no tener que saber de antemano en qué sistema oficial está registrada",
    ["La búsqueda acepta indistintamente NIT, cédula o texto libre de nombre.",
     "Si hay varias coincidencias por nombre, se me muestran todas para elegir."]
))
story.append(story_card(
    "US-02", "veedor ciudadano",
    "ver el expediente de riesgo de un contratista con cada hallazgo mostrando su fuente y fecha",
    "poder verificar la información yo mismo y citarla en mi investigación",
    ["Cada elemento de evidencia muestra la fuente oficial y la fecha de consulta.",
     "Ningún hallazgo se presenta sin poder rastrear de dónde salió."]
))
story.append(story_card(
    "US-03", "ciudadano sin conocimiento técnico",
    "entender qué significa \"sin hallazgo\" versus \"limpio\"",
    "no asumir que la ausencia de un registro es lo mismo que una verificación positiva",
    ["La interfaz explica explícitamente la diferencia entre los tres niveles de evidencia.",
     "El texto de \"sin hallazgo\" menciona el subregistro documentado en algunas fuentes."]
))
story.append(story_card(
    "US-04", "periodista",
    "consultar el seguimiento financiero y de plazos de un contrato específico",
    "detectar si un contrato muestra señales de atraso o sobrecosto sin tener que leer actas manualmente",
    ["El seguimiento muestra valor total, facturado, pagado y pendiente.",
     "Existe una señal explícita cuando el avance financiero y el físico están desalineados."]
))

story.append(h1("Perfil: Pyme"))
story.append(story_card(
    "US-05", "dueño de una pyme de construcción",
    "ver las licitaciones activas filtradas por mi sector y ubicación",
    "no perder tiempo revisando procesos que no aplican a mi negocio",
    ["Los filtros de sector, ubicación y valor son combinables.",
     "Solo se muestran procesos con fase abierta, no los ya adjudicados."]
))
story.append(story_card(
    "US-06", "pyme que nunca ha contratado con el Estado",
    "ver quién ganó procesos similares anteriores de la misma entidad",
    "entender qué tipo de proveedor suele ganar antes de invertir tiempo en una propuesta",
    ["Cada oportunidad puede mostrar ganadores anteriores inferidos de procesos cerrados similares."]
))
story.append(story_card(
    "US-07", "pyme con poco tiempo para monitorear SECOP",
    "suscribirme para recibir un correo automático cuando salga una licitación nueva de mi interés",
    "enterarme a tiempo sin tener que revisar la página todos los días",
    ["La suscripción permite elegir sector y ubicación.",
     "Recibo la alerta al mismo tiempo que cualquier otra empresa suscrita — nadie tiene ventaja de tiempo."]
))
story.append(story_card(
    "US-08", "pyme evaluando en qué entidad enfocar sus esfuerzos comerciales",
    "ver qué tan concentrada está la contratación de una entidad en pocos proveedores",
    "decidir si vale la pena competir ahí o buscar otra entidad con más rotación de contratistas",
    ["El reporte muestra el porcentaje del valor adjudicado que se concentra en los proveedores principales, con la fuente y el tamaño de la muestra analizada."]
))

story.append(h1("Perfil: Empresa (cuenta autenticada)"))
story.append(story_card(
    "US-09", "responsable de contratación de una empresa",
    "registrar una cuenta usando el NIT de mi empresa",
    "acceder a las funciones exclusivas para empresas verificadas",
    ["El registro rechaza un NIT que no exista o no esté activo en RUES.",
     "El nombre de la empresa se toma del registro oficial, no de lo que yo escriba."]
))
story.append(story_card(
    "US-10", "usuario registrado",
    "iniciar sesión con un segundo paso de verificación por correo",
    "tener una capa extra de seguridad sobre mi cuenta",
    ["El sistema pide un código de 6 dígitos enviado por correo antes de entregar la sesión.",
     "El código vence a los 10 minutos y no se puede reutilizar tras verificarse."]
))
story.append(story_card(
    "US-11", "encargado de RRHH",
    "consultar el estudio de seguridad de una persona por su cédula antes de contratarla",
    "conocer antecedentes penales, disciplinarios, fiscales, judiciales, de salud y de tránsito en un solo lugar",
    ["La consulta exige estar autenticado como empresa.",
     "Se me advierte sobre las implicaciones de la Ley de Habeas Data antes de consultar.",
     "El resultado nunca me dice si la persona es \"apta\" — solo evidencia por fuente."]
))
story.append(story_card(
    "US-12", "usuario de la cuenta de empresa",
    "verificar un número de WhatsApp con un código de confirmación",
    "tener ese canal listo para futuras alertas",
    ["Se genera un código de 6 dígitos por número solicitado.",
     "El número queda marcado como verificado solo tras confirmar el código correcto y vigente."]
))

build_pdf("04-Historias-de-Usuario.pdf", "Historias de Usuario", story)
