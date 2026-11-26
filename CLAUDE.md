# Toro's Smash Burgers: instrucciones para Claude

## Herramienta de diseño
- **Usar siempre Canva** (conector de claude.ai) para armar posts, stories y Reels: plantillas, animaciones, texto animado y exportación en MP4/JPG.
- Si el conector de Canva no aparece en la sesión, avisarle al usuario que lo conecte en https://claude.ai/customize/connectors y abra una sesión nueva, en vez de armar las piezas por otro medio sin avisar.
- Trabajar sobre las fotos reales de las burgers. No usar comida generada con IA; activar la etiqueta de IA solo si una pieza es realmente generada por IA y el usuario lo confirma.

## Publicación en Instagram
- Desde el 24/11/2026 Instagram se publica con **Buffer** (conector de claude.ai, plan gratis: máximo 10 publicaciones programadas en total). Org 6b052ea172614cc37034f55b, canal Instagram toros.smash 6b052f7e8541f09ecb854433. Metricool ya no publica Instagram (sin cupo); sus publicaciones de diciembre quedaron en borrador y sirven de fuente de contenido.
- Una tarea diaria (9:39, en la conversación que tiene los conectores) rellena la cola de Buffer: primero con `publicador/calendario.json` (tiene prioridad y reemplaza lo de Metricool en el mismo horario), después con lo de Metricool.
- Para programar algo nuevo: subir los archivos al repo por PR y agregar la entrada a `publicador/calendario.json` (`id`, `fecha` en hora de Bahía Blanca `AAAA-MM-DDTHH:MM`, `tipo` POST/REEL/STORY, `archivo`, `caption`; stories sin caption). En Buffer usar la URL raw de GitHub.
- El publicador propio por API (`publicador/publicar.py` + GitHub Actions) quedó pausado: nunca se configuró el token de Meta.
- TikTok queda manual (no está conectado en Buffer).

## Contenido
- Se puede anunciar una burger sola o todas juntas, pero sin títulos que la aten a un día (nada de "Miércoles de guacamole", "Viernes de cheddar", "Domingo gourmet"). Títulos válidos: el nombre de la burger ("Así es La Alemana", "La Mexicana") o del menú ("Elegí la tuya").

## Música de los Reels
- Desde la semana del 14/12/2026 usar `musica/funky-chunk.mp3` ("Funky Chunk", Kevin MacLeod, CC BY 4.0) con su crédito en el caption.
- `musica/happy-bee-surf.mp3` sigue aprobado para los tramos que le quedan libres.
- Ver `musica/CREDITOS.md` para la licencia, el crédito exacto de cada tema y los tramos ya usados; no repetir inicios dentro de un mismo tema.

## Sorteos
- El ganador lo gestiona el equipo por WhatsApp: no recordarlo ni anunciarlo.
