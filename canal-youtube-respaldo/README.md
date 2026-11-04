# Detrás de la Marca — producción automática para YouTube

Proceso completo para un canal de historias de negocios en español, sin mostrar la cara:

```
investigar tendencias → elegir ideas → escribir y verificar guiones → voz → video → subir → programar en Metricool (con aprobación)
```

| Paso | Quién lo hace | Herramienta |
|---|---|---|
| Tendencias del nicho | `investigacion/tendencias.js` | API de datos de YouTube (`YOUTUBE_API_KEY`) |
| Ideas, guiones, verificación de datos | Claude, con la skill `youtube-canal-viral` | búsqueda web |
| Voz en off con tiempos por palabra | `motor/producir.js` | ElevenLabs (`ELEVENLABS_API_KEY`) |
| Animación, subtítulos, mezcla, miniatura | `motor/producir.js` + `motor/motor.html` | Playwright + ffmpeg |
| Publicar archivos | `git push` de `videos/` | este repositorio (público) |
| Programar en YouTube | Claude | conector de Metricool (marca propia del canal) |
| Ciclo semanal | tarea programada | Claude Code |

## Configuración (una sola vez)
1. **Canal de YouTube** creado y con el teléfono verificado (miniaturas personalizadas y videos > 15 min).
2. **Metricool**: crear una marca nueva para el canal (no la de Toro's), conectar YouTube y anotar su `blogId` en `config/canal.json → metricool.blogId`.
3. **Variables del entorno** de Claude Code (menú del entorno → Editar → secretos / variables):
   - `YOUTUBE_API_KEY`: Google Cloud Console → nuevo proyecto → habilitar "YouTube Data API v3" → Credenciales → Clave de API.
   - `ELEVENLABS_API_KEY`: elevenlabs.io → Perfil → API Keys.
   - `ELEVENLABS_VOICE_ID` (o `config/canal.json → voz.voice_id`): la voz elegida en la Voice Library (español, tono documental).
4. **Red del entorno**: agregar `api.elevenlabs.io` a los dominios permitidos.
5. **Este repositorio público**, para que Metricool pueda descargar los videos: completar `config/canal.json → publicacion.url_base` con
   `https://raw.githubusercontent.com/<usuario>/<repo>/main/videos/`.
6. Opcional: música libre de derechos (Biblioteca de audio de YouTube) en `musica/` y su ruta en `config/canal.json → musica.archivo`.

## Uso manual
```bash
node investigacion/tendencias.js                       # ranking de temas que están funcionando
node motor/producir.js guiones/<id>.json               # video final con voz
node motor/producir.js guiones/<id>.json --sin-voz     # vista previa sin voz
```
Cada video deja en `videos/`: `<id>.mp4`, `<id>-miniatura.jpg` y `<id>.metricool.json` (el contenido listo para programar).

El formato de los guiones está en [`motor/FORMATO-GUION.md`](motor/FORMATO-GUION.md).

## Ciclo semanal automático
Ver [`SEMANA.md`](SEMANA.md): es el pedido que ejecuta la tarea programada cada lunes.

## Límites (a propósito)
- No se descargan ni se reutilizan videos de otros canales: las tendencias se usan como señal de tema y formato, y todo se produce desde cero. YouTube no monetiza contenido reutilizado.
- Ningún video se publica sin pasar por la aprobación del dueño del canal (revisión en Metricool o borrador), salvo que se cambie `publicacion.requiere_aprobacion` a `false`.
