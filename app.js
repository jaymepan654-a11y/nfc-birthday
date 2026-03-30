const CONFIG = {
  title: "生日快乐！",
  toName: "你",
  fromName: "一位很认真的人",
  wish: "愿你把每一天，都过成自己喜欢的小样子。",
  noteTitle: "给你的一封小纸条",
  noteBody:
    "今天你就是全宇宙最可爱的主角。\n\n愿你：\n- 眼里有光\n- 心里有糖\n- 生活有惊喜\n\n生日快乐呀！",
  cards: [
    "抽到这张卡：你今天会被很多很多好运追着跑。",
    "抽到这张卡：烦恼请排队，快乐要插队！",
    "抽到这张卡：你一笑，世界都变软软的。",
    "抽到这张卡：愿你永远有小朋友般的开心。",
    "抽到这张卡：今天的你，值得一万次偏爱。",
  ],
  bubbleHints: [
    "点按钮会有惊喜喔！",
    "你知道吗？你真的很可爱。",
    "今天允许你：任性、撒娇、收礼物。",
    "再点一下试试！",
    "愿你被温柔包围。",
  ],
};

const $ = (sel) => document.querySelector(sel);
const fx = $("#fx");
const ctx = fx.getContext("2d", { alpha: true });

const titleEl = $("#title");
const toLineEl = $("#toLine");
const wishTextEl = $("#wishText");
const sigEl = $("#sig");
const bubbleEl = $("#bubble");

const musicBtn = $("#musicBtn");
const musicLabel = $("#musicLabel");
const heartBtn = $("#heartBtn");
const confettiBtn = $("#confettiBtn");
const noteBtn = $("#noteBtn");
const cardBtn = $("#cardBtn");
const themeBtn = $("#themeBtn");

const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");
const modalOk = $("#modalOk");

const audioEl = $("#bgm");

function applyConfig() {
  titleEl.textContent = CONFIG.title;
  toLineEl.textContent = `To：${CONFIG.toName}`;
  wishTextEl.textContent = CONFIG.wish;
  sigEl.textContent = `From：${CONFIG.fromName}`;
  modalTitle.textContent = CONFIG.noteTitle;
  modalBody.textContent = CONFIG.noteBody;
}

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  fx.width = Math.floor(window.innerWidth * dpr);
  fx.height = Math.floor(window.innerHeight * dpr);
  fx.style.width = "100%";
  fx.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// --- 粒子系统（爱心 / 星星 / 彩纸） ---
const particles = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function addParticle(p) {
  particles.push(p);
}

function burstHearts(x, y, count = 18) {
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    addParticle({
      kind: "heart",
      x,
      y,
      vx: rand(-1.6, 1.6),
      vy: rand(-3.2, -1.2),
      g: 0.06,
      rot: rand(-0.2, 0.2),
      w: rand(10, 18),
      life: rand(900, 1350),
      born: performance.now(),
      color: t < 0.6 ? "#ff5a9e" : t < 0.85 ? "#7be3ff" : "#ffd86b",
      wobble: rand(0.6, 1.4),
    });
  }
}

function burstStars(x, y, count = 14) {
  for (let i = 0; i < count; i++) {
    addParticle({
      kind: "star",
      x,
      y,
      vx: rand(-1.4, 1.4),
      vy: rand(-2.6, -0.8),
      g: 0.05,
      r: rand(4, 7),
      life: rand(650, 950),
      born: performance.now(),
      color: Math.random() < 0.5 ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.75)",
    });
  }
}

function confettiBoom() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.32;
  const colors = ["#ff5a9e", "#7be3ff", "#ffd86b", "#b9ffcf", "#c7b6ff"];
  for (let i = 0; i < 90; i++) {
    addParticle({
      kind: "confetti",
      x: cx + rand(-40, 40),
      y: cy + rand(-20, 20),
      vx: rand(-3.2, 3.2),
      vy: rand(-4.6, -1.2),
      g: 0.09,
      w: rand(6, 12),
      h: rand(8, 16),
      rot: rand(0, Math.PI),
      vr: rand(-0.18, 0.18),
      life: rand(1100, 1600),
      born: performance.now(),
      color: colors[(Math.random() * colors.length) | 0],
    });
  }
}

