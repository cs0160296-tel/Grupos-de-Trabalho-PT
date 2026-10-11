#!/usr/bin/env python3
"""Gera public/og-card.png (1200x630) a partir de public/data.json.

O cartão de pré-visualização usa a paleta do site e os números do corte de
evidência em vigor. Reexecutar depois de um novo import:

    python3 scripts/og-card.py

Requer Pillow. Se o Pillow não estiver instalado, o script não falha o build:
avisa e mantém o cartão existente.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/og-card.png'

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print('Pillow não instalado; og-card.png não foi regenerado.', file=sys.stderr)
    sys.exit(0)

data = json.loads((ROOT / 'public/data.json').read_text())
m = data['metrics']

PAPER, INK, SOFT, ACCENT, RULE = '#F6F4EE', '#203D36', '#5B6F67', '#B87B23', '#CFD3C8'
W, H, PAD = 1200, 630, 76

SERIF = '/System/Library/Fonts/Supplemental/Georgia.ttf'
SERIF_B = '/System/Library/Fonts/Supplemental/Georgia Bold.ttf'
SANS = '/System/Library/Fonts/Helvetica.ttc'

def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default(size)

f_eyebrow = font(SANS, 23)
f_huge = font(SERIF_B, 196)
f_lede = font(SERIF_B, 54)
f_body = font(SERIF, 30)
f_foot = font(SANS, 22)

img = Image.new('RGB', (W, H), PAPER)
d = ImageDraw.Draw(img)

# filete superior de acento
d.rectangle([0, 0, W, 9], fill=ACCENT)

y = PAD + 14
d.text((PAD, y), 'TRANSPARÊNCIA · PORTUGAL', font=f_eyebrow, fill=ACCENT)

# número de destaque e etiqueta, alinhados pela base
y += 52
total = str(m['total'])
d.text((PAD, y), total, font=f_huge, fill=INK)
num_w = d.textlength(total, font=f_huge)
d.text((PAD + num_w + 26, y + 112), 'grupos de trabalho', font=f_lede, fill=INK)

y += 232
d.text((PAD, y), 'criados pelo Governo português desde abril de 2024.', font=f_body, fill=INK)
y += 46
d.text((PAD, y), f"{m['creating_acts']} diplomas · {m['deadlines_quoted']} cláusulas de prazo · "
                 f"{m['reviewed_acts']} atos lidos integralmente", font=f_body, fill=SOFT)

# rodapé
d.line([PAD, H - PAD - 52, W - PAD, H - PAD - 52], fill=RULE, width=2)
d.text((PAD, H - PAD - 34), 'Observatório dos Grupos de Trabalho', font=f_foot, fill=INK)
stamp = f"Evidência revista até {data['cutoff']}"
d.text((W - PAD - d.textlength(stamp, font=f_foot), H - PAD - 34), stamp, font=f_foot, fill=SOFT)

img.save(OUT, 'PNG', optimize=True)
print(f'{OUT.relative_to(ROOT)} · {OUT.stat().st_size // 1024} KB · {W}x{H}')
