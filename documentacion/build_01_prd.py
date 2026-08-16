# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docstyles import *  # noqa

story = []
story += cover_page(
    "PRODUCT REQUIREMENTS DOCUMENT",
    "RASTRO",
    "Motor de transparencia en contratación pública colombiana — expedientes de riesgo trazables y oportunidades para pymes, a partir de fuentes oficiales.",
)

# 1. Resumen ejecutivo
story.append(h1("1. Resumen ejecutivo"))
story.append(p(
    "RASTRO es una plataforma que cruza en paralelo seis fuentes oficiales del Estado colombiano "
    "(SECOP, RUES, Rama Judicial, Procuraduría, Contraloría y Contaduría) para generar, en segundos, "
    "un expediente de riesgo trazable de cualquier contratista o entidad estatal. Con el mismo motor "
    "de datos, genera alertas de oportunidad de negocio para pequeñas y medianas empresas que no "
    "tienen la capacidad de monitorear manualmente las licitaciones activas de SECOP."
))
story.append(p(
    "El proyecto nace en el hackathon Croma / Datos Abiertos Colombia, usando la API de Croma como "
    "fuente unificada de acceso a los registros públicos colombianos. Su valor no está solo en mostrar "
    "datos que ya son públicos por ley, sino en cruzarlos, normalizarlos y presentarlos con una "
    "disciplina de evidencia que ningún portal gubernamental ofrece hoy de forma unificada."
))
story.append(quote(
    "Principio rector del producto: RASTRO nunca emite un veredicto. Cada hallazgo se presenta como "
    "un nivel de evidencia con su fuente oficial citada y su fecha de consulta, preservando la "
    "presunción de inocencia — nunca se combina en un score o índice de riesgo único."
))

# 2. Problema y oportunidad
story.append(h1("2. Problema y oportunidad"))
story.append(h2("2.1 El problema"))
story.append(bullets([
    "La información de contratación pública en Colombia es legalmente pública, pero está fragmentada "
    "en al menos seis sistemas distintos (SECOP, RUES, Rama Judicial, Procuraduría, Contraloría, "
    "Contaduría), cada uno con su propia interfaz, formato y curva de aprendizaje.",
    "Periodistas, veedurías ciudadanas y organismos de control invierten horas cruzando manualmente "
    "estas fuentes para investigar un solo contratista — un costo que no todos pueden pagar.",
    "Las pymes colombianas pierden oportunidades de negocio con el Estado porque no tienen personal "
    "dedicado a monitorear SECOP a diario, mientras que empresas grandes sí cuentan con ese recurso — "
    "una asimetría de información que perpetúa la concentración de la contratación pública.",
    "Las empresas que necesitan verificar antecedentes de una persona antes de contratarla (estudios "
    "de seguridad) hoy dependen de gestores manuales o de servicios privados costosos y opacos.",
]))
story.append(h2("2.2 La oportunidad"))
story.append(p(
    "Croma expone estas fuentes oficiales de forma programática. RASTRO es la capa de producto que "
    "convierte ese acceso técnico en una herramienta usable por tres audiencias distintas — "
    "transparencia ciudadana, oportunidad para pymes y verificación empresarial — con el mismo motor "
    "de datos subyacente, sin duplicar esfuerzo de ingeniería."
))

# 3. Visión del producto
story.append(h1("3. Visión del producto"))
story.append(p(
    "Ser la capa de confianza sobre los datos abiertos de contratación pública en Colombia: el lugar "
    "al que periodistas, veedurías, pymes y empresas acuden para entender rápido y de forma verificable "
    "quién contrata con el Estado, en qué condiciones, y qué señales de riesgo u oportunidad existen — "
    "sin que la herramienta misma se convierta en juez."
))
story.append(h2("3.1 Diferenciadores clave"))
story.append(bullets([
    "<b>Disciplina de evidencia, no de veredicto:</b> cada fuente se muestra de forma independiente "
    "con su propio nivel (Alto / Sin hallazgo / Limpio) — nunca un puntaje combinado, a diferencia de "
    "los checkers de riesgo genéricos.",
    "<b>Un mismo motor, dos audiencias:</b> el motor de cruce de datos sirve tanto para investigar "
    "riesgo (Modo Transparencia) como para descubrir oportunidad (Modo Oportunidad) — sin duplicar "
    "infraestructura.",
    "<b>Resiliencia por diseño:</b> arquitectura de puertos y adaptadores con degradación automática a "
    "un adaptador de respaldo si la fuente en vivo falla, para que el producto nunca se caiga por un "
    "corte externo.",
    "<b>Señal de concentración de contratistas:</b> en vez de adivinar la composición de un consorcio "
    "a partir de texto libre, mide qué tan repartidas están las adjudicaciones reales de una entidad "
    "entre proveedores — dato verificable, no un mapa inventado.",
]))