function drawHeart(x, y, size, rot, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size;
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.8, -s * 0.2, -s * 0.6, -s * 1.1, 0, -s * 0.55);
  ctx.bezierCurveTo(s * 0.6, -s * 1.1, s * 0.8, -s * 0.2, 0, s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawStar(x, y, r, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const spikes = 5;
  const outer = r;
  const inner = r * 0.45;
  let rot = Math.PI / 2 * 3;
  let cx = 0;
  let cy = 0;
  ctx.moveTo(0, -outer);
  for (let i = 0; i < spikes; i++) {
    cx = Math.cos(rot) * outer;
    cy = Math.sin(rot) * outer;
    ctx.lineTo(cx, cy);
    rot += Math.PI / spikes;

    cx = Math.cos(rot) * inner;
    cy = Math.sin(rot) * inner;
    ctx.lineTo(cx, cy);
    rot += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function tick(now) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    const age = now - p.born;
    const t = Math.min(1, age / p.life);
    const alpha = 1 - t;

    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;

    if (p.kind === "heart") {
      p.rot += 0.02 * p.wobble;
      drawHeart(p.x, p.y, p.w, p.rot, p.color, alpha);
    } else if (p.kind === "star") {
      drawStar(p.x, p.y, p.r, p.color, alpha);
    } else if (p.kind === "confetti") {
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    // 边界与寿命
    if (t >= 1 || p.y > window.innerHeight + 40) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(tick);
}

// --- 背景音乐：优先用 mp3，否则用 WebAudio 小旋律 ---
let audioMode = "none"; // "element" | "webaudio"
let isMusicOn = false;
let audioCtx = null;
let loopTimer = null;

function hasElementAudioSource() {
  // 如果 mp3 不存在/加载失败，这里也不会抛错；我们在播放时再判断。
  return !!audioEl;
}

async function tryPlayElementAudio() {
  if (!hasElementAudioSource()) return false;
  try {
    audioEl.volume = 0.55;
    await audioEl.play();
    audioMode = "element";
    return true;
  } catch {
    return false;
  }
}

function stopElementAudio() {
  if (!audioEl) return;
  audioEl.pause();
}

function ensureAudioContext() {
  if (audioCtx) return audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  audioCtx = new AC();
  return audioCtx;
}

function playCuteLoop() {
  const ac = ensureAudioContext();
  if (!ac) return false;

  const notes = [
    659, 784, 880, 784,
    659, 587, 523, 587,
    659, 784, 988, 784,
    659, 587, 523, 494,
  ];
  const dur = 0.18;
  const start = ac.currentTime + 0.03;

  const master = ac.createGain();
  master.gain.value = 0.06;
  master.connect(ac.destination);

  let t = start;
  for (let i = 0; i < notes.length; i++) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = notes[i];
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.9, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    t += dur;
  }

  // 循环
  const loopMs = Math.ceil(notes.length * dur * 1000);
  loopTimer = window.setTimeout(() => {
    if (isMusicOn) playCuteLoop();
  }, loopMs);
  audioMode = "webaudio";
  return true;
}

function stopCuteLoop() {
  if (loopTimer) window.clearTimeout(loopTimer);
  loopTimer = null;
  if (audioCtx && audioCtx.state !== "closed") {
    // 不关闭 context，方便快速恢复播放
  }
}

async function startMusic() {
  // 先尝试 mp3（如果用户放了 assets/bgm.mp3）
  const ok = await tryPlayElementAudio();
  if (ok) return true;

  // 再 fallback 到 WebAudio 小旋律
  const ac = ensureAudioContext();
  if (!ac) return false;
  if (ac.state === "suspended") {
    try {
      await ac.resume();
    } catch {
      // ignore
    }
  }
  return playCuteLoop();
}

function stopMusic() {
  stopElementAudio();
  stopCuteLoop();
}

function setMusicUI(on) {
  isMusicOn = on;
  musicLabel.textContent = on ? "音乐已开启（再点可暂停）" : "开启背景音乐";
  musicBtn.classList.toggle("isOn", on);
}

// --- UI 行为 ---
const themes = ["pink", "mint", "peach"];
let themeIdx = 0;

function cycleTheme() {
  themeIdx = (themeIdx + 1) % themes.length;
  const t = themes[themeIdx];
  if (t === "pink") document.body.removeAttribute("data-theme");
  else document.body.setAttribute("data-theme", t);
  burstStars(window.innerWidth - 40, 70, 10);
  setBubbleHint(`主题切换：${t === "mint" ? "薄荷" : t === "peach" ? "蜜桃" : "粉粉"}`);
}

function setBubbleHint(text) {
  bubbleEl.textContent = text;
  bubbleEl.animate(
    [
      { transform: "translateY(0)", opacity: 0.7 },
      { transform: "translateY(-4px)", opacity: 1 },
      { transform: "translateY(0)", opacity: 1 },
    ],
    { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" },
  );
}

function randomHint() {
  const i = (Math.random() * CONFIG.bubbleHints.length) | 0;
  return CONFIG.bubbleHints[i];
}

function openNote(title, body) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  if (typeof modal.showModal === "function") modal.showModal();
  else modal.setAttribute("open", "open");
}

function closeNote() {
  if (typeof modal.close === "function") modal.close();
  else modal.removeAttribute("open");
}

// --- 事件绑定 ---
window.addEventListener("resize", resize, { passive: true });
window.addEventListener("pointerdown", (e) => {
  // 轻触也会冒星星
  burstStars(e.clientX, e.clientY, 10);
}, { passive: true });

musicBtn.addEventListener("click", async () => {
  if (isMusicOn) {
    stopMusic();
    setMusicUI(false);
    setBubbleHint("音乐暂停啦～");
    return;
  }

  const ok = await startMusic();
  setMusicUI(ok);
  if (ok) setBubbleHint(audioMode === "element" ? "用你的 mp3 在播放啦～" : "小旋律启动！");
  else setBubbleHint("这个设备好像不支持播放音乐（或被浏览器拦截）");
});

heartBtn.addEventListener("click", (e) => {
  const r = heartBtn.getBoundingClientRect();
  burstHearts(r.left + r.width / 2, r.top, 22);
  setBubbleHint(randomHint());
});

confettiBtn.addEventListener("click", () => {
  confettiBoom();
  setBubbleHint("噼里啪啦～生日烟花来咯！");
});

noteBtn.addEventListener("click", () => {
  openNote(CONFIG.noteTitle, CONFIG.noteBody);
  burstHearts(window.innerWidth * 0.5, window.innerHeight * 0.2, 12);
});

cardBtn.addEventListener("click", () => {
  const c = CONFIG.cards[(Math.random() * CONFIG.cards.length) | 0];
  openNote("你抽到的小卡片", c);
  confettiBoom();
});

themeBtn.addEventListener("click", cycleTheme);

modalOk.addEventListener("click", closeNote);
modal.addEventListener("click", (e) => {
  const rect = modal.getBoundingClientRect();
  const isIn =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;
  // 点击遮罩关闭（点击内容区不关）
  if (!isIn) closeNote();
});

// --- 启动 ---
applyConfig();
resize();
requestAnimationFrame(tick);

// 初始一点点可爱效果
setTimeout(() => burstStars(window.innerWidth * 0.5, window.innerHeight * 0.28, 12), 450);
