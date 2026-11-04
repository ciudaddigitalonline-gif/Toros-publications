---
name: "toros-youtube-contenido"
description: "Crear y programar YouTube Shorts (y videos largos ocasionales) de Toro's Smash Burgers en Metricool, reutilizando los Reels con las reglas de marca y el flujo de archivos ya acordados."
---

# Toro's Smash Burgers: contenido de YouTube

Usar cuando el usuario pida crear, adaptar o programar Shorts o videos de YouTube de Toro's Smash Burgers, o pasar a YouTube un Reel ya armado para Instagram/TikTok.

## Antes de empezar
- Metricool brand id 7373783 (zona America/Buenos_Aires). Revisar con `getBrandSettings` que `networksData` tenga `youtubeData`. Si no aparece, el canal todavía no está conectado: pedirle al usuario que lo conecte en Metricool (Ajustes de marca → Conexiones → YouTube) y no intentar programar hasta entonces.
- Las reglas de marca son las mismas que en la skill `toros-instagram-contenido`: nombres de las burgers, colores negro/dorado/crema, Poppins, PedidosYa y Rappi (La Alemana solo PedidosYa), nunca Uber Eats, sin empleados en pantalla, sin logos de terceros, público solo de Bahía Blanca sin nombrar la ciudad en las piezas.

## Formato
- Por defecto, Short: video vertical 1080x1920, de 15 a 60 segundos (máximo 3 minutos). Reutilizar el Reel del día con su tarjeta de marca final y la línea de gancho.
- Si el Reel tiene texto pegado a los bordes, dejar margen: YouTube tapa la parte inferior (título y botones) y el lateral derecho.
- Video largo (16:9, 1920x1080) solo si el usuario lo pide; en ese caso preparar también una miniatura 1280x720 con el logo y el titular en blanco bold con la línea naranja.
- Mostrar siempre la pieza al usuario antes de programar.

## Textos
- Título (obligatorio, máximo 100 caracteres, conviene menos de 60): directo y con el nombre de la burger. Ej.: "Triple Cheddar smash armada de principio a fin 🔥".
- Descripción (campo `text`): una o dos líneas, cómo pedir ("Pedila por PedidosYa y Rappi", salvo La Alemana) y al final los hashtags `#Shorts #smashburger #hamburguesas #lomejordebahia #lamejorburguerdebahia`.
- Tags (`youtubeData.tags`): smash burger, hamburguesas, burger, delivery, Toro's Smash Burgers, más el nombre de la burger.
- Sorteos: igual que en Instagram, aclarar que el sorteo no está patrocinado ni asociado a YouTube y no anunciar ganador.

## Datos de YouTube en Metricool
- `providers: [{"network":"youtube"}]` y `youtubeData`: `{"title": "...", "type": "short", "privacy": "public", "tags": [...], "category": "HOWTO_STYLE", "madeForKids": false, "isAiGeneratedContent": false}`. Para video largo, `type: "video"`.
- `madeForKids` siempre false (el contenido no es para niños). `isAiGeneratedContent` solo true si la pieza es realmente generada por IA y el usuario lo confirma. No enviar `notifySubscribers` salvo pedido explícito.
- Portada: `videoCoverMilliseconds` con un fotograma donde se vea bien la burger, solo si el canal está verificado; si no, omitirlo (si no aplica, Metricool rechaza el pedido).
- Modo automático (`autoPublish: true`).

## Horarios
- Publicar en horario de pedidos: Shorts a las 19:30, después de Instagram (19:00) y antes de TikTok (20:00). No usar el mediodía.
- Un Short por día como máximo; si se quiere repetir una pieza ya publicada en Instagram, dejar al menos un día de diferencia o cambiar el fragmento.

## Audio
- Solo música instrumental real y libre de derechos (Pixabay Music) que manda el usuario, la misma pista del Reel o un fragmento distinto. No usar audio sintetizado.
- Tramo con fundido de entrada y salida y volumen normalizado a unos -15 LUFS.
- Si YouTube marca un reclamo de Content ID, avisar al usuario y cambiar de tema; no discutir el reclamo sin su pedido.

## Flujo de archivos
1. Armar o adaptar la pieza y mostrársela al usuario.
2. El usuario sube el archivo a la raíz del repositorio público `ciudaddigitalonline-gif/toros-publications` y avisa "Subido". Usar siempre nombres nuevos (por ejemplo `short-lunes-16-nov.mp4`) para evitar la caché.
3. Programar con `https://raw.githubusercontent.com/ciudaddigitalonline-gif/toros-publications/main/<archivo>`.
4. Al actualizar una pieza hace falta el id actual y el uuid (el id cambia en cada actualización) y reenviar todo el contenido.
5. No desactivar ni borrar piezas ya programadas sin pedido explícito. Nunca guardar tokens ni claves.

## Medición
- Mirar vistas, porcentaje de visualización (retención), "vistos vs. deslizados", suscriptores netos y comentarios, y decirle al usuario qué señal falta mejorar (por ejemplo, gancho de los primeros 2 segundos si se desliza mucho).
