#!/usr/bin/env python3
"""WCAG contrast matrix for Purelane V2 palette (AA check)."""

def rgb(hexv):
    hexv = hexv.lstrip('#')
    return tuple(int(hexv[i:i+2], 16) for i in (0, 2, 4))

def blend(fg, bg, alpha):
    return tuple(round(fg[i]*alpha + bg[i]*(1-alpha)) for i in range(3))

def lum(c):
    def f(v):
        v /= 255
        return v/12.92 if v <= 0.03928 else ((v+0.055)/1.055)**2.4
    r, g, b = map(f, c)
    return 0.2126*r + 0.7152*g + 0.0722*b

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

BG = rgb('f4f0fb')   # --ink (page ground)
WHITE = (255, 255, 255)
GLASS = blend((255,255,255), rgb('ece6f7'), 0.60)  # approx glass-2 fill

pairs = [
    ('body text  paper#241a3d on ink',      rgb('241a3d'), BG),
    ('paper-2 (78%) on ink',                blend(rgb('241a3d'), BG, 0.78), BG),
    ('paper-3 (56%) on ink',                blend(rgb('241a3d'), BG, 0.56), BG),
    ('surface#17102b heading on ink',       rgb('17102b'), BG),
    ('surface heading on glass-2',          rgb('17102b'), GLASS),
    ('accent#b8701c on ink',                rgb('b8701c'), BG),
    ('accent on white',                     rgb('b8701c'), WHITE),
    ('green#4f7d10 on ink',                 rgb('4f7d10'), BG),
    ('green#4f7d10 on white pill',          rgb('4f7d10'), WHITE),
    ('green#4f7d10 on glass-2',             rgb('4f7d10'), GLASS),
    ('star#7a9c1e on ink',                  rgb('7a9c1e'), BG),
    ('star#7a9c1e on glass-2',              rgb('7a9c1e'), GLASS),
    ('teal ink#01423b on white ghost btn',  rgb('01423b'), WHITE),
    ('teal ink#01423b on glass-2',          rgb('01423b'), GLASS),
    ('on-teal#f4fdf6 on teal #00706a',      rgb('f4fdf6'), rgb('00706a')),
    ('accent#b8701c on teal #00706a (flag/cta text)', rgb('b8701c'), rgb('00706a')),
    ('on-teal#f4fdf6 on teal-dark #004b46', rgb('f4fdf6'), rgb('004b46')),
    ('kicker paper-3 on ink (11px small)',  blend(rgb('241a3d'), BG, 0.56), BG),
]

print(f"{'pair':<45}{'ratio':>7}  {'AA norm':>7} {'AA large':>8}")
print('-'*72)
for name, fg, bg in pairs:
    r = ratio(fg, bg)
    aa = 'PASS' if r >= 4.5 else 'FAIL'
    aal = 'PASS' if r >= 3.0 else 'FAIL'
    print(f'{name:<45}{r:>6.2f}:1  {aa:>7} {aal:>8}')
