# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docstyles import *  # noqa

story = []
story += cover_page(
    "REQUERIMIENTOS FUNCIONALES",
    "Requerimientos Funcionales",
    "Qué debe hacer RASTRO, módulo por módulo — organizado por el mismo mapa de módulos del código fuente.",
)

story.append(h1("Convenciones"))
story.append(p(
    "Cada requerimiento tiene un identificador único (RF-NN), el módulo del sistema al que pertenece, "
    "una descripción funcional, la prioridad (Alta / Media / Baja) y el criterio de aceptación que "
    "define cuándo se considera cumplido."
))
story.append(spacer(0.3))

def module_section(title, module_code, rows):
    story.append(h1(title))
    story.append(make_table(
        ["ID", "Descripción", "Prioridad", "Criterio de aceptación"],
        rows, col_widths=[1.6*cm, 6.6*cm, 2.0*cm, 6.2*cm],
    ))
    story.append(spacer(0.3))

module_section("Módulo 1 — Búsqueda y normalización", "search", [
    ["RF-01", "El sistema debe permitir buscar por NIT, cédula o nombre de empresa/entidad desde un único campo de texto.", "Alta",
     "Un NIT o cédula válido consulta RUES directamente; un nombre pasa por una cascada de variantes de normalización."],
    ["RF-02", "Si un documento no aparece en RUES, el sistema debe ofrecerlo como candidato de persona natural (cédula) en vez de descartarlo.", "Media",
     "La búsqueda por documento nunca devuelve \"sin resultados\" para un documento válido — al menos un candidato con docType=CC."],
    ["RF-03", "Si una búsqueda por nombre encuentra más de un candidato, el sistema debe presentarlos todos para que el usuario elija, sin asumir una coincidencia.", "Alta",
     "Con >1 coincidencia, la respuesta incluye la lista completa de candidatos, no una selección automática."],
])

module_section("Módulo 2 — Expediente de riesgo (Modo Transparencia)", "scoreEngine", [
    ["RF-04", "El sistema debe cruzar en paralelo 6 fuentes oficiales (RUES, SECOP, Procuraduría, Contraloría, Rama Judicial, Contaduría) para un mismo documento.", "Alta",
     "Toda consulta de expediente incluye evidencia de las 6 fuentes, o marca explícitamente cuáles no se pudieron consultar."],
    ["RF-05", "Cada fuente debe clasificarse de forma independiente en uno de tres niveles: Alto, Sin hallazgo o Limpio.", "Alta",
     "Nunca se combinan los niveles en un puntaje o índice único; cada fuente conserva su nivel individual en la respuesta."],
    ["RF-06", "El sistema debe citar la fuente oficial y la fecha de consulta de cada hallazgo mostrado.", "Alta",
     "Toda evidencia incluye source y date visibles en la interfaz."],
    ["RF-07", "El sistema debe generar un resumen ejecutivo narrativo con IA que nunca emita un veredicto de aptitud o riesgo combinado.", "Media",
     "El resumen se genera a partir de la evidencia ya clasificada; si no hay proveedor de IA configurado, el bloque se oculta sin error visible."],
])

module_section("Módulo 3 — Seguimiento de contrato", "contractTracking", [
    ["RF-08", "El sistema debe mostrar la ejecución financiera de un contrato: valor total, facturado, pagado y pendiente.", "Alta",
     "Los 4 valores se calculan a partir de datos reales de Croma (incluyendo adiciones contractuales al valor total)."],
    ["RF-09", "El sistema debe generar una señal automática de alineación comparando avance de plazo transcurrido contra avance de pago/ejecución.", "Alta",
     "La señal clasifica en: alineado, adelantado, alerta de atraso o sin datos suficientes."],
    ["RF-10", "El sistema debe mostrar una línea de tiempo con los hitos clave del contrato: firma, inicio, adiciones, hitos del plan de entrega y fin previsto.", "Media",
     "La línea de tiempo se construye a partir de fechas reales del contrato, no de valores fijos."],
])

module_section("Módulo 4 — Modo Oportunidad", "opportunities", [
    ["RF-11", "El sistema debe listar licitaciones activas de SECOP para un conjunto de entidades contratantes de alto volumen.", "Alta",
     "El listado excluye procesos ya cerrados/adjudicados, usando la fase real del proceso."],
    ["RF-12", "El sistema debe permitir filtrar oportunidades por sector, ubicación y rango de valor.", "Alta",
     "Los tres filtros son combinables y afectan el listado devuelto por la API."],
    ["RF-13", "El sistema debe mostrar el historial de ganadores anteriores en procesos similares de la misma entidad.", "Media",
     "Cada oportunidad puede mostrar 0 o más ganadores anteriores inferidos de procesos de contratación directa cerrados."],
    ["RF-14", "El sistema debe calcular, para una entidad contratante, qué porcentaje del valor adjudicado reciente se concentra en sus principales proveedores.", "Media",
     "El cálculo usa proveedor y valor reales de una muestra de procesos recientes — nunca infiere integrantes de un consorcio a partir de su nombre."],
])

module_section("Módulo 5 — Alertas y suscripciones", "notifications", [
    ["RF-15", "El sistema debe permitir a una empresa suscribirse a alertas de oportunidad por sector y ubicación.", "Alta",
     "La preferencia se guarda asociada a la cuenta y puede activarse/desactivarse."],
    ["RF-16", "El sistema debe sondear automáticamente nuevas oportunidades y notificar por correo a las empresas suscritas que coincidan.", "Alta",
     "El sondeo corre en un intervalo configurable (15 min por defecto) y evita notificar la misma oportunidad dos veces."],
    ["RF-17", "El sistema debe mostrar a la empresa el historial de alertas que se le han enviado.", "Baja",
     "La cuenta puede consultar su propio historial de notificaciones enviadas."],
])

module_section("Módulo 6 — Cuentas de empresa", "companies", [
    ["RF-18", "El sistema debe exigir que el NIT de registro exista y esté en estado ACTIVA en RUES antes de crear una cuenta de empresa.", "Alta",
     "Un NIT inexistente o inactivo en RUES rechaza el registro con un mensaje explícito."],
    ["RF-19", "El inicio de sesión debe requerir dos pasos: credenciales, y luego un código de 6 dígitos enviado por correo.", "Alta",
     "El token de sesión solo se emite después de confirmar el código; el código vence a los 10 minutos."],
    ["RF-20", "El sistema debe permitir verificar un número de WhatsApp asociado a la cuenta mediante un código de confirmación.", "Media",
     "El número queda marcado como verificado solo tras confirmar el código correcto antes de que expire."],
])

module_section("Módulo 7 — Estudio de seguridad (persona natural)", "backgroundCheck", [
    ["RF-21", "El sistema debe permitir consultar, solo a cuentas de empresa autenticadas, un dossier de antecedentes de una persona por cédula.", "Alta",
     "El endpoint exige autenticación; una solicitud sin sesión válida se rechaza."],
    ["RF-22", "El dossier debe cruzar antecedentes penales, disciplinarios, fiscales, procesos judiciales, afiliación a salud y multas de tránsito.", "Alta",
     "Se consultan las 6 fuentes correspondientes y se presentan con el mismo modelo de niveles de evidencia del expediente de NIT."],
    ["RF-23", "El sistema nunca debe emitir un juicio de \"apto/no apto\" a partir del dossier — solo evidencia por fuente y, opcionalmente, un resumen narrativo con IA.", "Alta",
     "Ninguna respuesta de la API combina los hallazgos en una recomendación de contratación."],
])

build_pdf("02-Requerimientos-Funcionales.pdf", "Requerimientos Funcionales", story)
