# Toro's Smash Burgers: instrucciones para Claude

## Herramienta de diseño
- **Usar siempre Canva** (conector de claude.ai) para armar posts, stories y Reels: plantillas, animaciones, texto animado y exportación en MP4/JPG.
- Si el conector de Canva no aparece en la sesión, avisarle al usuario que lo conecte en https://claude.ai/customize/connectors y abra una sesión nueva, en vez de armar las piezas por otro medio sin avisar.
- Trabajar sobre las fotos reales de las burgers. No usar comida generada con IA; activar la etiqueta de IA solo si una pieza es realmente generada por IA y el usuario lo confirma.

## Publicación en Instagram
- Desde el 24/11/2026 Instagram se publica con **Buffer** (conector de claude.ai, plan gratis: máximo 10 publicaciones programadas en total). Org 6b052ea172614cc37034f55b, canal Instagram toros.smash 6b052f7e8541f09ecb854433. Metricool ya no publica Instagram (sin cupo); sus publicaciones de diciembre quedaron en borrador y sirven de fuente de contenido.
- Una tarea diaria (9:39, en la conversación que tiene los conectores) rellena la cola de Buffer: primero con `publicador/calendario.json` (tiene prioridad y reemplaza lo de Metricool en el mismo horario), después con lo de Metricool.
- Para programar algo nuevo: subir los archivos al repo por PR y agregar la entrada a `publicador/calendario.json` (`id`, `fecha` en hora de Bahía Blanca `AAAA-MM-DDTHH:MM`, `tipo` POST/REEL/STORY, `archivo`, `caption`; stories sin caption). En Buffer usar la URL raw de GitHub.
- Publicador propio por API (`publicador/publicar.py` + GitHub Actions cada 10 min, token `IG_TOKEN` de login de Facebook, cuenta @toros.smash id 17841408315307930 en el portfolio TYG LOGISTICA): publica solo las entradas con `"via": "publicador"`; la tarea diaria de Buffer debe saltearlas.
- Desde el 27/11/2026 hay 3 stories extra por día abierto (13:00, 18:00, 20:15) que salen por el publicador propio: lunes "Arrancá la semana", miércoles "Mitad de semana", viernes "Llegó el finde", sábado "Finde de juntadas", viernes y domingo "Combo para compartir"; el resto de los días rotan "¿Qué pedís esta noche?", "Hoy abrimos 19:30", "Pedila en combo" y "Sumale papas".
- TikTok queda manual (no está conectado en Buffer).

## Contenido
- Se puede anunciar una burger sola o todas juntas, pero sin títulos que la aten a un día (nada de "Miércoles de guacamole", "Viernes de cheddar", "Domingo gourmet"). Títulos válidos: el nombre de la burger ("Así es La Alemana", "La Mexicana") o del menú ("Elegí la tuya").

## Música de los Reels
- Desde la semana del 14/12/2026 usar `musica/funky-chunk.mp3` ("Funky Chunk", Kevin MacLeod, CC BY 4.0) con su crédito en el caption.
- `musica/happy-bee-surf.mp3` sigue aprobado para los tramos que le quedan libres.
- Ver `musica/CREDITOS.md` para la licencia, el crédito exacto de cada tema y los tramos ya usados; no repetir inicios dentro de un mismo tema.

## Sorteos
- El ganador lo gestiona el equipo por WhatsApp: no recordarlo ni anunciarlo.
