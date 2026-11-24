// Exportar el storyboard (PDF y PNG) y el vídeo de los planos.
// main.js aporta cómo dibujar un plano en un momento dado (api.begin / frame / end).
// Los archivos se descargan: tras un rato de trabajo el navegador ya no deja abrir «Guardar como».

let api = null, busy = false, stop = false;

export function setupExport(a) {
  api = a;
  const d = document.createElement('div');
  d.id = 'expDlg';
  d.hidden = true;
  d.innerHTML = `<div class="ex-box">
  <h3>🎞️ Exportar</h3>
  <p class="hint" id="exInfo"></p>
  <section><h4>Storyboard</h4>
    <div class="row"><label>Fotograma de cada plano<select id="exMom"><option value="0">Al empezar</option><option value=".5">A la mitad</option><option value="1">Al terminar</option></select></label>
    <label>Viñetas por página<select id="exPer"><option value="4">4</option><option value="6" selected>6</option></select></label></div>
    <label class="chk"><input type="checkbox" id="exPdf" checked> PDF listo para imprimir</label>
    <label class="chk"><input type="checkbox" id="exPng" checked> Imágenes PNG sueltas (en un .zip)</label>
    <button id="exSb" class="pri">Exportar storyboard</button></section>
  <section><h4>Vídeo</h4>
    <div class="row"><label>Planos<select id="exWhich"><option value="cur">Solo el plano actual</option><option value="all">Todos seguidos (animatic)</option></select></label>
    <label>Calidad<select id="exRes"><option value="1280">HD (1280 px)</option><option value="1920">Full HD (1920 px)</option></select></label>
    <label>Fotogramas/s<select id="exFps"><option>24</option><option selected>25</option><option>30</option></select></label></div>
    <label class="chk"><input type="checkbox" id="exTag" checked> Rótulo con el plano, la lente y el tiempo</label>
    <button id="exVid" class="pri">Exportar vídeo</button></section>
  <div id="exProg" hidden><progress max="1" value="0"></progress><p class="hint" id="exPT"></p><button id="exStop">Cancelar</button></div>
  <div class="row ex-end"><button id="exClose">Cerrar</button></div></div>`;
  document.body.appendChild(d);
  const $ = s => d.querySelector(s);
  $('#exClose').onclick = () => { if (!busy) d.hidden = true; };
  $('#exStop').onclick = () => { stop = true; };
  $('#exSb').onclick = () => run(storyboard);
  $('#exVid').onclick = () => run(video);
  d.addEventListener('keydown', e => { if (e.key === 'Escape' && !busy) d.hidden = true; });
}

export function openExport() {
  const d = document.getElementById('expDlg'), n = api.shots().length;
  d.querySelector('#exInfo').textContent = n
    ? `${n} plano${n > 1 ? 's' : ''} con cámara en «${api.loc()}». Se usa el estilo 3D y el formato de imagen que tengas elegidos.`
    : 'Esta localización aún no tiene planos con cámara. Crea uno en la pestaña Cámara.';
  d.querySelectorAll('.pri').forEach(b => { b.disabled = !n; });
  d.hidden = false;
}

const $d = s => document.querySelector('#expDlg ' + s);
function prog(v, t) { $d('#exProg progress').value = v; $d('#exPT').textContent = t; }

async function run(fn) {
  if (busy) return;
  busy = true; stop = false;
  $d('#exProg').hidden = false;
  document.querySelectorAll('#expDlg button:not(#exStop), #expDlg select, #expDlg input').forEach(e => { e.disabled = true; });
  let st = null;
  try {
    st = await api.begin();
    await fn();
  } catch (e) {
    console.error(e);
    if (e && e.name !== 'AbortError') api.toast('No se pudo exportar: ' + ((e && e.message) || e));
  } finally {
    if (st) api.end(st);
    busy = false;
    $d('#exProg').hidden = true;
    document.querySelectorAll('#expDlg button, #expDlg select, #expDlg input').forEach(e => { e.disabled = false; });
  }
}

