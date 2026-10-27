const THREE = window.THREE;

/* ================= 3D 顕微鏡 ================= */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 2, 0.1, 100);
camera.position.set(4.4, 3.1, 5.6);
camera.lookAt(0, 1.55, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8fa3b8, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(4, 7, 3);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xdceffb, 0.5);
fill.position.set(-5, 3, -2);
scene.add(fill);

const scope = new THREE.Group();
scene.add(scope);

const MAT = {
  body: new THREE.MeshStandardMaterial({ color: 0xe9e2cf, roughness: 0.55, metalness: 0.08 }),
  navy: new THREE.MeshStandardMaterial({ color: 0x2e4a5e, roughness: 0.45, metalness: 0.25 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xb9c0c7, roughness: 0.3, metalness: 0.8 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x3c3a36, roughness: 0.6, metalness: 0.2 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xe8862e, roughness: 0.5, metalness: 0.1 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xbfd9ea, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.55 }),
  mirror: new THREE.MeshStandardMaterial({ color: 0xeef4f8, roughness: 0.05, metalness: 0.95 }),
  slide: new THREE.MeshStandardMaterial({ color: 0xcfe6f5, roughness: 0.1, metalness: 0.05, transparent: true, opacity: 0.75 })
};

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}
function cyl(rt, rb, h, mat, x, y, z, seg = 28) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  return m;
}

const partMeshes = {};
function reg(part, mesh) {
  (partMeshes[part] = partMeshes[part] || []).push(mesh);
  scope.add(mesh);
  return mesh;
}

/* 土台とアーム */
reg('base', box(2.5, 0.26, 1.6, MAT.navy, 0, 0.13, 0));
reg('base', box(2.2, 0.1, 1.3, MAT.body, 0, 0.31, 0));
const arm = reg('arm', box(0.4, 2.3, 0.55, MAT.body, 0, 1.35, -0.62));
arm.rotation.x = 0.1;
reg('arm', cyl(0.13, 0.13, 0.5, MAT.dark, 0, 0.62, -0.5)).rotation.z = Math.PI / 2;

/* ステージまわり */
reg('stage', box(2.1, 0.1, 1.5, MAT.dark, 0, 1.02, 0.12));
const hole = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), new THREE.MeshBasicMaterial({ color: 0x22201c }));
hole.rotation.x = -Math.PI / 2;
hole.position.set(0, 1.076, 0.12);
scope.add(hole);
reg('clip', box(0.5, 0.04, 0.12, MAT.metal, -0.45, 1.1, 0.12));
reg('clip', box(0.5, 0.04, 0.12, MAT.metal, 0.45, 1.1, 0.12));
reg('diaphragm', cyl(0.3, 0.3, 0.07, MAT.navy, 0, 0.93, 0.12));

/* プレパラート（チャレンジで登場） */
const slideGroup = new THREE.Group();
const slideMesh = box(1.0, 0.03, 0.55, MAT.slide, 0, 1.09, 0.12);
const dropMesh = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), new THREE.MeshStandardMaterial({ color: 0x7fb069, roughness: 0.4 }));
dropMesh.rotation.x = -Math.PI / 2;
dropMesh.position.set(0.18, 1.107, 0.12);
slideGroup.add(slideMesh, dropMesh);
slideGroup.visible = false;
scope.add(slideGroup);

/* 反射鏡 */
const mirrorPivot = new THREE.Group();
mirrorPivot.position.set(0, 0.52, 0.12);
const mirrorMesh = cyl(0.27, 0.27, 0.045, MAT.mirror, 0, 0, 0);
mirrorPivot.add(mirrorMesh);
reg('mirror', cyl(0.05, 0.07, 0.3, MAT.dark, 0, 0.32, 0.12));
scope.add(mirrorPivot);
partMeshes.mirror.push(mirrorMesh);

/* 鏡筒グループ（上下に動く） */
const tubeGroup = new THREE.Group();
scope.add(tubeGroup);
function regT(part, mesh) {
  (partMeshes[part] = partMeshes[part] || []).push(mesh);
  tubeGroup.add(mesh);
  return mesh;
}
regT('tube', cyl(0.17, 0.17, 1.35, MAT.body, 0, 2.55, -0.18));
regT('eyepiece', cyl(0.21, 0.19, 0.3, MAT.dark, 0, 3.32, -0.18));
regT('eyepiece', cyl(0.13, 0.13, 0.1, MAT.glass, 0, 3.5, -0.18));
const headBlock = box(0.5, 0.42, 0.6, MAT.body, 0, 2.05, -0.42);
tubeGroup.add(headBlock);

