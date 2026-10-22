# -*- coding: utf-8 -*-
"""Gera o corpo (ReportLab) do Estudo de Viabilidade II — Instalação Nativa
Android, iOS e Windows. Pipeline idêntico ao gen_estudo_nativas.py (série)."""
import os, sys, hashlib

PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, "scripts"))
sys.path.insert(0, "/home/z/my-project/scripts")

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                PageBreak, CondPageBreak, KeepTogether, Image)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

from pdf import install_font_fallback
from nativas2_content_a import SECTIONS_A, DOC_TITLE, FOOTER_META
from nativas2_content_b import SECTIONS_B

FONT_DIR = "/usr/share/fonts"
pdfmetrics.registerFont(TTFont("NotoSerifSC", f"{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("NotoSerifSC-Bold", f"{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif", f"{FONT_DIR}/truetype/freefont/FreeSerif.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Bold", f"{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Italic", f"{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-BoldItalic", f"{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuSans", f"{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf"))
registerFontFamily("NotoSerifSC", normal="NotoSerifSC", bold="NotoSerifSC-Bold")
registerFontFamily("FreeSerif", normal="FreeSerif", bold="FreeSerif-Bold",
                   italic="FreeSerif-Italic", boldItalic="FreeSerif-BoldItalic")
registerFontFamily("DejaVuSans", normal="DejaVuSans", bold="DejaVuSans")
install_font_fallback()

# ━━ Cascade Palette (palette.cascade seed 7, mode minimal — identidade da série de estudos) ━━
PAGE_BG       = colors.HexColor('#eff0f1')
SECTION_BG    = colors.HexColor('#f0f1f2')
CARD_BG       = colors.HexColor('#e4e7e8')
TABLE_STRIPE  = colors.HexColor('#ebedee')
HEADER_FILL   = colors.HexColor('#334650')
COVER_BLOCK   = colors.HexColor('#5a7886')
BORDER        = colors.HexColor('#b8c8cf')
ICON          = colors.HexColor('#52798c')
ACCENT        = colors.HexColor('#3681a6')
ACCENT_2      = colors.HexColor('#b43a4e')
TEXT_PRIMARY  = colors.HexColor('#1a1b1c')
TEXT_MUTED    = colors.HexColor('#6f7578')

OUT = "/home/z/my-project/download/nativas2_body.pdf"
CHART_PNG = "/home/z/my-project/scripts/nativas2_chart.png"
M_LEFT = M_RIGHT = 2.0 * cm
M_TOP = M_BOT = 2.0 * cm
AVAIL = A4[0] - M_LEFT - M_RIGHT

st_h1 = ParagraphStyle("H1", fontName="FreeSerif", fontSize=17.5, leading=24,
                       textColor=HEADER_FILL, spaceBefore=18, spaceAfter=10)
st_h2 = ParagraphStyle("H2", fontName="FreeSerif", fontSize=13.5, leading=19,
                       textColor=HEADER_FILL, spaceBefore=14, spaceAfter=8)
st_body = ParagraphStyle("Body", fontName="FreeSerif", fontSize=10.5, leading=16.5,
                         textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=10)
st_call = ParagraphStyle("Call", fontName="FreeSerif-Bold", fontSize=10.5, leading=15,
                         textColor=HEADER_FILL, alignment=TA_CENTER, spaceBefore=8, spaceAfter=8)
st_cap = ParagraphStyle("Cap", fontName="FreeSerif", fontSize=9, leading=12.5,
                        textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=3, spaceAfter=6)
st_th = ParagraphStyle("TH", fontName="FreeSerif", fontSize=9.5, leading=12.5,
                       textColor=colors.white, alignment=TA_CENTER)
st_td = ParagraphStyle("TD", fontName="FreeSerif", fontSize=9.5, leading=12.5,
                       textColor=TEXT_PRIMARY, alignment=TA_LEFT)
st_toc_title = ParagraphStyle("TocTitle", fontName="FreeSerif", fontSize=18, leading=24,
                              textColor=HEADER_FILL, spaceAfter=14)
toc_l0 = ParagraphStyle("TOC0", fontName="FreeSerif", fontSize=11.5, leading=20, leftIndent=6,
                        textColor=TEXT_PRIMARY)
toc_l1 = ParagraphStyle("TOC1", fontName="FreeSerif", fontSize=10, leading=16, leftIndent=26,
                        textColor=TEXT_MUTED)

H1_ORPHAN = (A4[1] - M_TOP - M_BOT) * 0.15

class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, "bookmark_name"):
            level = getattr(flowable, "bookmark_level", 0)
            text = getattr(flowable, "bookmark_text", "")
            key = getattr(flowable, "bookmark_key", "")
            self.notify("TOCEntry", (level, text, self.page, key))

def add_heading(text, style, level=0):
    key = "h_" + hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def safe_keep(elements):
    total = 0
    for el in elements:
        w, h = el.wrap(AVAIL, A4[1])
        total += h
    if total <= A4[1] * 0.4:
        return [KeepTogether(elements)]
    if len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

def build_table(spec):
    widths = [r * AVAIL for r in spec["widths"]]
    data = [[Paragraph("<b>%s</b>" % h, st_th) for h in spec["header"]]]
    for row in spec["rows"]:
        data.append([Paragraph(c, st_td) for c in row])
    t = Table(data, colWidths=widths, hAlign="CENTER", repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_FILL),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
    ]
    for i in range(1, len(data)):
        style.append(("BACKGROUND", (0, i), (-1, i), colors.white if i % 2 == 1 else TABLE_STRIPE))
    t.setStyle(TableStyle(style))
    return t

def make_effort_chart():
    """Figura 1 — esforço estimado por rota (barras horizontais), estudo II."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.font_manager as fm
    fm.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    import matplotlib.pyplot as plt
    plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False

    routes = [
        ("PWA Tela de Início (iOS)", 2, False),
        ("TWA Android (implementada)", 4, True),
        ("Electron Windows (implementado)", 5, True),
        ("Capacitor iOS + TTS nativo", 10, False),
        ("Capacitor Android + TTS", 12, False),
        ("Nativo Swift/SwiftUI (iOS)", 60, False),
        ("Flutter (3 plataformas)", 80, False),
    ]
    routes = routes[::-1]  # menor esforço no topo
    labels = [r[0] for r in routes]
    values = [r[1] for r in routes]
    colors_bar = ['#334650' if r[2] else '#3681a6' for r in routes]

    fig, ax = plt.subplots(figsize=(7.4, 3.5), dpi=200, constrained_layout=True)
    bars = ax.barh(labels, values, color=colors_bar, height=0.62, edgecolor='none')
    for b, v in zip(bars, values):
        ax.text(v + 1.6, b.get_y() + b.get_height() / 2, "%d d" % v,
                va='center', ha='left', fontsize=9, color='#1a1b1c')
    ax.set_xlim(0, 90)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_color('#b8c8cf')
    ax.spines['left'].set_color('#b8c8cf')
    ax.tick_params(axis='y', labelsize=9.5, colors='#1a1b1c', length=0)
    ax.tick_params(axis='x', bottom=False, labelbottom=False)
    ax.grid(False)
    fig.savefig(CHART_PNG, facecolor='white')
    plt.close(fig)
    return CHART_PNG

def fit_image(path, max_w, max_h):
    img = Image(path)
    ow, oh = img.drawWidth, img.drawHeight
    ratio = min(max_w / ow if ow > max_w else 1.0, max_h / oh if oh > max_h else 1.0)
    img.drawWidth = ow * ratio
    img.drawHeight = oh * ratio
    return img

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("FreeSerif", 8.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(M_LEFT, 1.15 * cm, FOOTER_META)
    canvas.drawRightString(A4[0] - M_RIGHT, 1.15 * cm, "página %d" % doc.page)
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(M_LEFT, 1.45 * cm, A4[0] - M_RIGHT, 1.45 * cm)
    canvas.restoreState()

SECTIONS = SECTIONS_A + SECTIONS_B

story = []
toc = TableOfContents()
toc.levelStyles = [toc_l0, toc_l1]
story.append(Paragraph("<b>Sumário</b>", st_toc_title))
story.append(toc)
story.append(PageBreak())

i = 0
while i < len(SECTIONS):
    kind, val = SECTIONS[i]
    if kind == "h1":
        block = [CondPageBreak(H1_ORPHAN), add_heading(val, st_h1, level=0)]
        if i + 1 < len(SECTIONS) and SECTIONS[i + 1][0] == "p":
            block.append(Paragraph(SECTIONS[i + 1][1], st_body))
            i += 1
        story.extend(safe_keep(block))
    elif kind == "h2":
        story.append(add_heading(val, st_h2, level=1))
    elif kind == "p":
        story.append(Paragraph(val.replace(" \u2014 ", "\u00a0\u2014 "), st_body))
    elif kind == "callout":
        story.append(Spacer(1, 4))
        story.append(Paragraph(val, st_call))
        story.append(Spacer(1, 4))
    elif kind == "table":
        t = build_table(val)
        cap = Paragraph(val["caption"], st_cap)
        story.append(Spacer(1, 8))
        story.extend(safe_keep([t, cap]))
        story.append(Spacer(1, 10))
    elif kind == "chart":
        png = make_effort_chart()
        img = fit_image(png, AVAIL, A4[1] * 0.32)
        cap = Paragraph(val["caption"], st_cap)
        story.append(Spacer(1, 14))
        story.extend(safe_keep([img, cap]))
        story.append(Spacer(1, 14))
    i += 1

doc = TocDocTemplate(OUT, pagesize=A4, leftMargin=M_LEFT, rightMargin=M_RIGHT,
                     topMargin=M_TOP, bottomMargin=M_BOT,
                     title=DOC_TITLE, author="Z.ai", creator="Z.ai")
doc.multiBuild(story, onFirstPage=footer, onLaterPages=footer)
print("OK body:", OUT)
