/*
 * All portfolio content lives here. Edit this file only; the page renders from it.
 * Anything wrapped in [BRACKETS] is a placeholder: replace it with the real thing.
 * Empty links ("") are hidden automatically, so leave them blank until you have them.
 */
window.PORTFOLIO = {
  name: "Ian Reyes",
  headline: "Full-stack web developer (Laravel + Vue) with a security mindset",
  subhead:
    "I build secure, maintainable web apps, and I understand the network and the attack surface they run on. Open to internships / OJT.",
  location: "Dasmariñas, Cavite",
  openTo: "Open to internships / OJT",
  email: "reyesian119@gmail.com",
  resume: "assets/resume.pdf", // drop your PDF at this path
  links: {
    github: "https://github.com/reyes-ian",
    linkedin: "",
    tryhackme: "",
  },

  about: [
    "I'm a 3rd-year IT student who came to web development from networking and cybersecurity. That route shapes how I code: I think about authentication, input handling and what an attacker sees before a feature ships.",
    "I'm looking for an internship or OJT where I can work on real products, learn from a team, and bring a security-first habit to everyday development.",
  ],
  strengths: [
    "Secure authentication and session handling",
    "SQL injection / XSS / CSRF prevention",
    "Network setup and traffic analysis",
    "Clean, documented, reviewable code",
  ],

  education: [
    {
      school: "[University / college name]",
      degree: "Bachelor of Science in Information Technology",
      period: "[20XX] – Present",
      note: "Currently a 3rd-year student. Focus: web development, networking and information security.",
      highlights: ["[Relevant coursework, e.g. Networking]", "[Data Structures & Algorithms]", "[Information Assurance & Security]", "[Web Systems]"],
    },
    {
      school: "[Senior high school name]",
      degree: "[Track / strand]",
      period: "[20XX] – [20XX]",
      note: "",
      highlights: [],
    },
  ],

  skills: [
    {
      group: "Networking & security",
      featured: true, // rendered as the full-width highlight card
      icon: "sec",
      blurb: "Where I stand out: I know how the network works and how it gets attacked, so I build with that in mind.",
      // Keep only what you can talk about in an interview.
      items: ["Cisco Packet Tracer", "Nmap", "Ubuntu", "Firewall configuration"],
    },
    { group: "Frontend", icon: "</>", items: ["Vue", "Vanilla JS", "jQuery", "Tailwind CSS", "Bootstrap", "HTML5 / CSS3"] },
    { group: "Backend", icon: "{ }", items: ["Laravel", "PHP", "SQL (MySQL)", "REST APIs"] },
    { group: "Other languages", icon: "py", items: ["Python", "Java", "C++"] },
    { group: "Tools", icon: "dev", items: ["Git & GitHub", "XAMPP", "VS Code", "Oracle VM", "NetBeans", "Code::Blocks", "PyCharm"] },
  ],

  /*
   * 3-5 projects. Suggested mix: one flagship full-stack app, one security project,
   * one Python/Java side project, plus smaller older work.
   * Fields: title, kind, summary, problem, role, stack[], why, challenges[],
   *         image (path or ""), demo (url), repo (url), featured (bool)
   */
  projects: [
    {
      title: "[Flagship: Laravel + Vue + Tailwind app]",
      kind: "Full-stack web app",
      featured: true,
      summary: "[One line: what it is and who used it, e.g. a capstone enrollment / inventory / booking system.]",
      problem: "[Who had what problem? e.g. the school office tracked enrollment on paper and spreadsheets.]",
      role: "[Solo / Team of N. What you personally built.]",
      stack: ["Laravel", "Vue", "Tailwind CSS", "MySQL"],
      why: "[Why this stack: e.g. Laravel for auth + policies, Vue for a responsive admin UI.]",
      challenges: [
        "[Challenge 1 and how you solved it: e.g. role-based access (admin / staff / student) using policies and middleware.]",
        "[Challenge 2: e.g. fast search and pagination over a large table.]",
      ],
      features: ["Authentication", "Role-based access", "CRUD", "Search", "REST API"],
      image: "",
      demo: "",
      repo: "",
    },
    {
      title: "[Security: hardened app / lab writeup / CTF]",
      kind: "Security project",
      featured: true,
      summary: "[e.g. Scanned a deliberately vulnerable lab, documented findings, then hardened my own app.]",
      problem: "[What were you trying to prove or protect?]",
      role: "[Solo / Team]",
      stack: ["Ubuntu", "Nmap", "PHP"],
      why: "[Why these tools and methods.]",
      challenges: [
        "[e.g. Found SQL injection in login; fixed with prepared statements and verified the fix.]",
        "[e.g. Added CSRF tokens, input validation, rate limiting and password hashing.]",
      ],
      features: ["Prepared statements", "CSRF protection", "Rate limiting", "Hashed passwords"],
      image: "",
      demo: "",
      repo: "",
    },
    {
      title: "[Python / Java side project]",
      kind: "Automation / tooling",
      summary: "[e.g. A log analyzer, CLI tool or small desktop app, and what it saves you.]",
      problem: "[The repetitive or unclear task it solves.]",
      role: "Solo",
      stack: ["Python"],
      why: "[Why Python/Java here.]",
      challenges: ["[One interesting problem you solved.]"],
      features: [],
      image: "",
      demo: "",
      repo: "",
    },
    {
      title: "[Earlier jQuery / AJAX / Bootstrap work]",
      kind: "Front-end",
      summary: "[A smaller entry that shows something interesting, e.g. AJAX live search, form validation.]",
      problem: "",
      role: "[Solo / Team]",
      stack: ["jQuery", "AJAX", "Bootstrap"],
      why: "",
      challenges: [],
      features: [],
      image: "",
      demo: "",
      repo: "",
    },
  ],

  credentials: {
    certs: [
      // { name: "CCNA: Introduction to Networks", issuer: "Cisco Networking Academy", year: "2025", url: "" },
      { name: "[Certification or course]", issuer: "[Issuer]", year: "[Year]", url: "" },
    ],
    experience: [
      // { role: "OJT Trainee", org: "Company", period: "2026", note: "What you did." },
      { role: "[OJT / org role / hackathon]", org: "[Organization]", period: "[Period]", note: "[One line on what you did.]" },
    ],
  },
};