/* レボルバーと対物レンズ */
const revolver = new THREE.Group();
revolver.position.set(0, 1.86, -0.18);
tubeGroup.add(revolver);
const revDisc = cyl(0.36, 0.36, 0.13, MAT.navy, 0, 0, 0);
revolver.add(revDisc);
(partMeshes.revolver = partMeshes.revolver || []).push(revDisc);
const objectiveData = [
  { len: 0.34, color: 0xd9534f },
  { len: 0.46, color: 0xf2c230 },
  { len: 0.58, color: 0x3d7bd9 }
];
objectiveData.forEach((o, i) => {
  const a = (i / 3) * Math.PI * 2;
  const g = new THREE.Group();
  g.position.set(Math.cos(a) * 0.19, -0.05, Math.sin(a) * 0.19);
  const body = cyl(0.075, 0.09, o.len, MAT.metal, 0, -o.len / 2, 0);
  const tip = cyl(0.05, 0.075, 0.08, new THREE.MeshStandardMaterial({ color: o.color, roughness: 0.4 }), 0, -o.len - 0.02, 0);
  g.add(body, tip);
  g.rotation.z = Math.cos(a) * 0.1;
  g.rotation.x = -Math.sin(a) * 0.1;
  revolver.add(g);
  (partMeshes.objective = partMeshes.objective || []).push(body, tip);
});

/* ハンドル類 */
reg('coarse', cyl(0.17, 0.17, 0.14, MAT.accent, 0.36, 1.78, -0.55)).rotation.z = Math.PI / 2;
reg('coarse', cyl(0.17, 0.17, 0.14, MAT.accent, -0.36, 1.78, -0.55)).rotation.z = Math.PI / 2;
reg('fine', cyl(0.11, 0.11, 0.12, MAT.navy, 0.38, 1.45, -0.55)).rotation.z = Math.PI / 2;
reg('fine', cyl(0.11, 0.11, 0.12, MAT.navy, -0.38, 1.45, -0.55)).rotation.z = Math.PI / 2;

scope.position.y = -0.55;

/* 回転ドラッグ */
let rotY = 0.55, rotX = 0.06, targetRotY = 0.55, targetRotX = 0.06;
let dragging = false, lastX = 0, lastY = 0, lastTouchAt = 0;
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  targetRotY += (e.clientX - lastX) * 0.012;
  targetRotX = THREE.MathUtils.clamp(targetRotX + (e.clientY - lastY) * 0.005, -0.12, 0.42);
  lastX = e.clientX; lastY = e.clientY; lastTouchAt = performance.now();
});
canvas.addEventListener('pointerup', () => { dragging = false; lastTouchAt = performance.now(); });
canvas.addEventListener('pointercancel', () => { dragging = false; lastTouchAt = performance.now(); });
document.getElementById('resetView').addEventListener('click', () => {
  targetRotY = 0.55;
  targetRotX = 0.06;
  lastTouchAt = performance.now();
});

