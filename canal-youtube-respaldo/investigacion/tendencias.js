#!/usr/bin/env node
/*
 * Busca en YouTube los videos del nicho que están rindiendo mucho más que el tamaño de su canal
 * ("outliers"): la señal más confiable de que un TEMA funciona, no solo un canal grande.
 *
 *   node investigacion/tendencias.js [--dias 30] [--max 25]
 *
 * Requiere YOUTUBE_API_KEY (API de datos de YouTube v3, gratuita: 10.000 unidades/día;
 * esta búsqueda gasta ~100 por consulta configurada).
 * Escribe investigacion/AAAA-MM-DD.json y .md con el ranking.
 */
const fs = require('fs');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) { console.error('Falta YOUTUBE_API_KEY en el entorno.'); process.exit(1); }

const canal = JSON.parse(fs.readFileSync(path.join(RAIZ, 'config/canal.json'), 'utf8'));
const dias = Number(opt('--dias', 30)), maxOut = Number(opt('--max', 25));
const desde = new Date(Date.now() - dias * 864e5).toISOString();
const API = 'https://www.googleapis.com/youtube/v3/';

async function yt(endpoint, params) {
  const u = new URL(API + endpoint); Object.entries({ ...params, key: KEY }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u); const j = await r.json();
  if (!r.ok) throw new Error(`${endpoint}: ${r.status} ${j.error?.message || ''}`);
  return j;
}
const isoDur = s => { const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s || '') || []; return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0); };

(async () => {
  const ids = new Map();
  for (const q of canal.nicho.consultas_tendencias) {
    for (const duration of ['short', 'medium', 'long']) {
      if (duration === 'long' && q !== canal.nicho.consultas_tendencias[0]) continue; // ahorrar cuota
      const j = await yt('search', { part: 'snippet', q, type: 'video', order: 'viewCount', publishedAfter: desde,
        relevanceLanguage: canal.nicho.idioma || 'es', maxResults: 25, videoDuration: duration, safeSearch: 'moderate' });
      j.items.forEach(it => ids.has(it.id.videoId) || ids.set(it.id.videoId, q));
    }
  }
  const vids = [];
  const lista = [...ids.keys()];
  for (let i = 0; i < lista.length; i += 50) {
    const j = await yt('videos', { part: 'snippet,statistics,contentDetails', id: lista.slice(i, i + 50).join(',') });
    vids.push(...j.items);
  }
  const chIds = [...new Set(vids.map(v => v.snippet.channelId))]; const subs = {};
  for (let i = 0; i < chIds.length; i += 50) {
    const j = await yt('channels', { part: 'statistics', id: chIds.slice(i, i + 50).join(',') });
    j.items.forEach(c => subs[c.id] = c.statistics.hiddenSubscriberCount ? null : Number(c.statistics.subscriberCount));
  }
  const ahora = Date.now();
  const filas = vids.map(v => {
    const vistas = Number(v.statistics.viewCount || 0), s = subs[v.snippet.channelId];
    const diasPub = Math.max(1, (ahora - new Date(v.snippet.publishedAt)) / 864e5);
    const segs = isoDur(v.contentDetails.duration);
    return {
      titulo: v.snippet.title, canal: v.snippet.channelTitle, url: `https://www.youtube.com/watch?v=${v.id}`,
      formato: segs <= 180 ? 'short' : 'largo', duracion_s: segs, publicado: v.snippet.publishedAt.slice(0, 10),
      vistas, suscriptores: s, vistas_por_dia: Math.round(vistas / diasPub),
      // cuántas veces supera el video al tamaño del canal: >3 es una señal fuerte de tema ganador
      multiplicador: s ? +(vistas / Math.max(s, 1000)).toFixed(1) : null,
      comentarios: Number(v.statistics.commentCount || 0), consulta: ids.get(v.id), idioma: v.snippet.defaultAudioLanguage || v.snippet.defaultLanguage || ''
    };
  }).filter(f => f.vistas >= 5000 && (f.suscriptores == null || f.suscriptores <= 500000));
  filas.sort((a, b) => (b.multiplicador ?? 0) * Math.log10(b.vistas_por_dia + 10) - (a.multiplicador ?? 0) * Math.log10(a.vistas_por_dia + 10));
  const top = filas.slice(0, maxOut);
  const hoy = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(__dirname, `${hoy}.json`), JSON.stringify({ fecha: hoy, dias, total_analizados: vids.length, top }, null, 2));
  const md = [`# Tendencias del nicho — ${hoy} (últimos ${dias} días)`, '', `Analizados: ${vids.length} videos. Se muestran los que más superan el tamaño de su canal (canales de hasta 500.000 suscriptores).`, '',
    '| # | Video | Canal | Formato | Vistas | Subs | × canal | Vistas/día |', '|---|---|---|---|---|---|---|---|',
    ...top.map((f, i) => `| ${i + 1} | [${f.titulo.replace(/\|/g, '/')}](${f.url}) | ${f.canal.replace(/\|/g, '/')} | ${f.formato} | ${f.vistas.toLocaleString('es')} | ${f.suscriptores?.toLocaleString('es') ?? 'oculto'} | ${f.multiplicador ?? '—'} | ${f.vistas_por_dia.toLocaleString('es')} |`),
    '', '> Usar estos videos solo como señal de TEMA y FORMATO. Nunca descargar ni reutilizar su material: cada pieza del canal se escribe y se produce desde cero.'].join('\n');
  fs.writeFileSync(path.join(__dirname, `${hoy}.md`), md);
  console.log(md);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
