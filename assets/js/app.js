const { createApp, ref, reactive, computed, onMounted, onBeforeUnmount } = Vue;

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const app = createApp({
  setup() {
    const c = window.PORTFOLIO;
    const dsa = window.createDsa(Vue);
    const programs = window.PROGRAMS || [];
    const dark = ref(document.documentElement.classList.contains("dark"));
    const open = ref(0);
    const active = ref("top");
    const status = ref("idle"); // idle | sending | ok | error
    const feedback = ref("");
    const form = reactive({ name: "", email: "", message: "", website: "" });
    const bar = ref(null);


    const testimonials = (c.testimonials || []).filter((q) => q.approved === true);
    const nav = [
      { id: "about", label: "About" },
      { id: "skills", label: "Skills" },
      { id: "projects", label: "Projects" },
      { id: "playground", label: "Playground" },
      { id: "credentials", label: "Credentials" },
      ...(testimonials.length ? [{ id: "testimonials", label: "Testimonials" }] : []),
      { id: "contact", label: "Contact" },
    ];

    const initials = computed(() =>
      c.name.replace(/[\[\]]/g, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toLowerCase() || "me"
    );
    const firstName = computed(() => c.name.replace(/[\[\]]/g, "").split(/\s+/)[0]);

    // Terminal lines typed out in the hero.
    const termLines = computed(() => [
      { cmd: "whoami", out: c.name.replace(/[\[\]]/g, "") },
      { cmd: "cat role.txt", out: "full-stack dev · security mindset" },
      { cmd: "ls stack/", out: c.skills.map((g) => g.group.split(" ")[0].toLowerCase()).join("  ") },
      { cmd: "echo $STATUS", out: c.openTo.toLowerCase() },
    ]);
    const typed = ref([]); // [{cmd, out}] progressively filled
    const typingCmd = ref("");
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    function runTerminal() {
      const lines = termLines.value;
      if (reduceMotion) { typed.value = lines.map((l) => ({ ...l })); return; }
      let i = 0;
      const next = () => {
        if (i >= lines.length) { typingCmd.value = ""; return; }
        const l = lines[i];
        let n = 0;
        const typeCmd = () => {
          typingCmd.value = l.cmd.slice(0, ++n);
          if (n < l.cmd.length) return later(typeCmd, 45 + Math.random() * 40);
          later(() => { typed.value.push({ ...l }); typingCmd.value = ""; i++; later(next, 260); }, 280);
        };
        typeCmd();
      };
      later(next, 500);
    }

    function toggleTheme() {
      dark.value = !dark.value;
      document.documentElement.classList.toggle("dark", dark.value);
      try { localStorage.setItem("theme", dark.value ? "dark" : "light"); } catch (e) {}
    }

    function glow(e) {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--mx", e.clientX - r.left + "px");
      e.currentTarget.style.setProperty("--my", e.clientY - r.top + "px");
    }

    function onScroll() {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (bar.value) bar.value.style.transform = "scaleX(" + p + ")";
    }

    let spy;
    onMounted(() => {
      runTerminal();
      onScroll();
      addEventListener("scroll", onScroll, { passive: true });
      spy = new IntersectionObserver(
        (es) => es.forEach((e) => e.isIntersecting && (active.value = e.target.id)),
        { rootMargin: "-40% 0px -55% 0px" }
      );
      ["top", ...nav.map((n) => n.id)].forEach((id) => { const el = document.getElementById(id); el && spy.observe(el); });
    });
    onBeforeUnmount(() => { timers.forEach(clearTimeout); removeEventListener("scroll", onScroll); spy && spy.disconnect(); });

    let tokenReq = null, tokenAt = 0;
    function loadToken() {
      tokenAt = performance.now();
      tokenReq = fetch("api/contact.php", { credentials: "same-origin" }).then((r) => r.json());
      return tokenReq;
    }
    function warmToken() { if (!tokenReq) loadToken(); }

    async function send() {
      feedback.value = "";
      if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.length < 10) {
        status.value = "error";
        feedback.value = "Please enter your name, a valid email and a message (10+ characters).";
        return;
      }
      status.value = "sending";
      try {
        // One-time CSRF token bound to this session (fetched when the form was first focused).
        const t = await (tokenReq || loadToken());
        tokenReq = null; // single-use: fetch a fresh one next time
        // Server enforces a minimum fill time; wait out the remainder so fast fillers aren't rejected.
        const wait = Math.max(0, 3300 - (performance.now() - tokenAt));
        if (wait) await new Promise((r) => setTimeout(r, wait));
        const body = new URLSearchParams({ ...form, csrf: t.csrf, ts: t.ts });
        const res = await fetch("api/contact.php", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
        status.value = "ok";
        feedback.value = "Thanks! Your message was sent.";
        Object.assign(form, { name: "", email: "", message: "", website: "" });
      } catch (e) {
        status.value = "error";
        feedback.value = e.message || "Could not send. Please email me directly.";
      }
    }

    return { ...dsa, programs, testimonials, c, dark, open, active, nav, initials, firstName, form, status, feedback, bar, typed, typingCmd, toggleTheme, glow, send, warmToken, year: new Date().getFullYear() };
  },
});

// v-reveal: fade/slide elements in as they enter the viewport (optional stagger: v-reveal="120").
const io = "IntersectionObserver" in window && !reduceMotion
  ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 })
  : null;
app.directive("reveal", {
  mounted(el, { value }) {
    if (!io) return;
    el.classList.add("reveal");
    if (value) el.style.setProperty("--d", value + "ms");
    io.observe(el);
  },
});

app.mount("#app");