function resize() {
  const w = canvas.clientWidth || canvas.parentElement.clientWidth;
  const h = canvas.clientHeight || 430;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

/* チャレンジ連動パラメータ */
const anim = { tubeDown: 0, tubeTarget: 0, revRot: 0, revTarget: 0, mirrorTilt: -0.95 };
function animate() {
  requestAnimationFrame(animate);
  if (!reduceMotion && !dragging && performance.now() - lastTouchAt > 3500) targetRotY += 0.0016;
  rotY += (targetRotY - rotY) * 0.08;
  rotX += (targetRotX - rotX) * 0.08;
  scope.rotation.y = rotY;
  scope.rotation.x = rotX * 0.4;
  anim.tubeDown += (anim.tubeTarget - anim.tubeDown) * 0.12;
  tubeGroup.position.y = -anim.tubeDown;
  anim.revRot += (anim.revTarget - anim.revRot) * 0.1;
  revolver.rotation.y = anim.revRot;
  mirrorPivot.rotation.x = anim.mirrorTilt;
  renderer.render(scene, camera);
}
animate();

/* ================= パーツを しろう ================= */
const PARTS = [
  { id: 'eyepiece', name: '接眼レンズ', kana: 'せつがんレンズ', desc: '目で のぞくところの レンズ。ふつう 10倍に 大きく 見える。両目ではなく、片目で のぞくよ。' },
  { id: 'tube', name: '鏡筒', kana: 'きょうとう', desc: 'レンズが 入っている 筒（つつ）。ピント調節ネジを 回すと 上下に 動く。学校に よっては、鏡筒ではなく ステージが 上下する タイプも あるよ。' },
  { id: 'revolver', name: 'レボルバー', desc: 'くるっと 回すと、対物レンズが カチッと 切りかわる。倍率を かえるときに 使う。' },
  { id: 'objective', name: '対物レンズ', kana: 'たいぶつレンズ', desc: '見たいものに いちばん 近い レンズ。4倍・10倍・40倍が あって、長いものほど 倍率が 高い。' },
  { id: 'stage', name: 'ステージ', desc: 'プレパラートを のせる 台。真ん中に 穴が あいて、下からの 光が 通る。' },
  { id: 'clip', name: 'クリップ', desc: 'プレパラートが ずれないように 止める 金具。' },
  { id: 'diaphragm', name: 'しぼり', desc: 'ステージの下に ある、光の 量を 調節する しくみ。明るすぎるときに 絞る。' },
  { id: 'mirror', name: '反射鏡', kana: 'はんしゃきょう', desc: '光を 反射させて、見たいものを 明るく 照らす 鏡。動かして、いちばん 明るくなる 向きを 探す。' },
  { id: 'coarse', name: 'ピント調節ネジ（大）', kana: 'ピントちょうせつネジ（だい）', desc: '大きい調節ネジ。鏡筒を 大きく 上下させて、ピントを だいたい 合わせるときに 使うよ。' },
  { id: 'fine', name: 'ピント調節ネジ（小）', kana: 'ピントちょうせつネジ（しょう）', desc: '小さい調節ネジ。鏡筒を 少しだけ 動かして、ピントを はっきり 合わせるよ。' },
  
  { id: 'arm', name: 'アーム', desc: '顕微鏡を 持つときに つかむところ。持つときは、もう片方の 手を 土台の下に そえる。' },
  { id: 'base', name: '土台', kana: 'どだい', desc: '顕微鏡を 支える 台。水平な 場所に 置いて 使う。' }
];
const partGrid = document.getElementById('partGrid');
const partInfo = document.getElementById('partInfo');
const partLabel = document.getElementById('partLabel');
const NAVI_WEB_BASE = 'https://tt-sensei.github.io/navi-character-/assets/web/characters';
const NAVI_IDS = ['riku', 'sora', 'kai', 'saku', 'tsuki', 'nami'];
const lastNaviId = { parts: null, challenge: null };

function setNaviGuide(area, pose, message) {
  const image = document.getElementById(area + 'NaviImage');
  const messageEl = document.getElementById(area + 'NaviMessage');
  if (!image || !messageEl) return;

  let choices = NAVI_IDS.filter(id => id !== lastNaviId[area]);
  if (!choices.length) choices = NAVI_IDS;
  const id = choices[Math.floor(Math.random() * choices.length)];
  lastNaviId[area] = id;

  const altByPose = {
    '03-thinking': '考えているナビキャラ',
    '06-troubled': '注意をうながすナビキャラ',
    '07-encouraging': 'はげますナビキャラ',
    '08-celebrating': '達成をよろこぶナビキャラ'
  };
  image.hidden = false;
  image.alt = altByPose[pose] || '学習を案内するナビキャラ';
  image.onerror = () => { image.hidden = true; };
  image.src = NAVI_WEB_BASE + '/' + id + '/expressions/' + pose + '.webp';
  messageEl.textContent = message;
}
setNaviGuide('parts', '03-thinking', '気になるパーツを押して、光る場所と名前を見くらべよう。');
setNaviGuide('challenge', '07-encouraging', '手順を一つずつ確かめよう。失敗しても何度でもやり直せるよ。');
let highlighted = [];
function clearHighlight() {
  highlighted.forEach(m => { if (m.material.emissive) { m.material = m.userData.origMat; } });
  highlighted = [];
}
PARTS.forEach(part => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = part.name;
  b.addEventListener('click', () => {
    partGrid.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    clearHighlight();
    (partMeshes[part.id] || []).forEach(m => {
      if (!m.userData.origMat) m.userData.origMat = m.material;
      const c = m.material.clone();
      if (c.emissive) { c.emissive = new THREE.Color(0xff8c1a); c.emissiveIntensity = 0.55; }
      m.material = c;
      highlighted.push(m);
    });
    partLabel.textContent = part.name;
    partLabel.style.display = 'block';
    partInfo.innerHTML = '<strong>' + part.name + (part.kana ? '（' + part.kana + '）' : '') + '</strong><br>' + part.desc;
    setNaviGuide('parts', '03-thinking', part.name + 'を見つけたね。はたらきも読んで、本物の顕微鏡と見くらべてみよう。');
  });
  partGrid.appendChild(b);
});

