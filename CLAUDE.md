# Toro's Smash Burgers: instrucciones para Claude

## Herramienta de diseño
- **Usar siempre Canva** (conector de claude.ai) para armar posts, stories y Reels: plantillas, animaciones, texto animado y exportación en MP4/JPG.
- Si el conector de Canva no aparece en la sesión, avisarle al usuario que lo conecte en https://claude.ai/customize/connectors y abra una sesión nueva, en vez de armar las piezas por otro medio sin avisar.
- Trabajar sobre las fotos reales de las burgers. No usar comida generada con IA; activar la etiqueta de IA solo si una pieza es realmente generada por IA y el usuario lo confirma.

## Publicación en Instagram
- Desde noviembre 2026 Instagram NO se programa en Metricool (el plan gratis se quedó sin cupo). Se publica con el publicador del repo: GitHub Actions + API oficial de Instagram.
- Para programar: agregar entradas a `publicador/calendario.json` (`id` único, `fecha` en hora de Bahía Blanca `AAAA-MM-DDTHH:MM`, `tipo` POST/REEL/STORY, `archivo` del repo o `url`, `caption`; las stories van sin caption) y subirlo por PR junto con los archivos nuevos.
- El registro de lo publicado está en `publicador/publicados.json` (lo escribe el workflow; no editarlo salvo para reintentar algo).
- Configuración y secretos (`IG_TOKEN`, `GH_PAT`): ver `publicador/CONFIGURAR.md`. Nunca pedir ni guardar tokens en el chat ni en archivos.
- TikTok queda manual hasta que TikTok apruebe una app propia.

## Música de los Reels
- Desde la semana del 14/12/2026 usar `musica/funky-chunk.mp3` ("Funky Chunk", Kevin MacLeod, CC BY 4.0) con su crédito en el caption.
- `musica/happy-bee-surf.mp3` sigue aprobado para los tramos que le quedan libres.
- Ver `musica/CREDITOS.md` para la licencia, el crédito exacto de cada tema y los tramos ya usados; no repetir inicios dentro de un mismo tema.

## Sorteos
- El ganador lo gestiona el equipo por WhatsApp: no recordarlo ni anunciarlo.
