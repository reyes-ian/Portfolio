/*
 * Program showcase: an interactive terminal that runs browser ports of my practice programs
 * (see ports.js) next to the original source. Input works like C++ cin / Java Scanner:
 * tokens are split on whitespace, and one typed line can feed several reads.
 */
window.createShowcase = function (Vue) {
  const { reactive, computed, nextTick } = Vue;
  const programs = window.PROGRAMS || [];
  const ports = window.PORTS || {};

  const sc = reactive({ id: null, segs: [], input: "", waiting: false, running: false, done: false });
  let runId = 0, pending = null;
  class Stop extends Error {}

  const scroll = () => nextTick(() => { const e = document.getElementById("termscreen"); if (e) e.scrollTop = e.scrollHeight; });
  const focusInput = () => nextTick(() => { const e = document.getElementById("tin"); if (e && !e.disabled) e.focus({ preventScroll: true }); });
  function add(kind, s) {
    const last = sc.segs[sc.segs.length - 1];
    if (last && last.k === kind) last.s += s; else sc.segs.push({ k: kind, s });
    scroll();
  }

  const NUM = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/;

  function makeIO(my) {
    const alive = () => { if (my !== runId) throw new Stop(); };
    const buf = { rest: "", nl: false }; // rest of the current typed line; nl = its newline is still unread

    const nextLine = () => new Promise((res, rej) => {
      alive();
      pending = { res, rej };
      sc.waiting = true;
      focusInput();
    }).then((line) => { buf.rest = line; buf.nl = true; });

    async function word() { // cin >> string
      for (;;) {
        alive();
        buf.rest = buf.rest.replace(/^\s+/, "");
        if (buf.rest) { const w = buf.rest.match(/^\S+/)[0]; buf.rest = buf.rest.slice(w.length); return w; }
        await nextLine();
      }
    }
    async function num() { // cin >> double (reads the numeric prefix, like cin does)
      for (;;) {
        alive();
        buf.rest = buf.rest.replace(/^\s+/, "");
        if (!buf.rest) { await nextLine(); continue; }
        const m = buf.rest.match(NUM);
        if (m) { buf.rest = buf.rest.slice(m[0].length); return parseFloat(m[0]); }
        const bad = buf.rest.match(/^\S+/)[0];
        buf.rest = buf.rest.slice(bad.length);
        add("sys", `  ("${bad}" is not a number, try again)\n`);
      }
    }
    async function ch() { // cin >> char
      for (;;) {
        alive();
        buf.rest = buf.rest.replace(/^\s+/, "");
        if (buf.rest) { const c = buf.rest[0]; buf.rest = buf.rest.slice(1); return c; }
        await nextLine();
      }
    }
    async function getline() { // std::getline(cin, s) / Scanner.nextLine()
      alive();
      if (buf.rest === "" && !buf.nl) await nextLine();
      const s = buf.rest; buf.rest = ""; buf.nl = false;
      return s;
    }
    function ignore() { if (buf.rest !== "") buf.rest = buf.rest.slice(1); else buf.nl = false; } // cin.ignore()

    return {
      print: (s) => { alive(); add("out", String(s)); },
      println: (s = "") => { alive(); add("out", String(s) + "\n"); },
      word, num, ch, getline, ignore,
      int: async () => Math.trunc(await num()),
      sleep: (ms) => new Promise((r) => setTimeout(() => { alive(); r(); }, ms)),
      rand: (n) => Math.floor(Math.random() * n),
      g: cppNum,
      jd: javaDouble,
    };
  }

  // std::cout default number formatting (6 significant digits)
  function cppNum(x) {
    if (Number.isNaN(x)) return "nan";
    if (!Number.isFinite(x)) return x < 0 ? "-inf" : "inf";
    if (x === 0) return "0";
    let s = x.toPrecision(6);
    if (s.includes("e")) {
      let [m, e] = s.split("e");
      if (m.includes(".")) m = m.replace(/\.?0+$/, "");
      return m + "e" + e[0] + e.slice(1).padStart(2, "0");
    }
    return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
  }
  // Java Double.toString
  function javaDouble(x) {
    if (Number.isNaN(x)) return "NaN";
    if (!Number.isFinite(x)) return x < 0 ? "-Infinity" : "Infinity";
    const a = Math.abs(x);
    if (a !== 0 && (a >= 1e7 || a < 1e-3)) {
      let [m, e] = x.toExponential().split("e");
      if (!m.includes(".")) m += ".0";
      return m + "E" + e.replace("+", "");
    }
    return Number.isInteger(x) ? x.toFixed(1) : String(x);
  }

  async function start(id) {
    stop();
    sc.id = id; sc.segs = []; sc.input = ""; sc.waiting = false; sc.done = false; sc.running = true;
    const my = ++runId;
    try {
      await ports[id](makeIO(my));
      if (my === runId) { add("sys", "\n[Program finished. Press Restart to run it again.]\n"); sc.done = true; }
    } catch (e) {
      if (!(e instanceof Stop)) { add("sys", "\n[Something went wrong: " + e.message + "]\n"); console.error(e); }
    } finally {
      if (my === runId) { sc.running = false; sc.waiting = false; }
    }
  }
  function stop() {
    runId++;
    if (pending) { const p = pending; pending = null; p.rej(new Stop()); }
    sc.waiting = false;
  }
  function back() { stop(); sc.id = null; sc.segs = []; sc.running = false; sc.done = false; }
  function submit() {
    if (!sc.waiting || !pending) return;
    const line = sc.input; sc.input = "";
    add("in", line + "\n");
    sc.waiting = false;
    const p = pending; pending = null;
    p.res(line);
  }

  const scCurrent = computed(() => programs.find((p) => p.id === sc.id) || null);
  const scLineNums = computed(() => (scCurrent.value ? Array.from({ length: scCurrent.value.code.split("\n").length - 1 }, (_, i) => i + 1).join("\n") : ""));

  return { sc, programs, scCurrent, scLineNums, scStart: start, scBack: back, scSubmit: submit, scFocus: focusInput };
};