/* ================= てじゅんチャレンジ ================= */
const eye = document.getElementById('eyeCanvas');
const ectx = eye.getContext('2d');
const view = { brightness: 0.12, diaph: 1, offsetX: 0, blur: 16, mag: 1, hasSlide: false };
const microbes = [
  { x: -30, y: -18, r: 34, kind: 'paramecium' },
  { x: 58, y: 30, r: 22, kind: 'amoeba' },
  { x: -72, y: 52, r: 15, kind: 'volvox' },
  { x: 40, y: -64, r: 11, kind: 'volvox' },
  { x: 96, y: -30, r: 8, kind: 'dot' },
  { x: -110, y: -40, r: 7, kind: 'dot' }
];
function drawView() {
  const W = 460, C = W / 2;
  ectx.clearRect(0, 0, W, W);
  const b = Math.min(1, view.brightness * view.diaph);
  const g = ectx.createRadialGradient(C, C, 30, C, C, C);
  g.addColorStop(0, 'rgb(' + Math.round(190 * b + 20) + ',' + Math.round(215 * b + 22) + ',' + Math.round(195 * b + 20) + ')');
  g.addColorStop(1, 'rgb(' + Math.round(90 * b + 8) + ',' + Math.round(120 * b + 10) + ',' + Math.round(105 * b + 8) + ')');
  ectx.fillStyle = g;
  ectx.fillRect(0, 0, W, W);
  if (view.hasSlide) {
    ectx.save();
    ectx.filter = 'blur(' + view.blur.toFixed(1) + 'px)';
    ectx.translate(C + view.offsetX, C);
    ectx.scale(view.mag, view.mag);
    microbes.forEach(mb => {
      ectx.save();
      ectx.translate(mb.x, mb.y);
      if (mb.kind === 'paramecium') {
        ectx.fillStyle = 'rgba(240,225,170,0.85)';
        ectx.beginPath(); ectx.ellipse(0, 0, mb.r, mb.r * 0.55, 0.5, 0, Math.PI * 2); ectx.fill();
        ectx.fillStyle = 'rgba(160,120,60,0.7)';
        ectx.beginPath(); ectx.ellipse(-6, 0, 8, 4.5, 0.4, 0, Math.PI * 2); ectx.fill();
        ectx.beginPath(); ectx.ellipse(12, 5, 4.5, 3, 0.2, 0, Math.PI * 2); ectx.fill();
      } else if (mb.kind === 'amoeba') {
        ectx.fillStyle = 'rgba(200,225,240,0.8)';
        ectx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.5) {
          const rr = mb.r * (0.78 + 0.25 * Math.sin(a * 3 + 1));
          const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
          if (a === 0) ectx.moveTo(px, py); else ectx.lineTo(px, py);
        }
        ectx.fill();
        ectx.fillStyle = 'rgba(90,130,160,0.75)';
        ectx.beginPath(); ectx.arc(2, -2, 5, 0, Math.PI * 2); ectx.fill();
      } else if (mb.kind === 'volvox') {
        ectx.fillStyle = 'rgba(140,205,140,0.55)';
        ectx.beginPath(); ectx.arc(0, 0, mb.r, 0, Math.PI * 2); ectx.fill();
        ectx.fillStyle = 'rgba(60,150,70,0.9)';
        for (let i = 0; i < 9; i++) {
          const a = i * 2.4, rr = mb.r * 0.62;
          ectx.beginPath(); ectx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 2.4, 0, Math.PI * 2); ectx.fill();
        }
      } else {
        ectx.fillStyle = 'rgba(120,110,80,0.8)';
        ectx.beginPath(); ectx.arc(0, 0, mb.r * 0.4, 0, Math.PI * 2); ectx.fill();
      }
      ectx.restore();
    });
    ectx.restore();
    ectx.filter = 'none';
  }
  const v = ectx.createRadialGradient(C, C, C * 0.55, C, C, C);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.4)');
  ectx.fillStyle = v;
  ectx.fillRect(0, 0, W, W);

  // ピントが合っていないときは、白いベールを重ねてぼけを見分けやすくする。
  if (view.hasSlide) {
    const haze = Math.min(0.62, Math.max(0, view.blur) * 0.038);
    if (haze > 0.01) {
      ectx.fillStyle = 'rgba(255,255,255,' + haze.toFixed(3) + ')';
      ectx.fillRect(0, 0, W, W);
    }
  }
}

