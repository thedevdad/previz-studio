// Convierte modelos FBX, OBJ, DAE, 3DS, STL y USDZ a .glb al importarlos,
// para guardarlos y usarlos igual que los modelos glTF.
// Los lectores se cargan solo cuando hacen falta.
import * as THREE from 'three';

export const OTHER = /\.(fbx|obj|dae|3ds|stl|usdz)$/i;

const rel = f => (f.webkitRelativePath || f.name).replace(/\\/g, '/').toLowerCase();
const base = u => decodeURIComponent(u.split(/[?#]/)[0]).replace(/\\/g, '/').split('/').pop().toLowerCase();

// Busca los archivos que pide el modelo (texturas, .mtl) entre los elegidos
function fileMap(files, main) {
  const urls = new Map(), miss = new Set(), made = [];
  const dir = rel(main).split('/').slice(0, -1).join('/');
  const find = u => {
    const p = decodeURIComponent(u).replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase(), b = p.split('/').pop();
    return files.find(f => dir && rel(f) === dir + '/' + p) || files.find(f => rel(f).endsWith('/' + p) || rel(f) === p) || files.find(f => f.name.toLowerCase() === b);
  };
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(u => {
    if (/^(blob|data):/.test(u)) return u;
    if (urls.has(u)) return urls.get(u);
    const f = find(u);
    if (!f) { miss.add(base(u)); return 'data:,'; }
    const b = URL.createObjectURL(f); made.push(b); urls.set(u, b); return b;
  });
  let busy = false, done = () => {};
  manager.onStart = () => { busy = true; };
  manager.onLoad = () => { busy = false; done(); };
  manager.onError = u => { const b = base(u); if (b && b !== 'data:,') miss.add(b); };
  const settle = () => new Promise(res => {
    if (!busy) return res();
    const t = setTimeout(res, 20000);
    done = () => { clearTimeout(t); res(); };
  });
  return { manager, find, miss, settle, free: () => made.forEach(u => URL.revokeObjectURL(u)) };
}

const MAPS = ['map', 'normalMap', 'emissiveMap', 'alphaMap', 'aoMap', 'roughnessMap', 'metalnessMap'];
// Una textura cuya imagen no se pudo cargar no se puede guardar
const okTex = t => { const i = t && t.image; return !!i && ((i.naturalWidth || i.width || 0) > 0 || !!i.data); };

// Materiales de cualquier formato → materiales estándar que el .glb guarda bien
function toStandard(m) {
  if (!m) return m;
  if (m.isMeshStandardMaterial) { MAPS.forEach(k => { if (m[k] && !okTex(m[k])) m[k] = null; }); return m; }
  const s = new THREE.MeshStandardMaterial({ name: m.name, side: m.side, transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest, vertexColors: m.vertexColors, flatShading: m.flatShading });
  if (m.color) s.color.copy(m.color).convertSRGBToLinear();
  if (m.emissive) s.emissive.copy(m.emissive).convertSRGBToLinear();
  MAPS.forEach(k => { if (okTex(m[k])) s[k] = m[k]; });
  if (m.normalScale) s.normalScale.copy(m.normalScale);
  s.roughness = m.shininess != null ? Math.max(.15, 1 - Math.sqrt(m.shininess / 100)) : .7;
  s.metalness = 0;
  return s;
}

function tidy(root) {
  root.traverse(n => {
    if (!n.isMesh) return;
    n.material = Array.isArray(n.material) ? n.material.map(toStandard) : toStandard(n.material);
  });
}

async function parse(f, files, fm) {
  const ext = f.name.split('.').pop().toLowerCase(), m = fm.manager;
  if (ext === 'fbx') {
    const [{ FBXLoader }, { TGALoader }] = await Promise.all([import('three/addons/loaders/FBXLoader.js'), import('three/addons/loaders/TGALoader.js')]);
    m.addHandler(/\.tga$/i, new TGALoader(m));
    const g = new FBXLoader(m).parse(await f.arrayBuffer(), '');
    // Las medidas del FBX van en centímetros × UnitScaleFactor: se pasan a metros
    g.scale.multiplyScalar((g.userData.unitScaleFactor || 1) / 100);
    return { root: g, clips: g.animations || [] };
  }
  if (ext === 'obj') {
    const [{ OBJLoader }, { MTLLoader }] = await Promise.all([import('three/addons/loaders/OBJLoader.js'), import('three/addons/loaders/MTLLoader.js')]);
    const text = await f.text(), lib = (text.match(/^\s*mtllib\s+(.+?)\s*$/m) || [])[1];
    const mtlF = (lib && fm.find(lib)) || files.find(x => x.name.toLowerCase() === f.name.toLowerCase().replace(/\.obj$/, '.mtl'));
    const ol = new OBJLoader(m);
    if (mtlF) { const mats = new MTLLoader(m).parse(await mtlF.text(), ''); mats.preload(); ol.setMaterials(mats); }
    else if (lib) fm.miss.add(base(lib));
    return { root: ol.parse(text), clips: [] };
  }
  if (ext === 'dae') {
    const { ColladaLoader } = await import('three/addons/loaders/ColladaLoader.js');
    const c = new ColladaLoader(m).parse(await f.text(), '');
    return { root: c.scene, clips: c.scene.animations || [] };
  }
  if (ext === '3ds') {
    const { TDSLoader } = await import('three/addons/loaders/TDSLoader.js');
    const g = new TDSLoader(m).parse(await f.arrayBuffer(), '');
    g.rotation.x = -Math.PI / 2; // 3ds Max trabaja con Z hacia arriba
    return { root: g, clips: [] };
  }
  if (ext === 'stl') {
    const { STLLoader } = await import('three/addons/loaders/STLLoader.js');
    const geo = new STLLoader(m).parse(await f.arrayBuffer());
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: geo.hasColors ? 0xffffff : 0xb8b4ac, vertexColors: !!geo.hasColors, roughness: .6 }));
    mesh.rotation.x = -Math.PI / 2; // los STL suelen venir con Z hacia arriba
    return { root: new THREE.Group().add(mesh), clips: [] };
  }
  if (ext === 'usdz') {
    const { USDZLoader } = await import('three/addons/loaders/USDZLoader.js');
    return { root: new USDZLoader(m).parse(await f.arrayBuffer()), clips: [] };
  }
  throw new Error('formato no compatible');
}

// Devuelve { buf: ArrayBuffer .glb, miss: [archivos que no se encontraron] }
export async function toGlb(f, files) {
  const fm = fileMap(files, f);
  try {
    const { root, clips } = await parse(f, files, fm);
    await fm.settle();
    tidy(root);
    const wrap = new THREE.Group();
    wrap.add(root);
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const buf = await new GLTFExporter().parseAsync(wrap, { binary: true, animations: clips, onlyVisible: true });
    return { buf, miss: [...fm.miss] };
  } finally {
    fm.free();
  }
}
