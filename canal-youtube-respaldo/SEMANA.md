# Ciclo semanal (lo que ejecuta la tarea programada cada lunes)

Usar la skill `youtube-canal-viral`. Trabajar en este repositorio. Leer `config/canal.json` y el calendario más reciente en `calendario/`.

1. **Métricas de la semana anterior.** Si hay videos publicados, leer en Metricool (marca de `metricool.blogId`) vistas, retención, CTR y suscriptores por video, y anotarlos en `metricas/registro.csv`. Sacar una sola conclusión accionable.
2. **Tendencias.** Ejecutar `node investigacion/tendencias.js`. Elegir, de los videos con mayor multiplicador, los temas que encajan con el nicho y que todavía no hicimos (revisar `guiones/`). Nunca copiar un video: solo tomar el tema o el formato.
   Con la skill `/watch` (requiere `GEMINI_API_KEY`), analizar los 3 videos con mayor multiplicador: gancho de los primeros 3 segundos, ritmo de cortes, ángulo de la historia, cierre y llamado a la acción. Anotar las conclusiones en `investigacion/AAAA-MM-DD-analisis.md`. Solo estructura: nunca reutilizar su material.
3. **Plan de la semana siguiente.** 1 video largo (jueves) + 6 Shorts (lunes a sábado), 2 de ellos derivados del largo. Guardarlo en `calendario/AAAA-MM-DD.md`.
4. **Guiones.** Escribir cada guion en `guiones/<fecha>-<tipo>-<tema>.json` según `motor/FORMATO-GUION.md`. Verificar cada dato con búsqueda web; si no se confirma, sacarlo o marcarlo con `nota`. Poner las fuentes en la descripción.
5. **Producción.** `node motor/producir.js guiones/<id>.json` para cada guion. Revisar 3 cuadros de cada video (inicio, medio, final) buscando textos superpuestos o cortados; corregir y volver a producir si hace falta.
6. **Subida.** Commit y push de `guiones/`, `videos/`, `calendario/` e `investigacion/` a la rama principal de este repositorio público.
7. **Programación.** Para cada video, usar `videos/<id>.metricool.json`:
   - si `publicacion.requiere_aprobacion` es true: `createScheduledPostForReview` con `reviewers` = `publicacion.revisor` y `approvalSystem` "any"; si el plan de Metricool no lo permite, `createScheduledPost` con `"draft": true`;
   - si es false: `createScheduledPost` normal.
8. **Resumen** al dueño del canal: qué se programó, enlaces de Metricool, dudas de verificación, y la conclusión de las métricas.

Si falta una clave, un permiso o la conexión del canal, no inventar resultados: hacer lo que se pueda y avisar qué falta.