const steps = [
  { title: '反射鏡で 明るくしよう', text: '顕微鏡は、直射日光の 当たらない、明るく 水平な 場所に 置くよ。反射鏡の 角度を 動かして、のぞいた景色が いちばん 明るくなる ところを 探そう。', control: 'mirror' },
  { title: 'プレパラートを のせよう', text: 'プレパラートは、スライドガラスに 見たいものと 水を のせ、カバーガラスを かけたもの。ステージに 置いて クリップで 止めるよ。見たいものが、穴の 真ん中に 来るように 置くのが コツ。', control: 'place' },
  { title: '見たいものを 真ん中へ', text: 'のぞいた景色では、見たいものが 右に ずれているよ。顕微鏡の 景色は 上下・左右が 逆に 見える。だから、見たいものが 右に 見えたら、プレパラートは 右へ 動かすと、景色の中では 左へ 動いて 真ん中に 来るよ。', control: 'center' },
  { title: '横から 見ながら 近づけよう', text: 'いちばん 大事な ところ！横から 見ながら、対物レンズを プレパラートに 近づける。のぞきながら 下げると、ぶつけて レンズを 傷つけてしまうよ。ボタンを おしている間だけ 下がる。緑の ゾーンで 止めよう。', control: 'lower' },
  { title: 'のぞいて ピント（大きい調節ネジ）', text: '接眼レンズを のぞきながら、大きい調節ネジで 鏡筒を ゆっくり 上げていく。景色が はっきり 見えてきたら 成功。下げながら 合わせないのが ルールだよ。', control: 'coarse' },
  { title: '小さい調節ネジで 仕上げ', text: 'あと少し。小さい調節ネジで ほんの少しずつ 動かして、ぴったりの ピントに しよう。', control: 'fine1' },
  { title: 'レボルバーを 回して 100倍', text: 'もっと 大きく 見たいときは、レボルバーを カチッと 回して 対物レンズを 10倍に かえるよ（全部で100倍）。倍率が 上がると ピントが ずれるので、小さい調節ネジで 合わせ直そう。', control: 'rev100' },
  { title: '400倍に チャレンジ', text: '対物レンズ 40倍で、全部で 400倍。もっと 細かいところを 観察できるよ。小さい調節ネジで ピントを 仕上げよう。', control: 'rev400' },
  { title: 'しぼりで 明るさを 調節', text: '倍率を 上げると、見える 範囲は 狭く、景色は 暗くなる。ステージの下の しぼりを 回して、光の 量を 調節しよう。', control: 'diaphragm' },
  { title: 'かたづけよう', text: '終わったら、レボルバーを いちばん 低い倍率に 戻してから、プレパラートを 外す。これが 正しい かたづけの 順番だよ。', control: 'cleanup' }
];
let stepIdx = 0;
const done = new Set();
const stepBadge = document.getElementById('stepBadge');
const stepTitle = document.getElementById('stepTitle');
const stepText = document.getElementById('stepText');
const controlsEl = document.getElementById('controls');
const feedbackEl = document.getElementById('feedback');
const starsEl = document.getElementById('stars');

