#!/usr/bin/env python3
"""Convierte guiones JSON en un documento legible (Markdown) para revisar.
Uso: python3 motor/guion_a_texto.py guiones/<a>.json [guiones/<b>.json ...] > salida.md"""
import json, sys
for f in sys.argv[1:]:
    g = json.load(open(f))
    print(f"## {g['titulo']}\n")
    print(f"**{g.get('formato','short').capitalize()}** · publica {g.get('fecha_publicacion','')} · id `{g['id']}`" + (f" · lleva al largo `{g['relacionado']}`" if g.get('relacionado') else "") + "\n")
    print("| # | Narración | En pantalla |\n|---|---|---|")
    for i, s in enumerate(g['escenas'], 1):
        vis = [s['tipo']]
        for k in ('capitulo', 'etiqueta', 'grande', 'rotulo', 'emoji', 'texto_cita', 'pregunta'):
            if s.get(k): vis.append(f"{k}: {str(s[k]).replace(chr(10),' ')}")
        if s.get('items'): vis.append('items: ' + ' / '.join(s['items']))
        if s.get('hitos'): vis.append('hitos: ' + ' → '.join(h['anio'] + ' ' + h.get('rotulo', '') for h in s['hitos']))
        if s.get('hasta') is not None: vis.append(f"contador hasta {s.get('prefijo','')}{s['hasta']}{s.get('sufijo','')}")
        if s.get('sello'): vis.append(f"sello: {s['sello']['texto']}")
        if s.get('nota'): vis.append(f"nota: {s['nota']}")
        print(f"| {i} | {s['texto']} | {' · '.join(vis)} |")
    m = g.get('miniatura', {})
    print(f"\n**Miniatura:** {m.get('emoji','')} \"{m.get('texto','').replace(chr(10),' ')}\"" + (f" + \"{m['sub']}\"" if m.get('sub') else ""))
    print(f"\n**Descripción:**\n> " + g.get('descripcion', '').replace('\n', '\n> '))
    print(f"\n**Etiquetas:** {', '.join(g.get('etiquetas', []))}\n\n---\n")
