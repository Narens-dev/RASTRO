# -*- coding: utf-8 -*-
"""Estilos y helpers compartidos para todos los PDFs de documentación de RASTRO."""

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image,
    PageBreak, HRFlowable, KeepTogether, ListFlowable, ListItem,
)
from reportlab.pdfgen import canvas as pdfcanvas
import os

PRIMARY = colors.HexColor("#046A38")
PRIMARY_DARK = colors.HexColor("#033D21")
GOLD = colors.HexColor("#C9A227")
INK = colors.HexColor("#14110F")
BG = colors.HexColor("#F7F5F0")
GREY = colors.HexColor("#6f7a6f")
LIGHT_GREEN = colors.HexColor("#E8F3EC")
LIGHT_GREY = colors.HexColor("#F0EEE9")
WHITE = colors.white

DOC_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_TEXT = "RASTRO"

_base = getSampleStyleSheet()

STYLES = {
    "CoverTitle": ParagraphStyle("CoverTitle", parent=_base["Title"], fontName="Helvetica-Bold",
                                  fontSize=30, leading=36, textColor=INK, spaceAfter=6, alignment=TA_LEFT),
    "CoverSubtitle": ParagraphStyle("CoverSubtitle", parent=_base["Normal"], fontName="Helvetica",
                                     fontSize=15, leading=20, textColor=PRIMARY_DARK, spaceAfter=4),
    "CoverMeta": ParagraphStyle("CoverMeta", parent=_base["Normal"], fontName="Helvetica",
                                 fontSize=10.5, leading=15, textColor=GREY),
    "H1": ParagraphStyle("H1", parent=_base["Heading1"], fontName="Helvetica-Bold", fontSize=18,
                          leading=22, textColor=PRIMARY_DARK, spaceBefore=18, spaceAfter=10,
                          borderPadding=0),
    "H2": ParagraphStyle("H2", parent=_base["Heading2"], fontName="Helvetica-Bold", fontSize=13.5,
                          leading=17, textColor=INK, spaceBefore=14, spaceAfter=7),
    "H3": ParagraphStyle("H3", parent=_base["Heading3"], fontName="Helvetica-Bold", fontSize=11.5,
                          leading=15, textColor=PRIMARY_DARK, spaceBefore=10, spaceAfter=5),
    "Body": ParagraphStyle("Body", parent=_base["Normal"], fontName="Helvetica", fontSize=9.6,
                            leading=14.5, textColor=INK, spaceAfter=7, alignment=TA_LEFT),
    "BodySmall": ParagraphStyle("BodySmall", parent=_base["Normal"], fontName="Helvetica", fontSize=8.6,
                                 leading=12.5, textColor=INK, spaceAfter=5),
    "Quote": ParagraphStyle("Quote", parent=_base["Normal"], fontName="Helvetica-Oblique", fontSize=9.8,
                             leading=14.5, textColor=PRIMARY_DARK, spaceAfter=8, leftIndent=12,
                             borderColor=PRIMARY, borderWidth=0, backColor=LIGHT_GREEN,
                             borderPadding=8),
    "TableHead": ParagraphStyle("TableHead", parent=_base["Normal"], fontName="Helvetica-Bold",
                                 fontSize=8.6, leading=11, textColor=WHITE),
    "TableCell": ParagraphStyle("TableCell", parent=_base["Normal"], fontName="Helvetica", fontSize=8.4,
                                 leading=11.5, textColor=INK),
    "TableCellBold": ParagraphStyle("TableCellBold", parent=_base["Normal"], fontName="Helvetica-Bold",
                                     fontSize=8.4, leading=11.5, textColor=PRIMARY_DARK),
    "Caption": ParagraphStyle("Caption", parent=_base["Normal"], fontName="Helvetica-Oblique",
                               fontSize=8.6, leading=12, textColor=GREY, spaceBefore=4, spaceAfter=14,
                               alignment=TA_CENTER),
    "TOCEntry": ParagraphStyle("TOCEntry", parent=_base["Normal"], fontName="Helvetica", fontSize=10.5,
                                leading=20, textColor=INK),
}


