/*
 * DSA Lab logic: sorting visualizer, search comparison, stack/queue simulator.
 * Sorting algorithms are generators that yield one visual step at a time
 * ({t:'cmp'|'swap'|'set'|'sorted', ...}), so the UI can play, pause and single-step them.
 */
window.createDsa = function (Vue) {
  const { reactive, ref, computed } = Vue;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const randArr = (n) => Array.from({ length: n }, () => 8 + Math.floor(Math.random() * 92));
  const cmp = (i, j) => ({ t: "cmp", i, j });
  const swp = (i, j) => ({ t: "swap", i, j });

  /* ---------- sorting algorithms (operate on their own copy) ---------- */
  function* bubble(a) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        yield cmp(j, j + 1);
        if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swapped = true; yield swp(j, j + 1); }
      }
      yield { t: "sorted", idx: [n - 1 - i] };
      if (!swapped) return;
    }
  }
  function* selection(a) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) { yield cmp(m, j); if (a[j] < a[m]) m = j; }
      if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; yield swp(i, m); }
      yield { t: "sorted", idx: [i] };
    }
  }
  function* insertion(a) {
    for (let i = 1; i < a.length; i++) {
      for (let j = i; j > 0; j--) {
        yield cmp(j - 1, j);
        if (a[j - 1] > a[j]) { [a[j - 1], a[j]] = [a[j], a[j - 1]]; yield swp(j - 1, j); } else break;
      }
    }
  }
  function* mergeRec(a, l, r) {
    if (l >= r) return;
    const m = (l + r) >> 1;
    yield* mergeRec(a, l, m);
    yield* mergeRec(a, m + 1, r);
    const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < L.length && j < R.length) {
      yield cmp(l + i, m + 1 + j);
      a[k] = L[i] <= R[j] ? L[i++] : R[j++];
      yield { t: "set", i: k, v: a[k] }; k++;
    }
    while (i < L.length) { a[k] = L[i++]; yield { t: "set", i: k, v: a[k] }; k++; }
    while (j < R.length) { a[k] = R[j++]; yield { t: "set", i: k, v: a[k] }; k++; }
  }
  const merge = (a) => mergeRec(a, 0, a.length - 1);
  function* quickRec(a, lo, hi) {
    if (lo > hi) return;
    if (lo === hi) { yield { t: "sorted", idx: [lo] }; return; }
    const p = a[hi]; let i = lo;
    for (let j = lo; j < hi; j++) {
      yield cmp(j, hi);
      if (a[j] < p) { if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; yield swp(i, j); } i++; }
    }
    if (i !== hi) { [a[i], a[hi]] = [a[hi], a[i]]; yield swp(i, hi); }
    yield { t: "sorted", idx: [i] };
    yield* quickRec(a, lo, i - 1);
    yield* quickRec(a, i + 1, hi);
  }
  const quick = (a) => quickRec(a, 0, a.length - 1);

  const algos = {
    bubble:    { name: "Bubble sort",    best: "O(n)",       avg: "O(n²)",      worst: "O(n²)",      space: "O(1)",    run: bubble,    note: "Repeatedly swaps adjacent out-of-order pairs; stops early if a pass makes no swaps." },
    selection: { name: "Selection sort", best: "O(n²)",      avg: "O(n²)",      worst: "O(n²)",      space: "O(1)",    run: selection, note: "Finds the smallest remaining item and places it next. Few swaps, many comparisons." },
    insertion: { name: "Insertion sort", best: "O(n)",       avg: "O(n²)",      worst: "O(n²)",      space: "O(1)",    run: insertion, note: "Grows a sorted prefix by sliding each new item into place. Great on nearly-sorted data." },
    merge:     { name: "Merge sort",     best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)",    run: merge,     note: "Divide and conquer: sort halves, then merge them. Stable and predictable." },
    quick:     { name: "Quick sort",     best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)",      space: "O(log n)", run: quick,    note: "Partitions around a pivot (last item here), then recurses on each side." },
  };
  const algoList = Object.entries(algos).map(([id, a]) => ({ id, name: a.name }));

  /* ---------- sorting state ---------- */
  const lab = reactive({ tab: "programs" });
  const sort = reactive({ algo: "bubble", size: 32, speed: 70, arr: randArr(32), cmp: [], swp: [], sorted: [], running: false, finished: false, comps: 0, writes: 0 });
  const algoInfo = computed(() => algos[sort.algo]);
  let gen = null, token = 0;
  const delay = () => 4 + Math.round(((100 - sort.speed) ** 2) / 25);

  function clearMarks() { sort.cmp = []; sort.swp = []; sort.sorted = []; sort.comps = 0; sort.writes = 0; sort.finished = false; }
  function shuffle() { token++; gen = null; sort.running = false; sort.arr = randArr(sort.size); clearMarks(); }

  function apply(s) {
    sort.cmp = []; sort.swp = [];
    if (s.t === "cmp") { sort.cmp = [s.i, s.j]; sort.comps++; }
    else if (s.t === "swap") { const a = sort.arr; [a[s.i], a[s.j]] = [a[s.j], a[s.i]]; sort.swp = [s.i, s.j]; sort.writes++; }
    else if (s.t === "set") { sort.arr[s.i] = s.v; sort.swp = [s.i]; sort.writes++; }
    else if (s.t === "sorted") { sort.sorted = sort.sorted.concat(s.idx); }
  }
  function tick() {
    if (!gen) gen = algos[sort.algo].run(sort.arr.slice());
    const r = gen.next();
    if (r.done) { sort.cmp = []; sort.swp = []; sort.sorted = sort.arr.map((_, i) => i); sort.finished = true; sort.running = false; gen = null; return false; }
    apply(r.value);
    return true;
  }
  async function play() {
    if (sort.running) { sort.running = false; return; } // toggles to pause
    if (sort.finished) shuffle();
    sort.running = true;
    const my = ++token;
    while (sort.running && my === token) {
      if (!tick()) break;
      await sleep(delay());
    }
  }
  function stepOnce() { if (sort.running) sort.running = false; if (sort.finished) shuffle(); tick(); }
  const barClass = (i) => (sort.finished || sort.sorted.includes(i) ? "sorted" : sort.swp.includes(i) ? "swap" : sort.cmp.includes(i) ? "cmp" : "");
  const resetSort = () => shuffle();

  /* ---------- search comparison ---------- */
  const uniqueSorted = (n) => { const s = new Set(); while (s.size < n) s.add(1 + Math.floor(Math.random() * 99)); return [...s].sort((a, b) => a - b); };
  const srch = reactive({ arr: uniqueSorted(16), target: "", cur: -1, lo: -1, hi: -1, checked: [], found: -1, steps: 0, msg: "", mode: "", running: false });
  let stok = 0;
  function clearSearch() { stok++; Object.assign(srch, { cur: -1, lo: -1, hi: -1, checked: [], found: -1, steps: 0, msg: "", mode: "", running: false }); }
  function newSearchArray() { clearSearch(); srch.arr = uniqueSorted(16); srch.target = ""; }
  function pickTarget() { clearSearch(); srch.target = String(srch.arr[Math.floor(Math.random() * srch.arr.length)]); }
  async function runSearch(mode) {
    const t = parseInt(srch.target, 10);
    if (Number.isNaN(t)) { srch.msg = "Enter a number to look for (or press Pick a value)."; return; }
    clearSearch(); srch.mode = mode; srch.running = true;
    const my = stok, a = srch.arr, wait = 520;
    const done = (msg) => { if (my !== stok) return; srch.cur = -1; srch.msg = msg; srch.running = false; };
    if (mode === "linear") {
      for (let i = 0; i < a.length; i++) {
        if (my !== stok) return;
        srch.cur = i; srch.steps++; await sleep(wait / 2);
        if (a[i] === t) { srch.found = i; return done(`Found ${t} at index ${i} after ${srch.steps} check${srch.steps > 1 ? "s" : ""}.`); }
        srch.checked.push(i);
      }
      return done(`${t} is not in the array (${srch.steps} checks, the whole list).`);
    }
    let lo = 0, hi = a.length - 1;
    while (lo <= hi) {
      if (my !== stok) return;
      const mid = (lo + hi) >> 1;
      Object.assign(srch, { lo, hi, cur: mid }); srch.steps++; await sleep(wait * 1.6);
      if (a[mid] === t) { srch.found = mid; return done(`Found ${t} at index ${mid} after ${srch.steps} check${srch.steps > 1 ? "s" : ""}.`); }
      if (a[mid] < t) lo = mid + 1; else hi = mid - 1;
    }
    Object.assign(srch, { lo, hi });
    done(`${t} is not in the array (${srch.steps} checks, halving each time).`);
  }
  const cellClass = (i) => ({
    found: srch.found === i,
    cur: srch.cur === i && srch.found !== i,
    checked: srch.checked.includes(i),
    dim: srch.mode === "binary" && srch.lo !== -1 && (i < srch.lo || i > srch.hi),
  });

  /* ---------- stack & queue ---------- */
  const CAP = 8;
  const ds = reactive({ stack: [], queue: [], val: "", msg: "Try push / pop and enqueue / dequeue." });
  const nextVal = () => { const v = ds.val.trim() !== "" ? ds.val.trim().slice(0, 4) : String(1 + Math.floor(Math.random() * 99)); ds.val = ""; return v; };
  const push = () => { if (ds.stack.length >= CAP) return (ds.msg = "Stack overflow: it's full."); const v = nextVal(); ds.stack.push(v); ds.msg = `push(${v}): O(1)`; };
  const pop = () => { if (!ds.stack.length) return (ds.msg = "Stack underflow: it's empty."); ds.msg = `pop() → ${ds.stack.pop()}: O(1), last in, first out`; };
  const enqueue = () => { if (ds.queue.length >= CAP) return (ds.msg = "Queue is full."); const v = nextVal(); ds.queue.push(v); ds.msg = `enqueue(${v}): O(1)`; };
  const dequeue = () => { if (!ds.queue.length) return (ds.msg = "Queue is empty."); ds.msg = `dequeue() → ${ds.queue.shift()}: first in, first out`; };

  return { lab, sort, algoList, algoInfo, play, stepOnce, resetSort, barClass, srch, runSearch, clearSearch, newSearchArray, pickTarget, cellClass, ds, push, pop, enqueue, dequeue, CAP };
};
