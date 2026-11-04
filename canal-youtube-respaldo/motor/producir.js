#!/usr/bin/env node
/*
 * Produce un video completo a partir de un guion JSON.
 *
 *   node motor/producir.js guiones/2026-11-09-blockbuster.json [--sin-voz] [--fps 30] [--salida videos]
 *
 * Pasos: voz (ElevenLabs, con tiempos por palabra) → animación (motor.html) → mezcla con música
 * → normalización a -14 LUFS → MP4 + miniatura + datos para Metricool.
 * Sin ELEVENLABS_API_KEY (o con --sin-voz) genera una versión sin voz con tiempos estimados.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const flag = n => args.includes(n);
const archivo = args.find(a => a.endsWith('.json'));
if (!archivo) { console.error('Uso: node motor/producir.js guiones/<id>.json [--sin-voz] [--fps 30]'); process.exit(1); }

const guion = JSON.parse(fs.readFileSync(archivo, 'utf8'));
const canal = JSON.parse(fs.readFileSync(path.join(RAIZ, 'config/canal.json'), 'utf8'));
guion.canal = guion.canal || canal.canal;
const id = guion.id || path.basename(archivo, '.json');
const corto = (guion.formato || 'short') === 'short';
const fps = Number(opt('--fps', corto ? 30 : 25));
const salida = path.resolve(opt('--salida', path.join(RAIZ, 'videos')));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'video-' + id + '-'));
fs.mkdirSync(salida, { recursive: true });

const ff = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: ['ignore', 'inherit', 'inherit'] });
const dur = f => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
const log = (...m) => console.log('·', ...m);

// ---------- 1. Voz ----------
const LEAD = 0.15, GAP = 0.35;
async function voz() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (flag('--sin-voz') || !key) { log(key ? 'Modo sin voz (--sin-voz).' : 'Sin ELEVENLABS_API_KEY: versión sin voz con tiempos estimados.'); return null; }
  const voiceId = process.env.ELEVENLABS_VOICE_ID || canal.voz?.voice_id;
  if (!voiceId) throw new Error('Falta el voice_id de ElevenLabs (config/canal.json → voz.voice_id o ELEVENLABS_VOICE_ID).');
  const timing = []; let acc = 0; const wavs = [];
  for (const [i, s] of guion.escenas.entries()) {
    const texto = s.texto_voz || s.texto;
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ text: texto, model_id: canal.voz?.modelo || 'eleven_multilingual_v2',
        voice_settings: Object.assign({ stability: 0.45, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true }, canal.voz?.ajustes || {}) })
    });
    if (!res.ok) throw new Error(`ElevenLabs respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const j = await res.json();
    const mp3 = path.join(tmp, `voz-${i}.mp3`); fs.writeFileSync(mp3, Buffer.from(j.audio_base64, 'base64'));
    const d = dur(mp3) + LEAD + GAP;
    // tiempos por palabra a partir de la alineación por carácter
    const words = s.texto.split(/\s+/).filter(Boolean);
    let wt = null;
    const al = j.alignment;
    if (!s.texto_voz && al) {
      const starts = []; let inWord = false;
      al.characters.forEach((c, k) => { if (/\s/.test(c)) inWord = false; else if (!inWord) { inWord = true; starts.push(al.character_start_times_seconds[k]); } });
      if (starts.length === words.length) wt = starts.map(t => t + LEAD);
    }
    if (!wt) { // reparto proporcional si el texto en pantalla difiere del leído
      const w = words.map(x => 1 + x.length / 9), tot = w.reduce((a, b) => a + b, 0); let c = LEAD;
      const span = d - LEAD - GAP; wt = w.map(x => { const t = c; c += x / tot * span; return t; });
    }
    timing.push({ start: acc, dur: d, words: words.map((w, k) => ({ w, t: wt[k] })) });
    const wav = path.join(tmp, `voz-${i}.wav`);
    ff(['-i', mp3, '-af', `adelay=${LEAD * 1000}|${LEAD * 1000},apad=whole_dur=${d.toFixed(3)}`, '-ar', '48000', '-ac', '2', wav]);
    wavs.push(wav); acc += d;
    log(`voz escena ${i + 1}/${guion.escenas.length}: ${d.toFixed(1)} s`);
  }
  const lista = path.join(tmp, 'voz.txt'); fs.writeFileSync(lista, wavs.map(w => `file '${w}'`).join('\n'));
  const vozWav = path.join(tmp, 'voz.wav'); ff(['-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', vozWav]);
  return { timing, vozWav };
}

// ---------- 2. Animación (en paralelo por tramos) ----------
async function animar(timing) {
  const html = 'file://' + path.join(__dirname, 'motor.html');
  const navegador = await chromium.launch();
  const abrir = async () => {
    const p = await navegador.newPage({ viewport: corto ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await p.goto(html); await p.evaluate(() => document.fonts.ready);
    const total = await p.evaluate(([g, t]) => init(g, t), [guion, timing]);
    const usado = await p.evaluate(() => window.TIMING_USED);
    return { p, total, usado };
  };
  const { total, usado } = await abrir().then(async o => { await o.p.close(); return o; });
  const frames = Math.ceil(total * fps), N = Math.min(4, os.cpus().length), tramo = Math.ceil(frames / N);
  log(`animación: ${total.toFixed(1)} s, ${frames} cuadros, ${N} tramos en paralelo`);
  const partes = await Promise.all([...Array(N)].map(async (_, k) => {
    const desde = k * tramo, hasta = Math.min(frames, desde + tramo); if (desde >= hasta) return null;
    const { p } = await abrir(); const out = path.join(tmp, `parte-${k}.mp4`);
    const enc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = desde; f < hasta; f++) {
      await p.evaluate(t => render(t), f / fps);
      const buf = await p.screenshot({ type: 'jpeg', quality: 90 });
      if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
    }
    enc.stdin.end(); await new Promise(r => enc.on('close', r)); await p.close(); return out;
  }));
  const lista = path.join(tmp, 'partes.txt'); fs.writeFileSync(lista, partes.filter(Boolean).map(f => `file '${f}'`).join('\n'));
  const mudo = path.join(tmp, 'mudo.mp4'); ff(['-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', mudo]);
  // miniatura
  const tp = await navegador.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await tp.goto(html); await tp.evaluate(() => document.fonts.ready); await tp.evaluate(g => thumb(g), guion);
  const mini = path.join(salida, `${id}-miniatura.jpg`); await tp.screenshot({ path: mini, type: 'jpeg', quality: 92 });
  await navegador.close();
  return { mudo, total, mini, usado };
}

// ---------- 3. Mezcla ----------
function mezclar(mudo, total, vozWav) {
  const out = path.join(salida, `${id}${vozWav ? '' : '-sin-voz'}.mp4`);
  const musica = opt('--musica', guion.musica || canal.musica?.archivo);
  const musPath = musica && fs.existsSync(path.resolve(RAIZ, musica)) ? path.resolve(RAIZ, musica) : null;
  const vol = canal.musica?.volumen ?? 0.12;
  const ins = ['-i', mudo]; let filtro, mapA;
  if (vozWav && musPath) {
    ins.push('-i', vozWav, '-stream_loop', '-1', '-i', musPath);
    filtro = `[1:a]asplit=2[v1][v2];[2:a]volume=${vol},afade=t=in:d=1,afade=t=out:st=${Math.max(0, total - 1.5)}:d=1.5[m];[m][v1]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[md];[v2][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
    mapA = '[a]';
  } else if (vozWav) {
    ins.push('-i', vozWav); filtro = `[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]`; mapA = '[a]';
  } else if (musPath) {
    ins.push('-stream_loop', '-1', '-i', musPath); filtro = `[1:a]afade=t=in:d=1,afade=t=out:st=${Math.max(0, total - 1.5)}:d=1.5,loudnorm=I=-16:TP=-1.5[a]`; mapA = '[a]';
  } else {
    ins.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'); filtro = null; mapA = '1:a';
  }
  ff([...ins, ...(filtro ? ['-filter_complex', filtro] : []), '-map', '0:v', '-map', mapA, '-t', total.toFixed(3),
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out]);
  return out;
}

// ---------- 4. Datos para Metricool ----------
function capitulos(usado) {
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const caps = guion.escenas.map((s, i) => s.capitulo ? `${mmss(i === 0 ? 0 : usado[i].start)} ${s.capitulo}` : null).filter(Boolean);
  return caps.join('\n');
}

function datosMetricool(mp4, mini, usado) {
  const base = canal.publicacion?.url_base; // p. ej. https://raw.githubusercontent.com/<usuario>/<repo>/main/videos/
  const url = f => base ? base.replace(/\/?$/, '/') + path.basename(f) : `(subir ${path.basename(f)} y completar la URL pública)`;
  const info = {
    providers: [{ network: 'youtube' }],
    text: (guion.descripcion || '').replace('{{CAPITULOS}}', capitulos(usado)),
    media: [url(mp4)],
    autoPublish: true,
    publicationDate: { dateTime: guion.fecha_publicacion || '', timezone: canal.publicacion?.zona || 'Europe/Madrid' },
    youtubeData: {
      title: guion.titulo, type: corto ? 'short' : 'video', privacy: 'public',
      tags: guion.etiquetas || [], category: guion.categoria || canal.youtube?.categoria || 'EDUCATION',
      madeForKids: false, isAiGeneratedContent: !!guion.contenido_ia_realista
    }
  };
  if (!corto) info.videoThumbnailUrl = url(mini);
  const f = path.join(salida, `${id}.metricool.json`);
  fs.writeFileSync(f, JSON.stringify({ blogId: canal.metricool?.blogId || 'COMPLETAR', info }, null, 2));
  return f;
}

(async () => {
  const t0 = Date.now();
  const v = await voz();
  const { mudo, total, mini, usado } = await animar(v?.timing || null);
  const mp4 = mezclar(mudo, total, v?.vozWav);
  const meta = datosMetricool(mp4, mini, usado);
  fs.rmSync(tmp, { recursive: true, force: true });
  log(`listo en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  console.log(JSON.stringify({ video: mp4, miniatura: mini, metricool: meta, duracion: Number(total.toFixed(1)) }));
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
