#!/usr/bin/env python3
"""Pós-processamento do estudo DOCX:
   A) rodapés: PAGE -> \\* ROMAN (footer1) e \\* arabic (footer2); remove <w:pgNumType/>
   B) funde o início do campo TOC com a 1ª entrada limpa (elimina a duplicata do docx-js)
   C) valida XML bem-formado
   Uso: python3 postprocess_estudo.py [caminho.docx]
"""
import re, zipfile, shutil, sys

P = sys.argv[1] if len(sys.argv) > 1 else '/home/z/my-project/download/Conta-Comigo-Estudo-de-Expansao-e-Seguranca.docx'

zin = zipfile.ZipFile(P, 'r')
files = {item.filename: zin.read(item.filename) for item in zin.infolist()}
zin.close()

# A) rodapés
f1 = files['word/footer1.xml'].decode('utf-8')
f2 = files['word/footer2.xml'].decode('utf-8')
f1 = re.sub(r'(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)', r'\1 PAGE \\* ROMAN \\* MERGEFORMAT \2', f1)
f2 = re.sub(r'(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)', r'\1 PAGE \\* arabic \\* MERGEFORMAT \2', f2)
files['word/footer1.xml'] = f1.encode('utf-8')
files['word/footer2.xml'] = f2.encode('utf-8')
doc = files['word/document.xml'].decode('utf-8')
doc = doc.replace('<w:pgNumType/>', '')

# B) funde begin+instr+separate do campo TOC na 1ª entrada limpa
start = doc.find('<w:sdtContent>')
p1_start = doc.find('<w:p>', start)
p1_end = doc.find('</w:p>', p1_start) + len('</w:p>')
p1 = doc[p1_start:p1_end]
m = re.search(
    r'<w:r><w:fldChar w:fldCharType="begin"[^>]*/></w:r>'
    r'<w:r><w:instrText[^>]*>[^<]*TOC[^<]*</w:instrText></w:r>'
    r'<w:r><w:fldChar w:fldCharType="separate"/></w:r>', p1)
assert m, 'runs do campo TOC não encontrados'
runs = m.group(0)
p2_start = doc.find('<w:p>', p1_end)
p2_end = doc.find('</w:p>', p2_start) + len('</w:p>')
p2 = doc[p2_start:p2_end]
mm = re.search(r'<w:pPr>.*?</w:pPr>', p2, re.S)
assert mm, 'pPr da 1ª entrada limpa não encontrado'
p2_new = p2[:mm.end(0)] + runs + p2[mm.end(0):]
doc = doc[:p1_start] + p2_new + doc[p2_end:]
files['word/document.xml'] = doc.encode('utf-8')

tmp = P + '.tmp'
zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
for name, data in files.items():
    zout.writestr(name, data)
zout.close()
shutil.move(tmp, P)

# C) validação
from defusedxml import ElementTree as DET
for name in ('word/document.xml', 'word/footer1.xml', 'word/footer2.xml'):
    DET.fromstring(zipfile.ZipFile(P).read(name))
print('OK: rodapés corrigidos, duplicata do TOC removida, XML bem-formado')