// Dibuja un plano en el segundo t y lo copia a un lienzo propio de W×H
function grab(shot, t, W, H, tag, c = document.createElement('canvas')) {
  const gl = api.frame(shot.id, t, W, H);
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.drawImage(gl, 0, 0, W, H);
  if (tag) {
    const f = Math.round(H / 26);
    x.font = `600 ${f}px system-ui, sans-serif`;
    x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = f / 3;
    x.fillStyle = '#fff';
    x.textBaseline = 'bottom';
    x.fillText(`${shot.n}  ·  ${shot.lens} mm`, f, H - f * .7);
    x.textAlign = 'right';
    x.fillText(tc(t), W - f, H - f * .7);
  }
  return c;
}
const tc = t => { const s = Math.floor(t), f = Math.floor((t - s) * 100); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')},${String(f).padStart(2, '0')}`; };
// Sin tildes: algunos navegadores no respetan el nombre de descarga si las lleva
const fname = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\\/:*?"<>|«»]+/g, '_').trim() || 'plano';
const sec = v => v.toFixed(1).replace('.', ',') + ' s';

async function storyboard() {
  const pdf = $d('#exPdf').checked, png = $d('#exPng').checked;
  if (!pdf && !png) { api.toast('Marca PDF, imágenes o las dos'); return; }
  const shots = api.shots(), mom = +$d('#exMom').value, W = 1280, H = Math.round(W / api.asp()), shotsImg = [];
  for (let i = 0; i < shots.length; i++) {
    if (stop) throw new DOMException('cancelado', 'AbortError');
    const s = shots[i];
    prog(i / shots.length, `Dibujando ${s.n} (${i + 1} de ${shots.length})…`);
    shotsImg.push(grab(s, Math.max(0, Math.min(s.dur - .001, s.dur * mom)), W, H, false));
    await new Promise(r => setTimeout(r, 0));
  }
  const base = fname(api.project() + ' - ' + api.loc() + ' - storyboard');
  if (pdf) {
    prog(.9, 'Montando el PDF…');
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }), per = +$d('#exPer').value;
    const cols = per === 4 ? 2 : 3, rows = 2, M = 12, PW = 297, PH = 210, top = 24, gap = 8;
    const cw = (PW - 2 * M - gap * (cols - 1)) / cols, ch = (PH - top - M - gap * (rows - 1)) / rows;
    const pages = Math.ceil(shots.length / per);
    shots.forEach((s, i) => {
      const k = i % per;
      if (k === 0) {
        if (i) doc.addPage();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(30);
        doc.text(`${api.project()} — ${api.loc()}`, M, 15);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120);
        doc.text(`Storyboard · ${new Date().toLocaleDateString('es-ES')}`, PW - M, 15, { align: 'right' });
        doc.text(`Previz Studio · página ${Math.floor(i / per) + 1} de ${pages}`, PW - M, PH - 5, { align: 'right' });
      }
      const x = M + (k % cols) * (cw + gap), y = top + Math.floor(k / cols) * (ch + gap);
      let iw = cw, ih = cw / api.asp();
      const textH = per === 4 ? 22 : 18;
      if (ih > ch - textH) { ih = ch - textH; iw = ih * api.asp(); }
      doc.addImage(shotsImg[i].toDataURL('image/jpeg', .86), 'JPEG', x, y, iw, ih);
      doc.setDrawColor(60); doc.setLineWidth(.3); doc.rect(x, y, iw, ih);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30);
      doc.text(`${i + 1}. ${s.n}`, x, y + ih + 5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(90);
      doc.text(`${s.lens} mm · ${sec(s.dur)}`, x + iw, y + ih + 5, { align: 'right' });
      if (s.nt) { doc.setTextColor(50); doc.text(doc.splitTextToSize(s.nt, iw).slice(0, per === 4 ? 4 : 3), x, y + ih + 10); }
    });
    await api.save(doc.output('blob'), base + '.pdf', 'Storyboard en PDF', 'application/pdf', '.pdf');
  }
  if (png) {
    prog(.95, 'Preparando las imágenes…');
    const { zipSync } = await import('three/addons/libs/fflate.module.js'), files = {};
    for (let i = 0; i < shots.length; i++) {
      const b = await new Promise(r => shotsImg[i].toBlob(r, 'image/png'));
      files[String(i + 1).padStart(2, '0') + ' ' + fname(shots[i].n) + '.png'] = [new Uint8Array(await b.arrayBuffer()), { level: 0 }];
    }
    await api.save(new Blob([zipSync(files)], { type: 'application/zip' }), base + ' (imágenes).zip', 'Imágenes del storyboard', 'application/zip', '.zip');
  }
  api.toast('Storyboard exportado');
}

async function video() {
  const all = $d('#exWhich').value === 'all', fps = +$d('#exFps').value, tag = $d('#exTag').checked;
  const W = +$d('#exRes').value, H = Math.round(W / api.asp() / 2) * 2;
  const shots = all ? api.shots() : api.shots().filter(s => s.id === api.curId());
  if (!shots.length) { api.toast('Este plano aún no tiene cámara'); return; }
  const mb = await import('mediabunny');
  const codec = await mb.getFirstEncodableVideoCodec(['avc', 'vp9', 'vp8'], { width: W, height: H });
  if (!codec) throw new Error('este ordenador no puede codificar vídeo');
  const mp4 = codec === 'avc', out = new mb.Output({ format: mp4 ? new mb.Mp4OutputFormat({ fastStart: 'in-memory' }) : new mb.WebMOutputFormat(), target: new mb.BufferTarget() });
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const src = new mb.CanvasSource(cv, { codec, quality: mb.QUALITY_HIGH });
  out.addVideoTrack(src, { frameRate: fps });
  await out.start();
  const counts = shots.map(s => Math.max(1, Math.round(s.dur * fps))), total = counts.reduce((a, b) => a + b, 0);
  let n = 0;
  try {
    for (let i = 0; i < shots.length; i++) {
      for (let f = 0; f < counts[i]; f++) {
        if (stop) throw new DOMException('cancelado', 'AbortError');
        grab(shots[i], f / fps, W, H, tag, cv);
        await src.add(n / fps, 1 / fps);
        n++;
        if (n % 5 === 0) prog(n / total, `${shots[i].n} · fotograma ${n} de ${total}`);
      }
    }
    prog(1, 'Guardando el vídeo…');
    await out.finalize();
  } catch (e) {
    await out.cancel();
    throw e;
  }
  const name = fname(api.project() + ' - ' + (all ? api.loc() : shots[0].n)) + (mp4 ? '.mp4' : '.webm');
  await api.save(new Blob([out.target.buffer], { type: mp4 ? 'video/mp4' : 'video/webm' }), name, 'Vídeo', mp4 ? 'video/mp4' : 'video/webm', mp4 ? '.mp4' : '.webm');
  api.toast('Vídeo exportado' + (mp4 ? '' : ' (WebM: este equipo no tiene codificador MP4)'));
}
