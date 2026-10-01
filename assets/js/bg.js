/*
 * Interactive network background: drifting nodes that link up, react to the cursor,
 * and pass small "packets" along links. Theme-aware, pauses when the tab is hidden,
 * and renders a single static frame for reduced-motion users.
 */
(function () {
  const canvas = document.getElementById("net");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  const LINK = 135;      // max link distance (px)
  const MOUSE_R = 190;   // cursor influence radius
  let w = 0, h = 0, dpr = 1, nodes = [], packets = [], raf = 0;
  const mouse = { x: -9999, y: -9999, active: false };
  let col = {};

  function readColors() {
    const s = getComputedStyle(root);
    const get = (n) => s.getPropertyValue(n).trim();
    col = { a: get("--net-a"), b: get("--net-b"), line: get("--net-line"), node: get("--net-node"), glow: get("--net-glow") };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.min(110, Math.round((w * h) / 15000));
    while (nodes.length < target) nodes.push(spawn());
    nodes.length = target;
  }

  function spawn() {
    return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: 1.2 + Math.random() * 1.6 };
  }

  function rgba(c, a) { // accepts "#rrggbb" or "r,g,b"
    if (c[0] === "#") { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
    return `rgba(${c},${a})`;
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      if (mouse.active) { // gentle pull toward the cursor, with a soft dead-zone so nodes don't collapse onto it
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < MOUSE_R && d > 60) { n.x += (dx / d) * 0.35; n.y += (dy / d) * 0.35; }
      }
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    if (mouse.active) { // cursor spotlight
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
      g.addColorStop(0, rgba(col.glow, 0.16)); g.addColorStop(1, rgba(col.glow, 0));
      ctx.fillStyle = g; ctx.fillRect(mouse.x - 260, mouse.y - 260, 520, 520);
    }

    const links = [];
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = rgba(col.line, (1 - d / LINK) * 0.55);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          links.push([a, b, d]);
        }
      }
      if (mouse.active) { // bright links from nearby nodes to the cursor
        const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (d < MOUSE_R) {
          ctx.strokeStyle = rgba(col.a, (1 - d / MOUSE_R) * 0.85);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const near = mouse.active && Math.hypot(n.x - mouse.x, n.y - mouse.y) < MOUSE_R;
      ctx.fillStyle = near ? rgba(col.a, 0.95) : rgba(col.node, 0.55);
      ctx.beginPath(); ctx.arc(n.x, n.y, near ? n.r + 0.8 : n.r, 0, 6.283); ctx.fill();
    }

    // packets travelling along random links
    if (!reduce && links.length && packets.length < 6 && Math.random() < 0.03) {
      packets.push({ l: links[(Math.random() * links.length) | 0], p: 0, s: 0.012 + Math.random() * 0.012 });
    }
    packets = packets.filter((k) => (k.p += k.s) < 1);
    for (const k of packets) {
      const [a, b] = k.l;
      const x = a.x + (b.x - a.x) * k.p, y = a.y + (b.y - a.y) * k.p;
      ctx.fillStyle = rgba(col.b, 0.95);
      ctx.shadowColor = rgba(col.b, 0.9); ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function frame(t) { step(); draw(t); raf = requestAnimationFrame(frame); }
  function start() { if (!raf && !reduce) raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  addEventListener("resize", () => { resize(); if (reduce) draw(0); }, { passive: true });
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });
  addEventListener("pointerup", (e) => { if (e.pointerType === "touch") mouse.active = false; });
  document.addEventListener("mouseleave", () => { mouse.active = false; });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  new MutationObserver(() => { readColors(); if (reduce) draw(0); }).observe(root, { attributes: true, attributeFilter: ["class"] });

  readColors(); resize();
  if (reduce) draw(0); else start();
})();
