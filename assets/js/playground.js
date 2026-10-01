/*
 * Code playground.
 *  - HTML/CSS/JS : rendered live in a sandboxed iframe (no same-origin access).
 *  - JavaScript  : runs in a Web Worker (no DOM, killed after a timeout).
 *  - Everything else (Java, Python, C, C++, ...): sent through api/run.php to a Judge0 sandbox.
 * Visitor code never runs on the portfolio's own server.
 */
window.createPlayground = function (Vue) {
  const { reactive, computed } = Vue;

  const LANGS = [
    { id: "html",       label: "HTML / CSS / JS", mode: "browser" },
    { id: "javascript", label: "JavaScript",      mode: "worker" },
    { id: "java",       label: "Java",            mode: "remote" },
    { id: "python",     label: "Python",          mode: "remote" },
    { id: "c",          label: "C",               mode: "remote" },
    { id: "cpp",        label: "C++",             mode: "remote" },
    { id: "php",        label: "PHP",             mode: "remote" },
    { id: "csharp",     label: "C#",              mode: "remote" },
    { id: "go",         label: "Go",              mode: "remote" },
    { id: "rust",       label: "Rust",            mode: "remote" },
    { id: "ruby",       label: "Ruby",            mode: "remote" },
    { id: "kotlin",     label: "Kotlin",          mode: "remote" },
    { id: "typescript", label: "TypeScript",      mode: "remote" },
    { id: "bash",       label: "Bash",            mode: "remote" },
    { id: "sql",        label: "SQL (SQLite)",    mode: "remote" },
  ];

  const STARTERS = {
    html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: system-ui; display: grid; place-items: center; height: 100vh; margin: 0; background: #0b1220; color: #e6edf7; }
  button { padding: .6rem 1.2rem; border: 0; border-radius: .6rem; background: #34d399; font-weight: 700; cursor: pointer; }
</style>
</head>
<body>
  <div style="text-align:center">
    <h1 id="msg">Hello, world!</h1>
    <button onclick="count()">Clicked 0 times</button>
  </div>
<script>
  let n = 0;
  function count() {
    n++;
    document.querySelector('button').textContent = 'Clicked ' + n + ' times';
  }
<\/script>
</body>
</html>`,
    javascript: `// Runs in a Web Worker. Try console.log!
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
for (let i = 0; i <= 10; i++) console.log("fib(" + i + ") =", fib(i));`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String name = in.hasNextLine() ? in.nextLine() : "world";
        System.out.println("Hello, " + name + "!");

        int[] data = {5, 3, 8, 1, 9, 2};
        Arrays.sort(data);
        System.out.println("Sorted: " + Arrays.toString(data));
    }
}`,
    python: `try:
    name = input()
except EOFError:  # nothing typed in the stdin box
    name = ""
print(f"Hello, {name or 'world'}!")

def fizzbuzz(n):
    return "FizzBuzz" if n % 15 == 0 else "Fizz" if n % 3 == 0 else "Buzz" if n % 5 == 0 else str(n)

print(", ".join(fizzbuzz(i) for i in range(1, 16)))`,
    c: `#include <stdio.h>

int main(void) {
    int total = 0;
    for (int i = 1; i <= 10; i++) total += i;
    printf("Sum of 1..10 = %d\\n", total);
    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v{5, 3, 8, 1, 9, 2};
    std::sort(v.begin(), v.end());
    for (int x : v) std::cout << x << ' ';
    std::cout << "\\n";
}`,
    php: `<?php
$items = ["Laravel", "Vue", "Tailwind"];
foreach ($items as $i => $item) {
    echo ($i + 1) . ". " . $item . PHP_EOL;
}`,
    csharp: `using System;

class Program {
    static void Main() {
        for (int i = 1; i <= 5; i++)
            Console.WriteLine($"Square of {i} is {i * i}");
    }
}`,
    go: `package main

import "fmt"

func main() {
    for i := 1; i <= 5; i++ {
        fmt.Println("Cube of", i, "is", i*i*i)
    }
}`,
    rust: `fn main() {
    let v: Vec<u32> = (1..=5).map(|x| x * x).collect();
    println!("Squares: {:?}", v);
}`,
    ruby: `5.times { |i| puts "Line #{i + 1}" }`,
    kotlin: `fun main() {
    val langs = listOf("Kotlin", "Java", "Python")
    langs.forEachIndexed { i, l -> println("\${i + 1}. $l") }
}`,
    typescript: `const greet = (name: string): string => \`Hello, \${name}!\`;
console.log(greet("TypeScript"));`,
    bash: `for i in 1 2 3; do
  echo "Step $i"
done`,
    sql: `CREATE TABLE skills (name TEXT, level INTEGER);
INSERT INTO skills VALUES ('Laravel', 3), ('Vue', 3), ('Nmap', 2);
SELECT name, level FROM skills ORDER BY level DESC, name;`,
  };

  const pg = reactive({
    lang: "java",
    codes: Object.assign({}, STARTERS),
    stdin: "",
    running: false,
    preview: STARTERS.html,
    out: null, // { stdout, stderr, compile, message, status, time, ok }
    error: "",
    csrf: "",
  });

  const current = computed(() => LANGS.find((l) => l.id === pg.lang));
  const lineNumbers = computed(() => {
    const n = (pg.codes[pg.lang] || "").split("\n").length;
    return Array.from({ length: n }, (_, i) => i + 1).join("\n");
  });

  let debounce = 0, worker = null, escapeArmed = false;

  function onInput() {
    if (pg.lang !== "html") return;
    clearTimeout(debounce);
    debounce = setTimeout(() => (pg.preview = pg.codes.html), 450);
  }
  function setLang() { pg.out = null; pg.error = ""; stopWorker(); if (pg.lang === "html") pg.preview = pg.codes.html; }
  function reset() { pg.codes[pg.lang] = STARTERS[pg.lang]; pg.out = null; pg.error = ""; if (pg.lang === "html") pg.preview = STARTERS.html; }

  function onKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); return; }
    if (e.key === "Escape") { escapeArmed = true; return; } // Esc then Tab leaves the editor (keyboard accessibility)
    if (e.key === "Tab" && !e.shiftKey) {
      if (escapeArmed) { escapeArmed = false; return; }
      e.preventDefault();
      const t = e.target, s = t.selectionStart;
      t.setRangeText("    ", s, t.selectionEnd, "end");
      pg.codes[pg.lang] = t.value;
    } else escapeArmed = false;
  }
  const syncGutter = (e) => { const g = e.target.parentElement.querySelector(".gutter"); if (g) g.scrollTop = e.target.scrollTop; };

  function stopWorker() { if (worker) { worker.terminate(); worker = null; } }

  function runWorker(code) {
    return new Promise((resolve) => {
      stopWorker();
      const out = { stdout: "", stderr: "", compile: "", message: "", status: "Finished", time: null, ok: true };
      const prelude = `const __p=(t,v)=>postMessage({t,v});
const __f=a=>a.map(x=>{try{return typeof x==='string'?x:JSON.stringify(x)}catch(e){return String(x)}}).join(' ');
console.log=console.info=console.debug=(...a)=>__p('out',__f(a));
console.warn=console.error=(...a)=>__p('err',__f(a));
self.onerror=(m)=>{__p('err',String(m));__p('done');return true};
`;
      const src = prelude + "try {\n" + code + "\n} catch (e) { __p('err', String(e && e.stack || e)); }\n__p('done');";
      const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
      const t0 = performance.now();
      let settle = 0;
      const finish = (status) => {
        clearTimeout(settle); clearTimeout(hard);
        stopWorker(); URL.revokeObjectURL(url);
        out.time = ((performance.now() - t0) / 1000).toFixed(3);
        if (status) { out.status = status; out.ok = false; }
        resolve(out);
      };
      const hard = setTimeout(() => finish("Timed out after 5 s (stopped)"), 5000);
      worker = new Worker(url);
      worker.onmessage = (e) => {
        const { t, v } = e.data;
        if (t === "out") out.stdout += v + "\n";
        else if (t === "err") out.stderr += v + "\n";
        clearTimeout(settle);
        // After the synchronous part finishes, give timers/promises a moment to print, then stop.
        if (t === "done") settle = setTimeout(() => finish(), 800);
      };
      worker.onerror = (e) => { out.stderr += (e.message || "Script error") + "\n"; finish(); };
    });
  }

  async function ensureToken() {
    if (pg.csrf) return;
    const r = await fetch("api/run.php", { credentials: "same-origin" });
    const j = await r.json();
    if (!j.enabled) throw new Error("The code runner is turned off on this site.");
    pg.csrf = j.csrf;
  }

  async function runRemote(code) {
    await ensureToken();
    const body = new URLSearchParams({ csrf: pg.csrf, lang: pg.lang, code, stdin: pg.stdin });
    const res = await fetch("api/run.php", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
    const j = await res.json().catch(() => ({}));
    if (res.status === 403) pg.csrf = ""; // token expired; next click refetches
    if (!res.ok || !j.ok) throw new Error(j.error || "Could not run your code.");
    return { ...j, ok: j.statusId === 3 };
  }

  async function run() {
    if (pg.running) return;
    const code = pg.codes[pg.lang] || "";
    pg.error = ""; pg.out = null;
    if (current.value.mode === "browser") { pg.preview = code; return; }
    pg.running = true;
    try {
      pg.out = current.value.mode === "worker" ? await runWorker(code) : await runRemote(code);
    } catch (e) {
      pg.error = e.message || "Something went wrong.";
    } finally {
      pg.running = false;
    }
  }

  return { pg, LANGS, pgCurrent: current, lineNumbers, pgRun: run, pgReset: reset, pgSetLang: setLang, pgInput: onInput, pgKey: onKey, pgSync: syncGutter };
};
