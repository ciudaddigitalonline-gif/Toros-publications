# Formato de guion (`guiones/<id>.json`)

Cada video es un archivo JSON. El motor (`motor/producir.js`) lo convierte en MP4 + miniatura + datos para Metricool.

```json
{
  "id": "2026-11-09-short-blockbuster",
  "formato": "short",                      // "short" (1080x1920) o "largo" (1920x1080)
  "titulo": "…",                           // título de YouTube (< 60 caracteres ideal, máx. 100)
  "descripcion": "…",                      // incluye hashtags y fuentes
  "etiquetas": ["…"],
  "categoria": "EDUCATION",
  "fecha_publicacion": "2026-11-09T19:00:00",  // hora local de config.publicacion.zona
  "colores": { "a": "#2E5BE0", "b": "#E2142D" },  // colores que evocan a las marcas de la historia (nunca logos)
  "miniatura": { "texto": "DIJO\nQUE NO", "emoji": "💸", "fondo": "#F7C631", "sub": "$50 MILLONES" },
  "relacionado": "2026-11-12-largo-kodak",  // opcional: video largo al que lleva este Short
  "contenido_ia_realista": false,           // true solo si hay imágenes/voces realistas que puedan confundir
  "escenas": [ { "tipo": "…", "texto": "…", … } ]
}
```

## Campos comunes de cada escena
| Campo | Uso |
|---|---|
| `texto` | Narración. Se muestra como subtítulo palabra por palabra. **Obligatorio.** |
| `texto_voz` | Opcional: cómo debe leerlo la voz (números en letras, siglas). Ej.: texto "9.000", voz "nueve mil". |
| `tipo` | Uno de los tipos de abajo. |
| `etiqueta` | Píldora arriba de la escena ("DALLAS · 2000"). `etiqueta_color`: `a`, `b`, `amarillo`, `rojo`, `verde` o un color. |
| `sello` | `{ "texto": "QUIEBRA", "en": 0.8, "y": 0.86 }` sello rojo que cae en el momento `en` (fracción de la escena), a la altura `y`. |
| `capitulo` | Solo videos largos: título del capítulo que empieza en esta escena. La primera escena debe tenerlo. La descripción usa `{{CAPITULOS}}` y el motor pone las marcas de tiempo reales. |
| `nota` | Aclaración chica al pie ("según Marc Randolph"). Usarla cada vez que un dato es una versión y no un hecho confirmado. |

## Tipos de escena
| Tipo | Campos | Para qué |
|---|---|---|
| `titulo` | `grande`, `sub`, `tam`, `color` | Frase grande, gancho, conclusión |
| `objeto` | `emoji`, `rotulo` | Un objeto o idea simple (📦, 🎞️, 💡) |
| `numero` | `desde`, `hasta`, `prefijo`, `sufijo`, `rotulo`, `puntos` (true/false), `color` | Contador animado (locales, millones, años) |
| `cheque` | `para`, `monto`, `letras`, `firma`, `banco`, `romper`, `romper_en` | Ofertas, compras, montos |
| `documento` | `encabezado`, `filas: [[izq, der]]`, `total: {rotulo, desde, hasta, prefijo, sufijo}` | Tickets, facturas, listas de costos |
| `linea_tiempo` | `hitos: [{anio, rotulo, icono, color}]` (2 a 5) | Cronologías |
| `grafico` | `rotulo`, `tendencia` ("sube"/"baja") o `valores: [..]`, `color` | Ventas, acciones, pérdidas |
| `comparacion` | `izq` y `der`: `{titulo, valor, emoji, color}` | Rival contra rival, antes/después |
| `personajes` | `grupos: [{n, color, rotulo, grande}]`, `burbujas`, `mesa` | Reuniones, negociaciones (siluetas, nunca caras reales) |
| `mapa` | `modo` ("apagar"/"encender"), `grande`, `rotulo` | Expansión o cierre de locales |
| `lista` | `items: [..]` | Rankings, pasos, errores |
| `cita` | `texto_cita`, `autor` | Frases documentadas (con fuente) |
| `pregunta` | `pregunta`, `opciones` | Cierre con pregunta para comentarios |

## Reglas
- Short: 6 a 9 escenas, 30 a 50 s. Largo: 25 a 60 escenas, 8 a 12 min, con capítulos en la descripción.
- La primera escena es el gancho; la última de un Short vuelve visualmente a la primera (loop).
- Nada de logos, fotos ni clips reales con derechos: el motor solo usa formas, colores, emojis y texto.
- Todo dato debe estar en las fuentes de la descripción; lo dudoso va con `nota` o se saca.