def _header_footer(canvas: pdfcanvas.Canvas, doc, title: str):
    canvas.saveState()
    w, h = LETTER
    # Header bar
    canvas.setFillColor(PRIMARY_DARK)
    canvas.rect(0, h - 1.1 * cm, w, 1.1 * cm, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(1.8 * cm, h - 0.78 * cm, "RASTRO")
    canvas.setFont("Helvetica", 8.3)
    canvas.drawRightString(w - 1.8 * cm, h - 0.78 * cm, title)
    # Footer
    canvas.setFillColor(GREY)
    canvas.setFont("Helvetica", 7.6)
    canvas.drawString(1.8 * cm, 1.1 * cm, "RASTRO — Transparencia y Datos Abiertos Colombia · Hackathon Croma")
    canvas.drawRightString(w - 1.8 * cm, 1.1 * cm, f"Página {doc.page}")
    canvas.setStrokeColor(colors.HexColor("#dbdad5"))
    canvas.line(1.8 * cm, 1.35 * cm, w - 1.8 * cm, 1.35 * cm)
    canvas.restoreState()


def build_pdf(filename: str, title: str, story: list):
    path = os.path.join(DOC_DIR, filename)
    doc = SimpleDocTemplate(
        path, pagesize=LETTER,
        topMargin=1.9 * cm, bottomMargin=1.8 * cm, leftMargin=1.8 * cm, rightMargin=1.8 * cm,
        title=title, author="RASTRO",
    )

    def _on_page(c, d):
        _header_footer(c, d, title)

    doc.build(story, onFirstPage=_on_page, onLaterPages=_on_page)
    print(f"OK -> {filename}")


def cover_page(doc_code: str, doc_title: str, doc_subtitle: str):
    return [
        Spacer(1, 3.2 * cm),
        Paragraph(f'<font color="#046A38">RASTRO</font>', ParagraphStyle(
            "CoverBrand", fontName="Helvetica-Bold", fontSize=34, leading=38)),
        Spacer(1, 0.15 * cm),
        Paragraph("Transparencia y Datos Abiertos Colombia — Hackathon Croma",
                  STYLES["CoverMeta"]),
        Spacer(1, 1.6 * cm),
        HRFlowable(width="100%", thickness=2, color=GOLD, spaceAfter=18),
        Paragraph(doc_code, ParagraphStyle("CoverCode", fontName="Helvetica-Bold", fontSize=11,
                                            textColor=GOLD, spaceAfter=6)),
        Paragraph(doc_title, STYLES["CoverTitle"]),
        Paragraph(doc_subtitle, STYLES["CoverSubtitle"]),
        Spacer(1, 3.5 * cm),
        Paragraph("Versión 1.0 — Agosto de 2026", STYLES["CoverMeta"]),
        Paragraph("Proyecto: RASTRO — motor de transparencia en contratación pública colombiana", STYLES["CoverMeta"]),
        PageBreak(),
    ]


def h1(text):
    return Paragraph(text, STYLES["H1"])


def h2(text):
    return Paragraph(text, STYLES["H2"])


def h3(text):
    return Paragraph(text, STYLES["H3"])


def p(text):
    return Paragraph(text, STYLES["Body"])


def small(text):
    return Paragraph(text, STYLES["BodySmall"])


def quote(text):
    return Paragraph(text, STYLES["Quote"])


def bullets(items, style="Body"):
    return ListFlowable(
        [ListItem(Paragraph(it, STYLES[style]), leftIndent=8, spaceAfter=3) for it in items],
        bulletType="bullet", start="•", leftIndent=14,
    )


def spacer(h=0.25):
    return Spacer(1, h * cm)


def rule():
    return HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#dbdad5"),
                       spaceBefore=6, spaceAfter=10)


def make_table(headers, rows, col_widths=None, header_bg=PRIMARY_DARK, small_body=False,
                zebra=True):
    body_style = "TableCell" if not small_body else "BodySmall"
    data = [[Paragraph(hcell, STYLES["TableHead"]) for hcell in headers]]
    for row in rows:
        data.append([Paragraph(str(c), STYLES[body_style]) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), header_bg),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dbdad5")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style_cmds.append(("BACKGROUND", (0, i), (-1, i), LIGHT_GREY))
    t.setStyle(TableStyle(style_cmds))
    return t


def diagram_image(filename, caption, max_width=17.0):
    path = os.path.join(DOC_DIR, "diagramas", filename)
    from PIL import Image as PILImage
    with PILImage.open(path) as im:
        iw, ih = im.size
    max_w_pt = max_width * cm
    ratio = max_w_pt / iw
    w = max_w_pt
    h = ih * ratio
    max_h_pt = 21 * cm
    if h > max_h_pt:
        ratio2 = max_h_pt / h
        h = max_h_pt
        w = w * ratio2
    img = Image(path, width=w, height=h)
    return [img, Paragraph(caption, STYLES["Caption"])]


def level_badge_row(label, color, desc):
    return [Paragraph(f'<font color="{color.hexval() if hasattr(color, "hexval") else color}">●</font> <b>{label}</b>',
                       STYLES["Body"]), Paragraph(desc, STYLES["Body"])]
