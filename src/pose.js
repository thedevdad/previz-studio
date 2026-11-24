// Editor de pose para personajes importados con esqueleto.
// Guarda en el personaje (o.bp) un giro extra por articulación, que se suma
// a la animación que esté usando; o.pt fija el momento de la animación en reposo.
// Con fotogramas clave (o.kf = [{t, bp}]) la pose cambia a lo largo del plano.
import { THREE } from './lib/three.js';

const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
// Pose en el segundo t, mezclando suavemente las dos claves que lo rodean
export function kfPose(kf, t) {
  if (t <= kf[0].t) return kf[0].bp;
  const z = kf[kf.length - 1];
  if (t >= z.t) return z.bp;
  let i = 0;
  while (kf[i + 1].t < t) i++;
  const a = kf[i], b = kf[i + 1], u = (t - a.t) / (b.t - a.t), e = u * u * (3 - 2 * u), out = {};
  new Set([...Object.keys(a.bp), ...Object.keys(b.bp)]).forEach(n => {
    qa.set(0, 0, 0, 1); qb.set(0, 0, 0, 1);
    if (a.bp[n]) qa.fromArray(a.bp[n]);
    if (b.bp[n]) qb.fromArray(b.bp[n]);
    out[n] = qa.slerp(qb, e).toArray();
  });
  return out;
}

const POSES = [['stand', 'De pie'], ['sit', 'Sentado'], ['phone', 'Al teléfono'], ['walk', 'Andando'], ['run', 'Corriendo']];
const r4 = v => Math.round(v * 1e4) / 1e4;

