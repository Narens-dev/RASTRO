# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docstyles import *  # noqa

story = []
story += cover_page(
    "DIAGRAMAS UML",
    "Diagramas UML",
    "Casos de uso, clases y secuencia de los flujos principales de RASTRO.",
)

story.append(h1("1. Diagrama de casos de uso"))
story.append(p(
    "Cuatro actores acceden a subconjuntos superpuestos de funcionalidad: el público general "
    "(ciudadano, periodista, veeduría) y el Estado comparten el Modo Transparencia; las pymes usan "
    "el Modo Oportunidad; las empresas verificadas acceden además a funciones autenticadas."
))
story += diagram_image("01-casos-de-uso.png", "Figura 1 — Casos de uso por actor.")
story.append(PageBreak())

story.append(h1("2. Diagrama de clases"))
story.append(p(
    "Refleja el patrón de puertos y adaptadores: <code>GovDataSource</code>, <code>EmailPort</code> y "
    "<code>WhatsAppPort</code> son interfaces; los servicios de negocio dependen únicamente de ellas, "
    "nunca de <code>CromaAdapter</code> o <code>MockAdapter</code> directamente. <code>DataSource</code> "
    "es la composición central que decide el adaptador activo y aplica caché."
))
story += diagram_image("02-diagrama-clases.png", "Figura 2 — Clases y servicios principales.", max_width=18.5)
story.append(PageBreak())

story.append(h1("3. Diagramas de secuencia"))

story.append(h2("3.1 Búsqueda y expediente de riesgo"))
story.append(p(
    "Desde que el usuario escribe una búsqueda hasta que ve el expediente clasificado por niveles de "
    "evidencia, incluyendo la degradación automática si Croma falla."
))
story += diagram_image("03-secuencia-expediente.png", "Figura 3 — Búsqueda → Expediente (Modo Transparencia).")
story.append(PageBreak())

story.append(h2("3.2 Login en dos pasos"))
story.append(p(
    "El token de sesión solo se emite tras confirmar el código enviado por correo — nunca en el "
    "primer paso, aunque las credenciales sean correctas."
))
story += diagram_image("04-secuencia-login-2fa.png", "Figura 4 — Verificación en dos pasos al iniciar sesión.")
story.append(PageBreak())

story.append(h2("3.3 Alertas automáticas de oportunidad"))
story.append(p(
    "El sondeo corre en segundo plano cada 15 minutos, sin intervención del usuario, y evita "
    "duplicar alertas ya enviadas."
))
story += diagram_image("05-secuencia-alertas-oportunidad.png", "Figura 5 — Sondeo y alerta automática de oportunidades.")

build_pdf("08-Diagramas-UML.pdf", "Diagramas UML", story)
