// Editor de pose para personajes importados con esqueleto.
// Guarda en el personaje (o.bp) un giro extra por articulación, que se suma
// a la animación que esté usando; o.pt fija el momento de la animación en reposo.
import { THREE } from './lib/three.js';

const POSES = [['stand', 'De pie'], ['sit', 'Sentado'], ['phone', 'Al teléfono'], ['walk', 'Andando'], ['run', 'Corriendo']];
const r4 = v => Math.round(v * 1e4) / 1e4;

export function openPose(o, { build, onDone, pushU }) {
  const root = build(o);
  if (!root) return false;
  pushU();
  if (o.bp) o.bp = { ...o.bp }; // copia propia: los duplicados no comparten retoques
  const before = JSON.stringify({ bp: o.bp, pt: o.pt, pose: o.pose });
  const hist = [];

  // ---- Ventana ----
  const ov = document.createElement('div');
  ov.id = 'poseEd';
  ov.innerHTML = `<div class="pe-view"><canvas></canvas><div class="pe-hud">Haz clic en un punto naranja para elegir una articulación · arrastra los aros para girarla · arrastra el fondo para rodear al personaje · rueda: zoom</div></div>
  <aside class="pe-side"><h3>🦴 Editor de pose</h3><p class="hint">${esc(o.n || 'Personaje')}</p>
  <label>Pose de partida<select id="peBase">${POSES.map(p => `<option value="${p[0]}">${p[1]}</option>`).join('')}</select></label>
  <label>Momento de la animación <span id="peTT"></span><input type="range" id="peT" min="0" max="1000" value="0"></label>
  <label class="pe-chk"><input type="checkbox" id="peFix"> Quieto en este momento (si no, se mueve)</label>
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

  const label = n => n.replace(/^mixamorig:?/i, '').replace(/[_:]/g, ' ');
  const list = () => {
    const q = $('#peQ').value.trim().toLowerCase();
    $('#peList').innerHTML = bones.map((b, i) => (!q || b.name.toLowerCase().includes(q))
      ? `<button data-b="${i}" class="${b === cur ? 'on' : ''}">${o.bp && o.bp[b.name] ? '● ' : ''}${esc(label(b.name) || 'hueso ' + i)}</button>` : '').join('');
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
    root.userData.setS({ k: o.pose || 'stand', t });
    $('#peTT').textContent = d ? t.toFixed(2).replace('.', ',') + ' s' : '(sin animación)';
    $('#peT').disabled = !d;
    $('#peT').value = d ? Math.round(t / d * 1000) : 0;
  };
  $('#peBase').value = o.pose || 'stand';
  $('#peFix').checked = o.pt != null;
  apply();
  list();

  const snap = () => { hist.push(JSON.stringify(o.bp || {})); if (hist.length > 80) hist.shift(); };
  const setOff = b => {
    const base = root.userData.baseQ.get(b);
    if (!base) return;
    const off = base.clone().invert().multiply(b.quaternion);
    o.bp = o.bp || {};
    if (Math.abs(off.w) > .99999) delete o.bp[b.name];
    else o.bp[b.name] = off.toArray().map(r4);
    if (!Object.keys(o.bp).length) delete o.bp;
  };
  tc.addEventListener('dragging-changed', e => { orb.enabled = !e.value; if (e.value) snap(); else list(); });
  tc.addEventListener('objectChange', () => { if (cur) setOff(cur); });

  // Clic en un punto naranja
  const rc = new THREE.Raycaster(), down = {};
  cv.addEventListener('pointerdown', e => { down.x = e.clientX; down.y = e.clientY; });
  cv.addEventListener('pointerup', e => {
    if (tc.dragging || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) return;
    const rect = cv.getBoundingClientRect();
    rc.setFromCamera(new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), cam);
    const h = rc.intersectObjects(dots, false)[0];
    if (h) pick(h.object.userData.b);
    else if (!tc.axis) pick(null);
  });

  ov.addEventListener('input', e => {
    const id = e.target.id;
    if (id === 'peQ') return list();
    if (id === 'peT') { const c = clip(); o.pt = c ? r4(e.target.value / 1000 * c.duration) : 0; $('#peFix').checked = true; apply(); }
    if (id === 'peFix') { if (e.target.checked) o.pt = o.pt || 0; else delete o.pt; apply(); }
    if (id === 'peBase') { o.pose = e.target.value; apply(); }
  });
  ov.addEventListener('click', e => {
    const b = e.target.closest('[data-b]');
    if (b) return pick(bones[+b.dataset.b]);
    const id = e.target.id;
    if (id === 'peR1' && cur && o.bp && o.bp[cur.name]) { snap(); delete o.bp[cur.name]; if (!Object.keys(o.bp).length) delete o.bp; apply(); list(); }
    if (id === 'peRA' && o.bp) { snap(); delete o.bp; apply(); list(); }
    if (id === 'peUndo' && hist.length) { const p = JSON.parse(hist.pop()); if (Object.keys(p).length) o.bp = p; else delete o.bp; apply(); list(); }
    if (id === 'peNo') { const b0 = JSON.parse(before); ['bp', 'pt', 'pose'].forEach(k => { if (b0[k] === undefined) delete o[k]; else o[k] = b0[k]; }); close(); }
    if (id === 'peOk') close();
  });
  const key = e => { if (e.key === 'Escape') close(); };
  addEventListener('keydown', key);

  // Bucle de dibujo
  const v = new THREE.Vector3();
  let raf = 0;
  const loop = () => {
    const w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * r.getPixelRatio()) || cv.height !== Math.round(h * r.getPixelRatio())) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    root.updateMatrixWorld(true);
    dots.forEach(d => { d.position.copy(d.userData.b.getWorldPosition(v)); d.material = d.userData.b === cur ? mOn : o.bp && o.bp[d.userData.b.name] ? mEd : mOff; });
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