function setFeedback(msg, kind) {
  feedbackEl.textContent = msg;
  feedbackEl.className = 'feedback' + (kind ? ' ' + kind : '');
}
function renderStars() {
  starsEl.textContent = steps.map((_, i) => done.has(i) ? '★' : '☆').join('');
}
function completeStep() {
  done.add(stepIdx);
  renderStars();
  setFeedback('できた！ 次へ 進もう。', 'good');
  setNaviGuide('challenge', '08-celebrating', 'できたね！この調子で、次の手順も確かめよう。');
  setTimeout(() => { if (stepIdx < steps.length - 1) { stepIdx++; showStep(); } else { showClear(); } }, 1000);
}
let sliderCount = 0;
function sliderRow(label, min, max, val) {
  const wrap = document.createElement('div');
  const lab = document.createElement('label');
  lab.textContent = label;
  const input = document.createElement('input');
  input.id = 'control-range-' + (++sliderCount);
  lab.htmlFor = input.id;
  input.type = 'range'; input.min = min; input.max = max; input.value = val;
  wrap.append(lab, input);
  return { wrap, input };
}
function bigButton(text, cls) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'big-button' + (cls ? ' ' + cls : '');
  b.textContent = text;
  return b;
}

function showStep() {
  const step = steps[stepIdx];
  stepBadge.textContent = 'STEP ' + (stepIdx + 1) + ' / ' + steps.length;
  stepTitle.textContent = step.title;
  stepText.textContent = step.text;
  controlsEl.innerHTML = '';
  setFeedback('', '');
  renderStars();
  const kind = step.control;
  const naviTips = {
    mirror: { pose: '07-encouraging', message: 'まずは明るさを整えよう。ちょうどよい角度を探してね。' },
    place: { pose: '03-thinking', message: '見たいものをステージの穴の上に置き、ずれないように止めよう。' },
    center: { pose: '03-thinking', message: '視野の中の見え方と、プレパラートを動かす向きに注目！' },
    lower: { pose: '07-encouraging', message: 'ここは大切。横から見て、ゆっくり近づけよう。' },
    coarse: { pose: '03-thinking', message: 'のぞきながら鏡筒を上げて、ピントが合うところを探そう。' },
    fine1: { pose: '07-encouraging', message: '最後は少しずつ。小さい調節ネジでくっきりさせよう。' },
    rev100: { pose: '03-thinking', message: '倍率を上げたら、ピントも合わせ直すよ。' },
    rev400: { pose: '03-thinking', message: '高倍率では見える範囲が狭くなるよ。ゆっくり調整しよう。' },
    diaphragm: { pose: '03-thinking', message: '倍率を上げると暗くなることがあるね。光の量を調節しよう。' },
    cleanup: { pose: '07-encouraging', message: '片づけも大切な手順。低い倍率に戻してから外そう。' }
  };
  const naviTip = naviTips[kind] || { pose: '07-encouraging', message: 'あせらず、一つずつ確かめよう。' };
  setNaviGuide('challenge', naviTip.pose, naviTip.message);

  if (kind === 'mirror') {
    const { wrap, input } = sliderRow('反射鏡の 角度', 0, 100, 8);
    controlsEl.appendChild(wrap);
    setFeedback('今は 暗いね。スライダーを 動かしてみよう。', '');
    input.addEventListener('input', () => {
      const v = Number(input.value);
      anim.mirrorTilt = -1.25 + (v / 100) * 0.95;
      view.brightness = Math.max(0.08, 1 - Math.abs(v - 62) / 42);
      drawView();
      if (v >= 50 && v <= 74) { input.disabled = true; completeStep(); }
    });
  }
  if (kind === 'place') {
    const b = bigButton('プレパラートを ステージに のせる');
    controlsEl.appendChild(b);
    b.addEventListener('click', () => {
      slideGroup.visible = true;
      view.hasSlide = true;
      view.offsetX = 120;
      view.blur = 16;
      drawView();
      b.disabled = true;
      completeStep();
    });
  }
  if (kind === 'center') {
    const row = document.createElement('div');
    row.className = 'row-buttons';
    const left = bigButton('◀ プレパラートを 左へ');
    const right = bigButton('プレパラートを 右へ ▶');
    row.append(left, right);
    controlsEl.appendChild(row);
    const move = d => {
      view.offsetX += d;
      drawView();
      if (Math.abs(view.offsetX) <= 18) { left.disabled = right.disabled = true; completeStep(); }
    };
    left.addEventListener('click', () => move(18));
    right.addEventListener('click', () => move(-18));
  }
  if (kind === 'lower') {
    const meter = document.createElement('div');
    meter.className = 'meter';
    meter.innerHTML = '<div class="zone" style="left:78%;width:14%"></div><div class="fill"></div>';
    const fillEl = meter.querySelector('.fill');
    const b = bigButton('おしている間、レンズが 下がるよ', 'warn');
    controlsEl.append(meter, b);
    let gap = 100, timer = null, finished = false;
    const setGap = () => {
      fillEl.style.width = (100 - gap) + '%';
      anim.tubeTarget = (100 - gap) / 100 * 0.34;
    };
    const start = e => {
      if (e.cancelable) e.preventDefault();
      if (finished || timer) return;
      if (e.pointerId !== undefined && b.setPointerCapture) {
        try { b.setPointerCapture(e.pointerId); } catch (_) {}
      }
      timer = setInterval(() => {
        gap = Math.max(0, gap - 1.6);
        setGap();
        if (gap <= 4) {
          clearInterval(timer);
          timer = null;
          gap = 100;
          setGap();
          setFeedback('あぶない！レンズが プレパラートに ぶつかるところだった。横から 見ながら、ゆっくり 近づけよう。もう一度。', 'bad');
          setNaviGuide('challenge', '06-troubled', 'だいじょうぶ。もう一度できるよ。横から見て、ゆっくり近づけよう。');
        }
      }, 30);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer); timer = null;
      if (finished) return;
      if (gap >= 8 && gap <= 22) { finished = true; completeStep(); }
      else if (gap > 22) setFeedback('まだ 遠いよ。もう少し 近づけよう（下がりすぎに 注意）。', '');
    };
    b.addEventListener('pointerdown', start);
    b.addEventListener('pointerup', stop);
    b.addEventListener('pointercancel', stop);
    b.addEventListener('pointerleave', stop);
    b.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') start(e);
    });
    b.addEventListener('keyup', e => {
      if (e.key === 'Enter' || e.key === ' ') stop();
    });
  }
  if (kind === 'coarse') {
    const hint = document.createElement('div'); hint.className = 'mag-box'; hint.textContent = '3Dの顕微鏡にある「ピント調節ネジ（大）」をドラッグして、ピントを合わせよう。'; controlsEl.appendChild(hint);
    controlsEl.appendChild(wrap);
    setFeedback('ぼやけて 見えるね。ゆっくり 上げていこう。', '');
    input.addEventListener('input', () => {
      const v = Number(input.value);
      anim.tubeTarget = 0.34 - (v / 100) * 0.1;
      view.blur = Math.abs(v - 58) / 58 * 15 + 0.4;
      drawView();
      if (Math.abs(v - 58) <= 5) { input.disabled = true; completeStep(); }
    });
  }
  if (kind === 'fine1') {
    const { wrap, input } = sliderRow('小さい調節ネジ', -50, 50, 28);
    controlsEl.appendChild(wrap);
    input.addEventListener('input', () => {
      const v = Number(input.value);
      view.blur = Math.abs(v - 8) / 50 * 5 + 0.2;
      drawView();
      if (Math.abs(v - 8) <= 4) { input.disabled = true; completeStep(); }
    });
  }
  if (kind === 'rev100' || kind === 'rev400') {
    const target = kind === 'rev100' ? -6 : 14;
    const startVal = kind === 'rev100' ? -22 : 30;
    const b = bigButton('レボルバーを 回す（カチッ）');
    controlsEl.appendChild(b);
    b.addEventListener('click', () => {
      b.disabled = true;
      anim.revTarget -= (Math.PI * 2) / 3;
      view.mag = kind === 'rev100' ? 2.1 : 3.8;
      view.blur = 7;
      drawView();
      setFeedback('倍率が 上がった！小さい調節ネジで ピントを 合わせ直そう。', '');
      const { wrap, input } = sliderRow('小さい調節ネジ', -50, 50, startVal);
      controlsEl.appendChild(wrap);
      input.addEventListener('input', () => {
        const v = Number(input.value);
        view.blur = Math.abs(v - target) / 50 * 6 + 0.2;
        drawView();
        if (Math.abs(v - target) <= 5) { input.disabled = true; completeStep(); }
      });
    });
  }
  if (kind === 'diaphragm') {
    view.diaph = 0.55;
    drawView();
    setFeedback('400倍だと 暗いね。しぼりを 動かして 明るくしよう。', '');
    const { wrap, input } = sliderRow('しぼり', 0, 100, 8);
    controlsEl.appendChild(wrap);
    input.addEventListener('input', () => {
      const v = Number(input.value);
      view.diaph = 0.55 + (v / 100) * 0.6;
      const disc = (partMeshes.diaphragm || [])[0];
      if (disc) disc.rotation.y = v * 0.05;
      drawView();
      if (v >= 58 && v <= 85) { input.disabled = true; completeStep(); }
    });
  }
  if (kind === 'cleanup') {
    const b1 = bigButton('① レボルバーを 低い倍率に 戻す');
    const b2 = bigButton('② プレパラートを 外す');
    b2.disabled = true;
    controlsEl.append(b1, b2);
    b1.addEventListener('click', () => {
      b1.disabled = true;
      anim.revTarget += (Math.PI * 2) / 3 * 2;
      view.mag = 1;
      view.blur = 2;
      drawView();
      b2.disabled = false;
      setFeedback('いいよ。次は プレパラートを 外そう。', 'good');
    });
    b2.addEventListener('click', () => {
      b2.disabled = true;
      slideGroup.visible = false;
      view.hasSlide = false;
      drawView();
      completeStep();
    });
  }
  drawView();
}

