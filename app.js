(() => {
  "use strict";
  const MENU = window.MENU || [];
  const EV = window.EVENT || {};
  const DUR = 8000; // ms per story
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };

  const store = {
    get(k, d) { try { const v = localStorage.getItem("dk:" + k); return v ? JSON.parse(v) : d; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem("dk:" + k, JSON.stringify(v)); } catch (_) {} },
  };
  const seen = new Set(store.get("seen", []));
  const liked = new Set(store.get("liked", []));

  const SPICE = ["Not spicy", "Mild", "Medium", "Hot", "Very hot"];
  const SPICE_JP = ["辛くない", "ピリ辛", "中辛", "辛口", "激辛"];
  const KB = [["-3%", "-2%"], ["3%", "-3%"], ["-2%", "3%"], ["3%", "2%"]];
  const emo = (it) => it.emoji || "✨";
  const acc = (it) => `--a1:${it.accent?.[0] || "#ff9a1f"};--a2:${it.accent?.[1] || "#ff2e88"}`;

  /* ---------------- HOME ---------------- */
  if (EV.name) $("#logoText").textContent = EV.name;

  function buildTray() {
    let h = `<button class="ring all" data-i="0" style="--k:0" aria-label="Watch all dishes"><span class="ring-border"><span class="ring-all">🪔</span></span><span class="ring-label">All dishes</span></button>`;
    MENU.forEach((it, i) => {
      h += `<button class="ring ${seen.has(it.id) ? "seen" : ""}" data-i="${i}" data-id="${esc(it.id)}" style="--k:${i + 1}"><span class="ring-border"><img src="${esc(it.photo)}" alt=""></span><span class="ring-label">${esc(it.name)}</span></button>`;
    });
    $("#tray").innerHTML = h;
  }
  function buildGrid() {
    const lastWide = (MENU.length - 1) % 2 === 1;
    $("#grid").innerHTML = MENU.map((it, i) => `
      <button class="card ${i === 0 || (lastWide && i === MENU.length - 1) ? "wide" : ""} ${seen.has(it.id) ? "seen" : ""}" data-i="${i}" data-id="${esc(it.id)}" style="${acc(it)};--k:${i}">
        <img src="${esc(it.photo)}" alt="${esc(it.name)}" style="object-position:${esc(it.focus || "50% 50%")}" loading="${i < 3 ? "eager" : "lazy"}">
        <span class="c-ring" aria-hidden="true"></span>
        <span class="c-play" aria-hidden="true">▶</span>
        <span class="c-info">
          <span class="c-cat">${emo(it)} ${esc(it.category)}</span>
          <span class="c-name">${esc(it.name)}</span>
          <span class="c-jp">${esc(it.jp)}</span>
        </span>
      </button>`).join("");
    const allVeg = MENU.every((m) => m.veg);
    $("#count").innerHTML = `${MENU.length} dishes${allVeg ? " · all veg 🌱" : ""}<br>${MENU.length}品${allVeg ? "・すべてベジ" : ""}`;
  }
  function refreshSeen() {
    document.querySelectorAll("[data-id]").forEach((el) => el.classList.toggle("seen", seen.has(el.dataset.id)));
  }

  function buildRangoli() {
    const L = [
      { n: 48, d: 238, rx: 5, ry: 5, f: "#ffd34d" },
      { n: 24, d: 205, rx: 13, ry: 30, f: "#ff2e88" },
      { n: 24, d: 205, rx: 6, ry: 15, f: "#ffe9b3", r: 0 },
      { n: 16, d: 160, rx: 20, ry: 44, f: "#ff9a1f", r: 11.25 },
      { n: 16, d: 160, rx: 9, ry: 22, f: "#a83cff", r: 11.25 },
      { n: 12, d: 108, rx: 22, ry: 42, f: "#19d3c5" },
      { n: 12, d: 108, rx: 10, ry: 20, f: "#fff3c4" },
      { n: 8, d: 58, rx: 20, ry: 34, f: "#ff2e88", r: 22.5 },
      { n: 8, d: 58, rx: 8, ry: 16, f: "#ffd34d", r: 22.5 },
    ];
    let s = `<svg viewBox="-260 -260 520 520" xmlns="http://www.w3.org/2000/svg">`;
    for (const l of L) for (let k = 0; k < l.n; k++) s += `<ellipse cx="0" cy="${-l.d}" rx="${l.rx}" ry="${l.ry}" fill="${l.f}" transform="rotate(${(k * 360) / l.n + (l.r || 0)})"/>`;
    s += `<circle r="30" fill="#ffd34d"/><circle r="18" fill="#ff2e88"/><circle r="8" fill="#fff3c4"/></svg>`;
    $("#rangoli").innerHTML = s;
  }
  function buildToran() {
    const el = $("#toran");
    const w = Math.max(320, Math.round(el.clientWidth || 360));
    const segs = Math.max(3, Math.round(w / 95)), seg = w / segs;
    let s = `<svg viewBox="0 0 ${w} 56" xmlns="http://www.w3.org/2000/svg">`;
    const yAt = (x) => 7 + Math.sin(((x % seg) / seg) * Math.PI) * 13;
    // hanging strings between scallops
    for (let j = 0; j < segs; j++) {
      const x = seg * (j + 0.5), y0 = yAt(x);
      s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 22}" stroke="#ffcf5a" stroke-width="1.2"/>`;
      s += `<circle cx="${x}" cy="${y0 + 12}" r="4" fill="#ff5a1f"/><path d="M${x} ${y0 + 18} q7 8 0 18 q-7 -10 0 -18z" fill="#2fbf4a"/>`;
    }
    for (let j = 0; j <= segs; j++) {
      const x = seg * j;
      s += `<path d="M${x} 6 l5 9 l-5 7 l-5 -7z" fill="#ff2e88"/>`;
    }
    let k = 0;
    for (let x = 4; x <= w; x += 11, k++) {
      const y = yAt(x), c = k % 2 ? "#ff8f00" : "#ffc400";
      s += `<circle cx="${x}" cy="${y}" r="6.2" fill="${c}" stroke="${k % 2 ? "#e06500" : "#e8a200"}" stroke-width="1.4" stroke-dasharray="2 1.4"/><circle cx="${x}" cy="${y}" r="2" fill="#a64b00"/>`;
    }
    $("#toran").innerHTML = s + "</svg>";
  }

  /* ---------------- SKY: embers + fireworks ---------------- */
  const sky = (() => {
    const c = $("#sky"), ctx = c.getContext("2d");
    let W = 0, H = 0, raf = 0, running = true, lastAuto = 0;
    const parts = [], rockets = [], embers = [];
    const COLORS = ["#ffd34d", "#ff9a1f", "#ff2e88", "#c86bff", "#19d3c5", "#ffffff", "#ff5e3a", "#7dff9a"];
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const ember = (init) => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: rand(0.6, 2.2), vy: -rand(0.2, 0.7), ph: Math.random() * 6.28, a: rand(0.3, 0.9) });
    function launch(x, y) {
      rockets.push({ x: x + rand(-30, 30), y: H + 5, px: x, py: H + 5, tx: x, ty: y, color: pick(COLORS) });
    }
    function explode(x, y, color) {
      const n = (rand(70, 110)) | 0, ring = Math.random() < 0.4, c2 = pick(COLORS);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
        const sp = ring ? rand(3.6, 4.2) : rand(0.8, 5);
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: rand(0.010, 0.02), color: Math.random() < 0.3 ? c2 : color, r: rand(1.3, 2.6), tw: Math.random() < 0.3 });
      }
    }
    function frame(t) {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) {
        e.y += e.vy; e.x += Math.sin(t / 1200 + e.ph) * 0.25;
        if (e.y < -10) Object.assign(e, ember(false));
        ctx.globalAlpha = e.a * (0.55 + 0.45 * Math.sin(t / 280 + e.ph));
        ctx.fillStyle = "#ffc35a";
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.283); ctx.fill();
      }
      ctx.lineCap = "round";
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.px = r.x; r.py = r.y;
        r.y += (r.ty - r.y) * 0.075 - 1.2; r.x += (r.tx - r.x) * 0.075;
        ctx.globalAlpha = 1; ctx.strokeStyle = "#fff2c0"; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(r.px, r.py + 10); ctx.lineTo(r.x, r.y); ctx.stroke();
        if (r.y <= r.ty + 4) { explode(r.x, r.y, r.color); rockets.splice(i, 1); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx *= 0.972; p.vy = p.vy * 0.972 + 0.05; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.tw ? p.life * (0.4 + Math.random() * 0.6) : p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.4 + p.life * 0.6), 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce && t - lastAuto > 2400) { lastAuto = t; launch(rand(0.12, 0.88) * W, rand(0.1, 0.38) * H); }
      if (running) raf = requestAnimationFrame(frame);
    }
    resize();
    for (let i = 0; i < 42; i++) embers.push(ember(true));
    addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return {
      launch, explode,
      pause() { running = false; cancelAnimationFrame(raf); },
      resume() { if (!running) { running = true; raf = requestAnimationFrame(frame); } },
      show(n = 8) { for (let i = 0; i < n; i++) setTimeout(() => launch(rand(0.1, 0.9) * W, rand(0.12, 0.45) * H), i * 260); },
    };
  })();

  /* ---------------- VIEWER ---------------- */
  const viewer = $("#viewer"), stage = $("#stage"), vbg = $("#viewerBg");
  const sheetWrap = $("#sheetWrap"), sheet = $("#sheet"), sheetBody = $("#sheetBody");
  const reactTray = $("#reactTray"), coach = $("#coach");
  let cur = -1, face = null, isOpen = false, turning = null;
  const pauses = new Set();
  const setPause = (why, on) => { on ? pauses.add(why) : pauses.delete(why); viewer.classList.toggle("paused", pauses.size > 0); syncPauseBtn(); };
  function syncPauseBtn() {
    const b = face && face.querySelector('[data-act="pause"]');
    if (b) { const p = pauses.has("user"); b.textContent = p ? "▶" : "❚❚"; b.setAttribute("aria-label", p ? "Play" : "Pause"); }
  }

  function originFrom(el) {
    if (!el) { viewer.style.transformOrigin = "50% 50%"; return; }
    const r = el.getBoundingClientRect();
    viewer.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  }

  function openViewer(i, fromEl) {
    if (isOpen || !MENU.length) return;
    isOpen = true;
    originFrom(fromEl);
    pauses.clear(); viewer.classList.remove("paused", "holding", "closing");
    viewer.classList.add("open");
    if (!reduce) { viewer.classList.add("opening"); setTimeout(() => viewer.classList.remove("opening"), 460); }
    document.body.classList.add("lock");
    sky.pause();
    try { history.pushState({ dkStory: 1 }, ""); } catch (_) {}
    show(i, 0);
    if (!store.get("coached", false)) { coach.hidden = false; setPause("coach", true); }
  }
  function closeViewer(finished) {
    if (!isOpen) return;
    if (history.state && history.state.dkStory) { pendingFinish = !!finished; history.back(); }
    else doClose(finished);
  }
  let pendingFinish = false;
  addEventListener("popstate", () => { if (isOpen) { doClose(pendingFinish); pendingFinish = false; } });

  function doClose(finished) {
    if (!isOpen) return;
    isOpen = false;
    closeSheet(); closeReact();
    const target = document.querySelector(`.ring[data-i="${cur}"]:not(.all)`);
    originFrom(target && target.getBoundingClientRect().bottom > 0 ? target : null);
    const end = () => {
      viewer.classList.remove("open", "closing", "paused", "holding");
      stage.querySelectorAll(".face").forEach((f) => f.remove());
      face = null; cur = -1; turning = null;
      document.body.classList.remove("lock");
      sky.resume();
      refreshSeen();
      if (finished) { sky.show(10); toast("That's the menu! Happy Diwali 🪔✨"); }
    };
    if (reduce) end(); else { viewer.classList.add("closing"); setTimeout(end, 370); }
  }

  function buildFace(it, i) {
    const f = document.createElement("article");
    f.className = "face";
    f.style.cssText = `${acc(it)};--kx:${KB[i % 4][0]};--ky:${KB[i % 4][1]};--dur:${DUR}ms`;
    const bars = MENU.map((_, k) => `<i class="${k < i ? "done" : k === i ? "cur" : ""}"><b></b></i>`).join("");
    let d = 0;
    const name = String(it.name).split(" ").map((w) => `<span class="w">${[...w].map((ch) => `<span class="l" style="--d:${(d++) * 45}ms">${esc(ch)}</span>`).join("")}</span>`).join(" ");
    const sp = Math.max(0, Math.min(4, it.spice | 0));
    const chips = [];
    if (it.veg) chips.push(`<span class="chip"><i class="veg-dot"></i>Veg · ベジ</span>`);
    chips.push(`<span class="chip">${sp ? "🌶️".repeat(sp) : "😌"} ${SPICE[sp]} · ${SPICE_JP[sp]}</span>`);
    if (it.sweet) chips.push(`<span class="chip">🍯 Sweet · 甘い</span>`);
    if (it.price) chips.push(`<span class="chip price">¥${esc(it.price)}</span>`);
    const al = (it.allergens || []).length ? `<p class="s-allergy fade-in" style="--fd:1.05s">⚠️ Contains · 含む: ${it.allergens.map(esc).join(", ")}</p>` : "";
    const pair = it.pairsWith && MENU.find((m) => m.id === it.pairsWith);
    const mention = pair ? `<button class="mention fade-in" style="--fd:1.2s" data-go="${esc(pair.id)}">🤝 Best with <b>@${esc(pair.name.toLowerCase().replace(/\s+/g, "."))}</b> →</button>` : "";
    let glit = "";
    for (let k = 0; k < 14; k++) glit += `<i style="left:${rand(2, 98).toFixed(1)}%;--s:${rand(3, 8).toFixed(1)}px;--t:${rand(5, 10).toFixed(1)}s;--dl:${rand(0, 6).toFixed(1)}s;--dx:${rand(-30, 30).toFixed(0)}px"></i>`;
    const isLiked = liked.has(it.id);
    f.innerHTML = `
      <div class="s-media"><img class="kb" src="${esc(it.photo)}" alt="${esc(it.name)}" style="object-position:${esc(it.focus || "50% 50%")}" draggable="false"></div>
      <div class="s-tint"></div>
      <div class="s-shade"></div>
      <div class="s-glitter">${glit}</div>
      <div class="bars">${bars}</div>
      <header class="s-head">
        <span class="s-av"><img src="${esc(it.photo)}" alt=""></span>
        <span class="s-who"><b>${esc(EV.handle || "diwali.kitchen")}</b><small>${emo(it)} ${esc(it.category)} · ${i + 1} of ${MENU.length}</small></span>
        <button class="s-btn" data-act="pause" aria-label="Pause">❚❚</button>
        <button class="s-btn" data-act="close" aria-label="Close">✕</button>
      </header>
      <div class="s-content">
        <span class="sticker">${emo(it)} ${esc(it.category)}</span>
        <h2 class="s-name ${String(it.name).length > 12 ? "long" : ""}" aria-label="${esc(it.name)}">${name}</h2>
        <p class="s-jp fade-in" style="--fd:.65s">${esc(it.jp)}</p>
        <p class="s-tag fade-in" style="--fd:.8s">${esc(it.tagline)}</p>
        <p class="s-tagjp fade-in" style="--fd:.88s">${esc(it.taglineJp)}</p>
        <div class="chips fade-in" style="--fd:.95s">${chips.join("")}</div>
        ${al}${mention}
      </div>
      <div class="swipe-hint" aria-hidden="true"><span>︿</span>Swipe up for recipe</div>
      <div class="s-foot">
        <button class="recipe-btn" data-act="recipe"><span>📖</span> View Recipe <small>レシピ</small></button>
        <button class="icon-btn like ${isLiked ? "on" : ""}" data-act="like" aria-label="Like" aria-pressed="${isLiked}">${isLiked ? "❤️" : "🤍"}</button>
        <button class="icon-btn" data-act="react" aria-label="React">😍</button>
      </div>`;
    return f;
  }

  function startFace(f) {
    f.classList.add("live");
    const bar = f.querySelector(".bars i.cur");
    if (bar) bar.classList.add("run");
    syncPauseBtn();
  }
  function finishTurn() {
    if (!turning) return;
    const { old, nf } = turning;
    turning = null;
    old.remove();
    nf.classList.remove("in-l", "in-r");
    startFace(nf);
  }
  function show(i, dir) {
    const it = MENU[i];
    if (!it) return;
    finishTurn();
    closeReact();
    const nf = buildFace(it, i);
    stage.insertBefore(nf, reactTray);
    const old = face;
    face = nf; cur = i;
    vbg.style.backgroundImage = `url("${it.photo}")`;
    if (!seen.has(it.id)) { seen.add(it.id); store.set("seen", [...seen]); }
    const nx = MENU[i + 1]; if (nx) { const im = new Image(); im.src = nx.photo; }
    if (old && dir && !reduce) {
      old.classList.remove("live");
      old.classList.add(dir > 0 ? "out-l" : "out-r");
      nf.classList.add(dir > 0 ? "in-l" : "in-r");
      turning = { old, nf };
      nf.addEventListener("animationend", function h(e) {
        if (e.target !== nf) return;
        nf.removeEventListener("animationend", h);
        if (turning && turning.nf === nf) finishTurn();
      });
    } else {
      if (old) old.remove();
      startFace(nf);
    }
  }
  function restartCurrent() {
    if (!face) return;
    const bar = face.querySelector(".bars i.cur");
    face.classList.remove("live"); bar && bar.classList.remove("run");
    void face.offsetWidth;
    startFace(face);
  }
  const next = () => { if (!isOpen) return; cur < MENU.length - 1 ? show(cur + 1, 1) : closeViewer(true); };
  const prev = () => { if (!isOpen) return; cur > 0 ? show(cur - 1, -1) : restartCurrent(); };
  function goTo(id) {
    const j = MENU.findIndex((m) => m.id === id);
    if (j >= 0 && j !== cur) show(j, j > cur ? 1 : -1);
  }

  // auto-advance when the progress bar finishes
  stage.addEventListener("animationend", (e) => {
    if (e.animationName !== "fill" || !face || !face.contains(e.target)) return;
    next();
  });

  /* ---- actions ---- */
  stage.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { goTo(go.dataset.go); return; }
    const emoBtn = e.target.closest("[data-emo]");
    if (emoBtn) { burst(emoBtn.dataset.emo, 16, emoBtn); vibrate(15); closeReact(); return; }
    const li = e.target.closest(".ing li");
    if (li) { toggleIngredient(li); return; }
    const a = e.target.closest("[data-act]");
    if (!a) return;
    const act = a.dataset.act;
    if (act === "close") closeViewer();
    else if (act === "pause") setPause("user", !pauses.has("user"));
    else if (act === "recipe") openSheet();
    else if (act === "sheet-close") closeSheet();
    else if (act === "like") toggleLike(a);
    else if (act === "react") reactTray.classList.contains("open") ? closeReact() : openReact();
  });

  $("#coachOk").addEventListener("click", (e) => {
    e.stopPropagation();
    coach.hidden = true; store.set("coached", true); setPause("coach", false);
    restartCurrent();
  });

  function toggleLike(btn) {
    const it = MENU[cur]; if (!it) return;
    const on = !liked.has(it.id);
    on ? liked.add(it.id) : liked.delete(it.id);
    store.set("liked", [...liked]);
    btn.classList.toggle("on", on); btn.textContent = on ? "❤️" : "🤍"; btn.setAttribute("aria-pressed", on);
    btn.animate([{ transform: "scale(1)" }, { transform: "scale(1.5)" }, { transform: "scale(1)" }], { duration: 450, easing: "cubic-bezier(.2,1.6,.4,1)" });
    if (on) {
      const h = document.createElement("div"); h.className = "big-heart"; h.textContent = "❤️";
      face.appendChild(h); h.addEventListener("animationend", () => h.remove());
      burst("❤️", 10, btn); vibrate(25);
    }
  }
  function openReact() { reactTray.classList.add("open"); setPause("react", true); }
  function closeReact() { reactTray.classList.remove("open"); setPause("react", false); }

  function burst(ch, n, fromEl) {
    const sr = stage.getBoundingClientRect();
    const o = fromEl ? fromEl.getBoundingClientRect() : null;
    for (let k = 0; k < n; k++) {
      const s = document.createElement("span");
      s.className = "fly"; s.textContent = ch;
      const x0 = o ? o.left - sr.left + o.width / 2 : sr.width * rand(0.2, 0.8);
      const y0 = o ? o.top - sr.top : sr.height - 120;
      s.style.left = x0 + "px"; s.style.top = y0 + "px"; s.style.fontSize = rand(22, 46) + "px";
      stage.appendChild(s);
      const dx = rand(-sr.width * 0.45, sr.width * 0.25), dy = -rand(sr.height * 0.35, sr.height * 0.8);
      const anim = s.animate([
        { transform: "translate(-50%,0) scale(.3) rotate(0deg)", opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { transform: `translate(calc(-50% + ${dx}px), ${dy}px) scale(1.1) rotate(${rand(-60, 60)}deg)`, opacity: 0 },
      ], { duration: rand(1500, 2400), delay: k * 50, easing: "cubic-bezier(.15,.7,.3,1)", fill: "both" });
      anim.onfinish = () => s.remove();
    }
  }

  /* ---- recipe sheet ---- */
  function recipeHTML(it) {
    const sp = Math.max(0, Math.min(4, it.spice | 0));
    const ing = it.ingredients || [], steps = it.steps || [];
    return `
      <div class="r-head">
        <img src="${esc(it.photo)}" alt="" style="object-position:${esc(it.focus || "50% 50%")}">
        <div><p class="r-cat">${emo(it)} ${esc(it.category)}</p><h3>${esc(it.name)}</h3><p class="r-jp">${esc(it.jp)}</p></div>
      </div>
      <div class="r-meta">
        <span>⏱️<b>${esc(it.time || "—")}</b><small>Time · 時間</small></span>
        <span>🍽️<b>${esc(it.serves || "—")}</b><small>Serves · 人分</small></span>
        <span>${sp ? "🌶️" : "😌"}<b>${SPICE[sp]}</b><small>${SPICE_JP[sp]}</small></span>
      </div>
      ${it.funFact ? `<div class="r-fact"><b>✨ Did you know?</b>${esc(it.funFact)}</div>` : ""}
      <h4>Ingredients <small>材料</small><span class="r-count" id="rCount">0 / ${ing.length}</span></h4>
      <div class="r-progress"><i id="rProg"></i></div>
      <ul class="ing">${ing.map((x, k) => `<li style="--k:${k}"><span class="box"></span><span class="t">${esc(x)}</span></li>`).join("")}</ul>
      <p class="r-hint">Tap the ingredients to tick them off ✓</p>
      <h4>Steps <small>作り方</small></h4>
      <ol class="steps">${steps.map((s, k) => `<li style="--k:${k}">${esc(s)}</li>`).join("")}</ol>
      ${it.tip ? `<div class="r-tip"><b>💡 Chef's tip</b>${esc(it.tip)}</div>` : ""}
      ${(it.allergens || []).length ? `<div class="r-allergy">⚠️ <b>Contains · 含む:</b> ${it.allergens.map(esc).join(", ")}<small>Allergen info is a guide — please ask our team at the stall.<br>アレルギーについては、ブースのスタッフにお尋ねください。</small></div>` : ""}
      <button class="r-back" data-act="sheet-close">↩ Back to the story</button>`;
  }
  function openSheet() {
    const it = MENU[cur]; if (!it) return;
    closeReact();
    sheetWrap.style.cssText = acc(it);
    sheetBody.innerHTML = recipeHTML(it);
    sheetBody.scrollTop = 0;
    sheet.style.transform = "";
    sheetWrap.classList.add("open");
    setPause("sheet", true);
  }
  function closeSheet() {
    sheet.style.transform = "";
    sheetWrap.classList.remove("open");
    setPause("sheet", false);
  }
  function toggleIngredient(li) {
    li.classList.toggle("on");
    vibrate(8);
    const all = sheetBody.querySelectorAll(".ing li"), done = sheetBody.querySelectorAll(".ing li.on").length;
    $("#rCount").textContent = `${done} / ${all.length}`;
    $("#rProg").style.width = (all.length ? (done / all.length) * 100 : 0) + "%";
    if (done === all.length && li.classList.contains("on")) {
      ["🎉", "✨", "🪔", "🧡"].forEach((c, k) => setTimeout(() => burst(c, 6, li), k * 120));
      toast("All set — ready to cook! 🎉");
    }
  }
  // drag the sheet down to close
  (() => {
    const grab = $("#sheetGrab");
    let y0 = null, dy = 0;
    grab.addEventListener("pointerdown", (e) => { y0 = e.clientY; dy = 0; sheet.classList.add("dragging"); grab.setPointerCapture(e.pointerId); });
    grab.addEventListener("pointermove", (e) => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
    const up = () => { if (y0 === null) return; y0 = null; sheet.classList.remove("dragging"); if (dy > 90) closeSheet(); else sheet.style.transform = ""; };
    grab.addEventListener("pointerup", up); grab.addEventListener("pointercancel", up);
  })();

  /* ---- gestures: tap / hold / swipe ---- */
  let g = null;
  const ignore = (t) => t.closest("button, .sheet-wrap, .react-tray, .coach, a");
  stage.addEventListener("pointerdown", (e) => {
    if (!isOpen || ignore(e.target) || (e.pointerType === "mouse" && e.button !== 0)) return;
    if (reactTray.classList.contains("open")) { closeReact(); return; }
    g = { x: e.clientX, y: e.clientY, id: e.pointerId, hold: false, dx: 0, dy: 0 };
    g.timer = setTimeout(() => { if (g) { g.hold = true; setPause("hold", true); viewer.classList.add("holding"); } }, 230);
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
  });
  stage.addEventListener("pointermove", (e) => {
    if (!g || e.pointerId !== g.id) return;
    g.dx = e.clientX - g.x; g.dy = e.clientY - g.y;
    if (Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10) clearTimeout(g.timer);
    if (g.dy > 0 && g.dy > Math.abs(g.dx)) {
      stage.style.transition = "none";
      stage.style.transform = `translateY(${g.dy * 0.9}px) scale(${Math.max(0.82, 1 - g.dy / 1400)})`;
      stage.style.borderRadius = Math.min(28, g.dy / 6) + "px";
    }
  });
  function endGesture(e, cancelled) {
    if (!g || (e && e.pointerId !== g.id)) return;
    clearTimeout(g.timer);
    const { dx, dy, hold } = g; g = null;
    stage.style.transition = ""; stage.style.transform = ""; stage.style.borderRadius = "";
    if (hold) { setPause("hold", false); viewer.classList.remove("holding"); }
    if (cancelled) return;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (dy > 110 && ay > ax) return closeViewer();
    if (dy < -60 && ay > ax) return openSheet();
    if (ax > 60 && ax > ay) return dx < 0 ? next() : prev();
    if (hold || ax > 12 || ay > 12) return;
    const r = stage.getBoundingClientRect();
    (e.clientX - r.left) < r.width * 0.3 ? prev() : next();
  }
  stage.addEventListener("pointerup", (e) => endGesture(e, false));
  stage.addEventListener("pointercancel", (e) => endGesture(e, true));
  stage.addEventListener("contextmenu", (e) => e.preventDefault());

  addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") { sheetWrap.classList.contains("open") ? closeSheet() : closeViewer(); }
    else if (sheetWrap.classList.contains("open")) return;
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowUp") openSheet();
    else if (e.key === " ") { e.preventDefault(); setPause("user", !pauses.has("user")); }
  });
  document.addEventListener("visibilitychange", () => setPause("hidden", document.hidden));

  /* ---------------- toast ---------------- */
  let toastT = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------------- wire up home ---------------- */
  buildTray(); buildGrid(); buildRangoli(); buildToran();
  addEventListener("resize", (() => { let t; return () => { clearTimeout(t); t = setTimeout(buildToran, 200); }; })());

  document.addEventListener("click", (e) => {
    if (isOpen) return;
    const el = e.target.closest(".ring, .card");
    if (el) { openViewer(+el.dataset.i, el); return; }
    if (e.target.closest("#watchAll")) { openViewer(0, e.target.closest("#watchAll")); return; }
    if (e.target.closest("#hero")) { sky.launch(e.clientX, e.clientY); vibrate(10); }
  });

  // a small welcome show
  setTimeout(() => sky.show(3), 600);
})();