# 4. Usuarios objetivo
story.append(h1("4. Usuarios objetivo"))
rows = [
    ["Periodista / Veeduría ciudadana", "Investigar de forma rápida y verificable el historial de un contratista o entidad pública.", "Público, sin registro"],
    ["Ciudadano", "Entender en qué se está gastando el presupuesto público en su zona.", "Público, sin registro"],
    ["Pyme", "Encontrar licitaciones activas que coincidan con su sector, sin monitorear SECOP a diario.", "Público + suscripción por correo"],
    ["Encargado de contratación / RRHH de una empresa", "Verificar antecedentes de una persona natural antes de contratarla.", "Cuenta de empresa verificada por NIT"],
    ["Cámara de comercio / gremio sectorial", "Ofrecer a sus afiliados acceso a alertas de oportunidad como beneficio institucional.", "Cliente institucional (roadmap B2B)"],
    ["Estado (control interno)", "Mismo acceso de Modo Transparencia, con rol provisto manualmente.", "Cuenta con rol \"estado\""],
]
story.append(make_table(["Perfil", "Necesidad principal", "Nivel de acceso"], rows,
                          col_widths=[4.6*cm, 7.4*cm, 4.5*cm]))

# 5. Alcance
story.append(h1("5. Alcance"))
story.append(h2("5.1 Dentro de alcance (MVP de hackathon)"))
story.append(bullets([
    "Modo Transparencia: búsqueda y expediente de riesgo por NIT/cédula/nombre, cruzando 6 fuentes.",
    "Seguimiento de contrato individual: ejecución financiera, línea de tiempo, señal de alineación plazo-vs-pago.",
    "Modo Oportunidad: licitaciones activas filtrables, ganadores anteriores, concentración de contratistas por entidad.",
    "Apartado Empresas: registro verificado por NIT, login en dos pasos, suscripción a alertas, estudio de seguridad por cédula, verificación de WhatsApp.",
    "Resumen ejecutivo narrativo generado por IA (Claude), nunca un veredicto — se degrada de forma segura si no hay proveedor configurado.",
]))
story.append(h2("5.2 Fuera de alcance (explícito)"))
story.append(bullets([
    "Verificación de identidad del representante legal al registrar una empresa (fuera del alcance de un hackathon).",
    "Flujo de consentimiento del titular para el estudio de seguridad, requerido por la Ley de Habeas Data (Ley 1581/2012) antes de un uso en producción real.",
    "Envío real de WhatsApp y correo en el entorno de demo (se usan adaptadores simulados, listos para conectar un proveedor real vía variables de entorno).",
    "Cobro / facturación a clientes institucionales (roadmap post-hackathon).",
]))

# 6. Objetivos y métricas
story.append(h1("6. Objetivos y métricas de éxito"))
rows = [
    ["Tiempo de respuesta de un expediente", "< 10 s con las 6 fuentes en paralelo (con caché de 10 min)"],
    ["Disponibilidad ante fallo de Croma", "100% — degradación automática a datos de respaldo, sin caída del servicio"],
    ["Cobertura de fuentes cruzadas por expediente", "6 de 6 fuentes oficiales consultadas por consulta"],
    ["Honestidad de la evidencia", "0 casos de combinación de hallazgos en un score único"],
    ["Alcance del Modo Oportunidad", "5 entidades contratantes de alto volumen monitoreadas por defecto, ampliable"],
]
story.append(make_table(["Objetivo", "Métrica / criterio"], rows, col_widths=[7.5*cm, 9*cm]))

# 7. Riesgos y supuestos
story.append(h1("7. Riesgos y supuestos"))
story.append(bullets([
    "<b>Riesgo — límite de tasa de Croma:</b> el volumen de pruebas puede agotar la cuota de la API; "
    "mitigado con caché en memoria (10 min) y degradación automática a datos simulados.",
    "<b>Riesgo — subregistro de las fuentes oficiales:</b> \"sin hallazgo\" no equivale a \"limpio\" — "
    "el producto lo comunica explícitamente en cada nivel de evidencia.",
    "<b>Riesgo legal — Habeas Data:</b> el estudio de seguridad expone datos sensibles; el registro de "
    "empresa exige NIT activo en RUES, pero no implementa aún consentimiento del titular ni auditoría "
    "de acceso — marcado como bloqueante antes de producción real.",
    "<b>Supuesto:</b> Croma seguirá siendo la fuente unificada de acceso a los seis sistemas oficiales "
    "durante la vida del proyecto; un cambio de proveedor de datos requeriría un adaptador nuevo, no "
    "un rediseño (gracias al patrón de puertos y adaptadores).",
]))

# 8. Glosario
story.append(h1("8. Glosario"))
rows = [
    ["Expediente", "Ficha de riesgo generada para un NIT, cédula o nombre, con evidencia por fuente."],
    ["Nivel de evidencia", "Clasificación por fuente: Alto (🟥), Sin hallazgo (⬜) o Limpio (🟩) — nunca combinados."],
    ["Adaptador de respaldo", "Fuente de datos simulada que reemplaza a Croma automáticamente si esta falla."],
    ["Concentración de contratistas", "Medida de qué % del valor adjudicado reciente de una entidad va a pocos proveedores."],
    ["Modo Transparencia", "Búsqueda pública de expedientes de riesgo por NIT/cédula/nombre."],
    ["Modo Oportunidad", "Exploración de licitaciones activas de SECOP, orientada a pymes."],
]
story.append(make_table(["Término", "Definición"], rows, col_widths=[4.5*cm, 12*cm]))

build_pdf("01-PRD-Product-Requirements-Document.pdf", "Product Requirements Document", story)