function showClear() {
  setNaviGuide('challenge', '08-celebrating', '顕微鏡の使い方を最後まで確認できたね！本物でも安全に使おう。');
  stepBadge.textContent = 'クリア！';
  stepTitle.textContent = '顕微鏡マスター 認定！';
  stepText.textContent = '明るさの 調節から、横から見て 近づける、のぞきながら ピントを 合わせる、倍率の 上げ方、かたづけまで、全部の 手順が できたね。本物の 顕微鏡でも、この 順番で やってみよう。';
  controlsEl.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'clear-box';
  box.innerHTML = '<div class="big">🏆</div>';
  const b = bigButton('もう一度 チャレンジ');
  b.addEventListener('click', () => {
    done.clear();
    stepIdx = 0;
    view.brightness = 0.12; view.diaph = 1; view.offsetX = 0; view.blur = 16; view.mag = 1; view.hasSlide = false;
    slideGroup.visible = false;
    anim.tubeTarget = 0; anim.tubeDown = 0; anim.revTarget = 0; anim.revRot = 0; anim.mirrorTilt = -0.95;
    showStep();
  });
  box.appendChild(b);
  controlsEl.appendChild(box);
  renderStars();
  setFeedback('', '');
  drawView();
}

/* モード切り替え */
const tabParts = document.getElementById('tabParts');
const tabChallenge = document.getElementById('tabChallenge');
const partsPanel = document.getElementById('partsPanel');
const challengePanel = document.getElementById('challengePanel');
tabParts.addEventListener('click', () => {
  tabParts.classList.add('active'); tabChallenge.classList.remove('active');
  tabParts.setAttribute('aria-pressed', 'true');
  tabChallenge.setAttribute('aria-pressed', 'false');
  partsPanel.classList.remove('hidden'); challengePanel.classList.add('hidden');
});
tabChallenge.addEventListener('click', () => {
  tabChallenge.classList.add('active'); tabParts.classList.remove('active');
  tabChallenge.setAttribute('aria-pressed', 'true');
  tabParts.setAttribute('aria-pressed', 'false');
  challengePanel.classList.remove('hidden'); partsPanel.classList.add('hidden');
});

showStep();
drawView();