export function openPose(o, { build, onDone, pushU, t0, dur }) {
  const root = build(o);
  if (!root) return false;
  pushU();
  // Copia propia: los duplicados no comparten retoques
  if (o.bp) o.bp = { ...o.bp };
  if (o.kf) o.kf = JSON.parse(JSON.stringify(o.kf));
  const before = JSON.stringify({ bp: o.bp, pt: o.pt, pose: o.pose, kf: o.kf });
  let T = Math.min(t0 || 0, dur), playing = false;
  const hist = [];

  // ---- Ventana ----
  const ov = document.createElement('div');
  ov.id = 'poseEd';
  ov.innerHTML = `<div class="pe-view"><canvas></canvas><div class="pe-hud">Haz clic en un punto naranja para elegir una articulación · arrastra los aros para girarla · arrastra el fondo para rodear al personaje · rueda: zoom</div></div>
  <aside class="pe-side"><h3>🦴 Editor de pose</h3><p class="hint">${esc(o.n || 'Personaje')}</p>
  <label>Pose de partida<select id="peBase">${POSES.map(p => `<option value="${p[0]}">${p[1]}</option>`).join('')}</select></label>
  <label>Momento de la animación <span id="peTT"></span><input type="range" id="peT" min="0" max="1000" value="0"></label>
  <label class="pe-chk"><input type="checkbox" id="peFix"> Quieto en este momento (si no, se mueve)</label>
  <h3>Animación</h3>
  <label>Tiempo del plano <span id="peKT"></span><input type="range" id="peK" min="0" max="1000"></label>
  <div id="peTrack"></div>
  <div class="row"><button id="peKey">◆ Clave aquí</button><button id="peKDel">✕ Borrar clave</button></div>
  <div class="row"><button id="pePlay">▶ Probar</button><button id="peKOff">Quitar animación</button></div>
  <p class="hint" id="peKH"></p>
  <h3>Articulación</h3><p class="hint" id="peSel">Ninguna elegida.</p>
  <div class="row"><button id="peR1">↺ Esta articulación</button><button id="peUndo">Deshacer</button></div>
  <button id="peRA">↺ Quitar todos los retoques</button>
  <input type="search" id="peQ" placeholder="Buscar articulación…">
  <div id="peList"></div>
  <div class="row pe-end"><button id="peNo">Cancelar</button><button id="peOk" class="on">✔ Listo</button></div></aside>`;
  document.body.appendChild(ov);
  const $ = s => ov.querySelector(s), cv = $('canvas');

  // ---- Escena ----
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  r.setPixelRatio(Math.min(2, devicePixelRatio));
  const sc = new THREE.Scene();
  sc.background = new THREE.Color(0x24262b);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2.2));
  const dl = new THREE.DirectionalLight(0xffffff, 2.2);
  dl.position.set(2, 4, 3);
  sc.add(dl);
  const grid = new THREE.GridHelper(4, 16, 0x555a63, 0x3a3e45);
  sc.add(grid);
  const H = o.z || 1.7;
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  sc.add(root);
  const cam = new THREE.PerspectiveCamera(35, 1, .05, 100);
  cam.position.set(H * .9, H * .75, H * 2.1);
  const orb = new THREE.OrbitControls(cam, cv);
  orb.target.set(0, H * .55, 0);
  orb.update();
  const tc = new THREE.TransformControls(cam, cv);
  tc.setMode('rotate');
  tc.setSpace('local');
  tc.setSize(.8);
  sc.add(tc.getHelper());

  // Articulaciones: todos los huesos del personaje
  const bones = [];
  root.traverse(n => { if (n.isBone) bones.push(n); });
  const mk = new THREE.Group();
  sc.add(mk);
  const gm = new THREE.SphereGeometry(H * .016, 12, 8);
  const mOff = new THREE.MeshBasicMaterial({ color: 0xff8a3d, depthTest: false, transparent: true, opacity: .85 });
  const mOn = new THREE.MeshBasicMaterial({ color: 0x4dd2ff, depthTest: false });
  const mEd = new THREE.MeshBasicMaterial({ color: 0xffd23d, depthTest: false, transparent: true, opacity: .9 });
  const dots = bones.map(b => { const d = new THREE.Mesh(gm, mOff); d.renderOrder = 10; d.userData.b = b; mk.add(d); return d; });
  let cur = null;

  // Pose que se está editando: la clave de este momento, o la pose fija
  const near = () => o.kf ? o.kf.find(k => Math.abs(k.t - T) < .05) : null;
  const curP = () => o.kf ? kfPose(o.kf, T) : o.bp || {};
  const keyHere = () => {
    let k = near();
    if (!k) { k = { t: Math.round(T * 10) / 10, bp: { ...curP() } }; o.kf.push(k); o.kf.sort((a, b) => a.t - b.t); }
    return k;
  };
  const label = n => n.replace(/^mixamorig:?/i, '').replace(/[_:]/g, ' ');
  const list = () => {
    const q = $('#peQ').value.trim().toLowerCase(), P = curP();
    $('#peList').innerHTML = bones.map((b, i) => (!q || b.name.toLowerCase().includes(q))
      ? `<button data-b="${i}" class="${b === cur ? 'on' : ''}">${P[b.name] ? '● ' : ''}${esc(label(b.name) || 'hueso ' + i)}</button>` : '').join('');
  };
  const pick = b => {
    cur = b;
    if (b) tc.attach(b); else tc.detach();
    $('#peSel').textContent = b ? label(b.name) : 'Ninguna elegida.';
    list();
  };

  // Estado de partida y momento de la animación
  const clip = () => root.userData.clipFor(o.pose || 'stand');
  const apply = () => {
    const c = clip(), d = c ? c.duration : 0, t = o.pt || 0;
    root.userData.setS({ k: o.pose || 'stand', t, kt: T });
    $('#peTT').textContent = d ? t.toFixed(2).replace('.', ',') + ' s' : '(sin animación)';
    $('#peT').disabled = !d;
    $('#peT').value = d ? Math.round(t / d * 1000) : 0;
    $('#peK').value = Math.round(T / dur * 1000);
    $('#peKT').textContent = T.toFixed(1).replace('.', ',') + ' s';
    $('#peTrack').innerHTML = (o.kf || []).map((k, i) => `<i data-k="${i}" class="${Math.abs(k.t - T) < .05 ? 'on' : ''}" style="left:${k.t / dur * 100}%" title="${k.t.toFixed(1).replace('.', ',')} s"></i>`).join('') + `<b style="left:${T / dur * 100}%"></b>`;
    $('#peKH').textContent = o.kf ? o.kf.length + ' clave' + (o.kf.length > 1 ? 's' : '') + '. Al girar una articulación se guarda en la clave de este momento; si no hay, se crea.' : 'Sin animación: la pose es fija. Pon una clave, mueve el tiempo y cambia la pose para animarla.';
    $('#peKDel').disabled = !near();
    $('#peKOff').disabled = !o.kf;
  };
  $('#peBase').value = o.pose || 'stand';
  $('#peFix').checked = o.pt != null;
  apply();
  list();

  const snap = () => { hist.push(JSON.stringify({ bp: o.bp, kf: o.kf })); if (hist.length > 80) hist.shift(); };
  const tidy = () => { if (o.bp && !Object.keys(o.bp).length) delete o.bp; };
  const setOff = b => {
    const base = root.userData.baseQ.get(b);
    if (!base) return;
    const off = base.clone().invert().multiply(b.quaternion), P = o.kf ? keyHere().bp : (o.bp = o.bp || {});
    if (Math.abs(off.w) > .99999) delete P[b.name];
    else P[b.name] = off.toArray().map(r4);
    tidy();
  };
  tc.addEventListener('dragging-changed', e => { orb.enabled = !e.value; if (e.value) snap(); else { apply(); list(); } });
  tc.addEventListener('objectChange', () => { if (cur) setOff(cur); });

  // Clic en un punto naranja
  const rc = new THREE.Raycaster(), down = {};
  cv.addEventListener('pointerdown', e => { down.x = e.clientX; down.y = e.clientY; });
  cv.addEventListener('pointerup', e => {
    if (tc.dragging || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) return;
    const rect = cv.getBoundingClientRect();
    rc.setFromCamera(new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), cam);
    const h = rc.intersectObjects(dots, false)[0];
    if (h && !playing) pick(h.object.userData.b);
    else if (!tc.axis) pick(null);
  });

  ov.addEventListener('input', e => {
    const id = e.target.id;
    if (id === 'peQ') return list();
    if (id === 'peT') { const c = clip(); o.pt = c ? r4(e.target.value / 1000 * c.duration) : 0; $('#peFix').checked = true; apply(); }
    if (id === 'peFix') { if (e.target.checked) o.pt = o.pt || 0; else delete o.pt; apply(); }
    if (id === 'peBase') { o.pose = e.target.value; apply(); }
    if (id === 'peK') { T = Math.round(e.target.value / 1000 * dur * 10) / 10; apply(); list(); }
  });
  ov.addEventListener('click', e => {
    const b = e.target.closest('[data-b]');
    if (b) return pick(bones[+b.dataset.b]);
    const k = e.target.closest('[data-k]');
    if (k) { T = o.kf[+k.dataset.k].t; apply(); list(); return; }
    const id = e.target.id;
    if (id === 'peR1' && cur && curP()[cur.name]) { snap(); delete (o.kf ? keyHere().bp : o.bp)[cur.name]; tidy(); apply(); list(); }
    if (id === 'peRA') { snap(); if (o.kf) keyHere().bp = {}; else delete o.bp; apply(); list(); }
    if (id === 'peUndo' && hist.length) { const p = JSON.parse(hist.pop()); ['bp', 'kf'].forEach(x => { if (p[x] === undefined) delete o[x]; else o[x] = p[x]; }); apply(); list(); }
    if (id === 'peKey') { snap(); if (!o.kf) { o.kf = [{ t: Math.round(T * 10) / 10, bp: { ...(o.bp || {}) } }]; delete o.bp; } else keyHere(); apply(); list(); }
    if (id === 'peKDel' && near()) { snap(); const P = curP(); o.kf = o.kf.filter(x => x !== near()); if (!o.kf.length) { delete o.kf; if (Object.keys(P).length) o.bp = { ...P }; } apply(); list(); }
    if (id === 'peKOff' && o.kf) { snap(); const P = curP(); delete o.kf; if (Object.keys(P).length) o.bp = { ...P }; apply(); list(); }
    if (id === 'pePlay') { playing = !playing; e.target.textContent = playing ? '■ Parar' : '▶ Probar'; if (playing) { pick(null); if (T >= dur) T = 0; } }
    if (id === 'peNo') { const b0 = JSON.parse(before); ['bp', 'pt', 'pose', 'kf'].forEach(k => { if (b0[k] === undefined) delete o[k]; else o[k] = b0[k]; }); close(); }
    if (id === 'peOk') close();
  });
  const key = e => { if (e.key === 'Escape') close(); };
  addEventListener('keydown', key);

  // Bucle de dibujo
  const v = new THREE.Vector3();
  let raf = 0, last = performance.now();
  const loop = () => {
    const now = performance.now(), dt = Math.min(.1, (now - last) / 1000);
    last = now;
    if (playing) { T += dt; if (T > dur) T = 0; apply(); }
    const w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * r.getPixelRatio()) || cv.height !== Math.round(h * r.getPixelRatio())) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    root.updateMatrixWorld(true);
    const P = curP();
    dots.forEach(d => { d.position.copy(d.userData.b.getWorldPosition(v)); d.material = d.userData.b === cur ? mOn : P[d.userData.b.name] ? mEd : mOff; });
    r.render(sc, cam);
    raf = requestAnimationFrame(loop);
  };
  loop();

  function close() {
    cancelAnimationFrame(raf);
    removeEventListener('keydown', key);
    tc.detach(); tc.dispose(); orb.dispose();
    root.traverse(n => { if (n.geometry) n.geometry.dispose(); });
    gm.dispose(); r.dispose();
    ov.remove();
    onDone();
  }
  return true;
}

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
