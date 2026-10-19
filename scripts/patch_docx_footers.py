#!/usr/bin/env python3
"""Pós-processamento do docx (compatibilidade WPS/Word):
1. Remove <w:pgNumType/> vazio (seção da capa).
2. Corrige instrText dos rodapés: seção 2 (sumário) -> PAGE \\* ROMAN;
   seção 3 (corpo) -> PAGE \\* arabic. Mapeia footerReference -> arquivo via rels.
"""
import re
import shutil
import sys
import zipfile

DOCX = "/home/z/my-project/download/Conta-Comigo-Analise-de-Conceito-e-Propostas-de-Melhorias.docx"
TMP = DOCX + ".tmp"

with zipfile.ZipFile(DOCX, "r") as zin:
    names = zin.namelist()
    data = {n: zin.read(n) for n in names}

doc_xml = data["word/document.xml"].decode("utf-8")

# 1. Remove pgNumType vazio (mantém os que têm atributos start/fmt)
before = doc_xml.count("<w:pgNumType/>")
doc_xml = doc_xml.replace("<w:pgNumType/>", "")
print(f"pgNumType vazios removidos: {before}")

# 1b. Remove a entrada duplicada dentro do parágrafo do campo TOC
# (o hyperlink logo após o 'separate' repete o primeiro título, que já
#  existe como entrada placeholder injetada pelo add_toc_placeholders.py)
doc_xml, n_dup = re.subn(
    r'(<w:instrText[^>]*>\s*TOC[^<]*</w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>)'
    r'<w:hyperlink.*?</w:hyperlink>',
    r"\1",
    doc_xml,
    flags=re.S,
)
print(f"entradas duplicadas do campo TOC removidas: {n_dup}")

# 2. Localiza blocos sectPr em ordem e extrai footerReference default
sect_blocks = re.findall(r"<w:sectPr[\s\S]*?</w:sectPr>", doc_xml)
print(f"seções encontradas: {len(sect_blocks)}")

rels_xml = data["word/_rels/document.xml.rels"].decode("utf-8")
rel_map = dict(re.findall(r'<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"', rels_xml))

def footer_file_for(block):
    m = re.search(r'<w:footerReference w:type="default" r:id="([^"]+)"', block)
    if not m:
        return None
    target = rel_map.get(m.group(1))
    if not target:
        return None
    return "word/" + target.lstrip("/")

def patch_footer(fname, fmt):
    if not fname or fname not in data:
        print(f"  aviso: rodapé não encontrado para fmt={fmt}")
        return
    xml = data[fname].decode("utf-8")
    patched, n = re.subn(
        r"(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)",
        r"\1 PAGE \\* " + fmt + r" \\* MERGEFORMAT \2",
        xml,
    )
    data[fname] = patched.encode("utf-8")
    print(f"  {fname}: {n} campo(s) PAGE -> \\* {fmt}")

# Seção 1 = capa (sem rodapé), seção 2 = sumário (ROMAN), seção 3 = corpo (arabic)
if len(sect_blocks) >= 3:
    patch_footer(footer_file_for(sect_blocks[1]), "ROMAN")
    patch_footer(footer_file_for(sect_blocks[2]), "arabic")
else:
    print("ERRO: estrutura de seções inesperada")
    sys.exit(1)

data["word/document.xml"] = doc_xml.encode("utf-8")

with zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as zout:
    for n in names:
        zout.writestr(n, data[n])
shutil.move(TMP, DOCX)
print("OK: rodapés corrigidos e pgNumType limpo")
