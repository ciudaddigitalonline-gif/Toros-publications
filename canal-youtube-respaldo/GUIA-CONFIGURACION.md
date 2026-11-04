# Guía de configuración — Detrás de la Marca
**Tiempo estimado: 20 minutos, desde la computadora.** Hacelo en este orden. No pegues ninguna clave en el chat.

Al final, anotá las 4 claves en un lugar temporal (por ejemplo, un bloc de notas) para cargarlas todas juntas en el paso 7.

---

## 1. Repositorio público en GitHub (2 min)
1. Entrá a https://github.com/new
2. **Repository name:** `detras-de-la-marca` (u otro nombre).
3. Marcá **Public**. No agregues README ni nada más.
4. **Create repository**.
5. Si la app de Claude en GitHub tiene acceso solo a repositorios elegidos, sumá este: https://github.com/apps/claude/installations/select_target → tu cuenta → **Repository access** → agregar `detras-de-la-marca` → **Save**.

👉 Anotá el nombre del repositorio para decírmelo.

## 2. Canal de YouTube (3 min)
1. Con la cuenta de Google que vas a usar para el canal, entrá a https://www.youtube.com/account → **Crear un canal**.
2. Nombre: **Detrás de la Marca**. Elegí el @usuario (por ejemplo `@detrasdelamarca`, si está libre).
3. Verificá el teléfono en https://www.youtube.com/verify (habilita miniaturas personalizadas y videos de más de 15 minutos).

## 3. Clave de la API de YouTube — `YOUTUBE_API_KEY` (4 min, gratis)
1. Creá un proyecto en https://console.cloud.google.com/projectcreate (nombre: `detras-de-la-marca`) → **Crear**.
2. Con ese proyecto elegido, abrí https://console.cloud.google.com/apis/library/youtube.googleapis.com → **Habilitar**.
3. Andá a https://console.cloud.google.com/apis/credentials → **Crear credenciales** → **Clave de API**.
4. Recomendado: en la clave creada, **Editar** → **Restricciones de API** → **Restringir clave** → elegir solo **YouTube Data API v3** → **Guardar**.

👉 Copiá la clave a tu bloc de notas como `YOUTUBE_API_KEY`.

## 4. Clave de Gemini — `GEMINI_API_KEY` (1 min, gratis)
1. Entrá a https://aistudio.google.com/apikey → **Crear clave de API** (podés elegir el mismo proyecto del paso 3).

👉 Copiala como `GEMINI_API_KEY`.

## 5. ElevenLabs (voz) — `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` (5 min)
1. Creá la cuenta en https://elevenlabs.io
2. **Plan:** para monetizar el canal hace falta un plan pago (el gratuito no incluye licencia de uso comercial y tiene pocos créditos). El plan más barato alcanza para empezar; revisá precios y créditos en https://elevenlabs.io/pricing
3. **Voz:** en la biblioteca de voces (**Voices → Voice Library**) filtrá por idioma **español**, probá voces con tono de narrador o documental y elegí una. Agregala a **My Voices**.
4. En **My Voices**, en el menú de la voz (**⋯**) → **Copy voice ID**.

   👉 Copiala como `ELEVENLABS_VOICE_ID`.
5. En **Settings → API Keys** (https://elevenlabs.io/app/settings/api-keys) → **Create API key**.

   👉 Copiala como `ELEVENLABS_API_KEY`.

## 6. Metricool (3 min)
1. Entrá a https://app.metricool.com
2. En el selector de marcas (arriba a la izquierda) → **Añadir marca** / **Nueva marca** → nombre **Detrás de la Marca**. **No uses la marca de Toro's.**
3. En esa marca nueva → **Conectar** → **YouTube** → iniciá sesión con la cuenta de Google del canal del paso 2 y aceptá los permisos.

No hace falta que me pases ningún número: el identificador de la marca lo busco yo.

> Nota: la aprobación de videos "por revisión" requiere un plan de Metricool con gestión de equipos. Si tu plan no lo tiene, los videos quedan como **borradores** y los aprobás publicándolos desde Metricool.

## 7. Configuración del entorno de Claude (3 min)
En la sesión de Claude Code, abrí el **menú del entorno** (barra de título de la sesión) → **Editar**.

**a) Claves.** En **Network secrets** (o **Variables de entorno** / **API credentials**, según la versión de la app) agregá estas cuatro, una por línea, con el nombre exacto:
```
YOUTUBE_API_KEY=…
GEMINI_API_KEY=…
ELEVENLABS_API_KEY=…
ELEVENLABS_VOICE_ID=…
```

**b) Red.** En **Acceso a la red**, nivel **Limitado** → **Dominios permitidos**, agregá:
```
api.elevenlabs.io
cdn.jsdelivr.net
```
Dejá marcada la casilla **Permitir gestores de paquetes**. Guardá.

Detalle oficial: https://code.claude.com/docs/en/cloud-environments#network-access

## 8. Listo
1. Abrí una **sesión nueva** (los cambios del entorno se aplican en sesiones nuevas) con este repositorio.
2. Escribí: **"probá el canal"** y el nombre del repositorio del paso 1.

Yo me encargo del resto: subir el proyecto, probar voz, tendencias y `/watch`, producir el primer video con voz, programarlo en Metricool para tu aprobación y activar el ciclo semanal.

---

### Checklist rápido
- [ ] Repositorio público creado (y con acceso para la app de Claude)
- [ ] Canal de YouTube creado y teléfono verificado
- [ ] `YOUTUBE_API_KEY`
- [ ] `GEMINI_API_KEY`
- [ ] `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` (plan pago para uso comercial)
- [ ] Marca nueva en Metricool con YouTube conectado
- [ ] Claves cargadas en el entorno
- [ ] `api.elevenlabs.io` y `cdn.jsdelivr.net` permitidos
- [ ] Sesión nueva → "probá el canal"
