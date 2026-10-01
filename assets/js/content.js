/*
 * All portfolio content lives here. Edit this file only; the page renders from it.
 * Anything wrapped in [BRACKETS] is a placeholder: replace it with the real thing.
 * Optional fields (resume, links.linkedin, links.tryhackme, and per-project demo, repo and image, and cert url)
 * can simply be added when you have them; anything missing is hidden automatically.
 */
window.PORTFOLIO = {
  name: "Ian Reyes",
  headline: "Full-stack developer (PHP, JavaScript, Java) with a security mindset",
  subhead:
    "I build secure, maintainable web apps, and I'm going deeper into networking and cybersecurity. Open to cybersecurity or software engineering internships / OJT.",
  location: "Dasmariñas, Cavite",
  openTo: "Open to internships / OJT",
  email: "reyesian119@gmail.com",
  resume: "", // set to "assets/resume.pdf" once the PDF is added; the button appears automatically
  links: {
    github: "https://github.com/reyes-ian",
    linkedin: "",
    tryhackme: "",
  },

  about: [
    "I'm a 3rd-year IT student at NCST. I started in web development, and I'm now going deeper into networking and cybersecurity. That focus shapes how I code: I think about authentication, input handling and what an attacker sees before a feature ships.",
    "I chose IT because the world around us is now built on technology and shaped by globalization. People, businesses and whole countries depend on software and networks every day, and I want to be one of the people who build those systems and keep them reliable and safe.",
    "From here I want to go deeper into cybersecurity and networking. I'm looking for an internship or OJT in cybersecurity or software engineering, where I can learn from a team on real systems.",
  ],
  learning: ["Linux", "Networking", "Cybersecurity"],
  lookingFor: ["Cybersecurity internship", "Software engineering internship"],
  strengths: [
    "Secure authentication and session handling",
    "SQL injection / XSS / CSRF prevention",
    "Network setup and traffic analysis",
    "Clean, documented, reviewable code",
  ],

  education: [
    {
      school: "NCST, National College of Science and Technology",
      degree: "Bachelor of Science in Information Technology",
      period: "2024 – Present",
      note: "Currently a 3rd-year student. Focus: web development, networking and information security.",
      highlights: [],
    },
    {
      school: "Emmanuel Resurrection Congressional Integrated High School",
      degree: "Senior High School, STEM Strand",
      period: "Batch 2023 – 2024",
      note: "Graduated with honors.",
      highlights: [],
    },
  ],

  // Teammate testimonials. A quote only appears on the page when approved is true, i.e. once the person
  // has seen the wording and agreed to it. All three below are confirmed.
  testimonials: [
    {
      name: "Lino Dela Cruz",
      role: "Teammate on Lampara and the School Administration System",
      quote: "Ian always knows our code bases well. He can explain how the different parts fit together, and he documents what he builds, so the rest of us can pick up his work without guessing. That made working with him on Lampara and the school system much smoother.",
      approved: true, // confirmed by Lino
    },
    {
      name: "Frank Malbog",
      role: "Teammate on Lampara and the School Administration System",
      quote: "Ian keeps bringing new ideas to our projects and turns them into strong, working features. On the school system he added a whole new part, the admin monitoring, and on Lampara he rebuilt the admin panel and added the AR arrow.",
      approved: true, // confirmed by Frank
    },
    {
      name: "Ann Lubo",
      role: "Teammate on Lampara and the School Administration System",
      quote: "Whenever the team needed to catch up, Ian gave quick, clear updates and explained how the code base and our process worked, without making it complicated. It made it easy to know where things stood and what to do next.",
      approved: true, // confirmed by Ann
    },
  ],

  skills: [
    {
      group: "Networking & security",
      featured: true, // rendered as the full-width highlight card
      icon: "sec",
      blurb: "Where I'm growing: networking and security, which I already apply in my projects with two-factor login, CSRF protection and rate limiting.",
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
      title: "Lampara: AR campus wayfinding",
      kind: "Team project · Web app",
      featured: true,
      team: ["Frank Malbog", "Lino Dela Cruz", "Ann Lubo"],
      summary: "A phone-first campus guide. Point your phone to get an AR arrow to a building, scan or search a room, and follow a route floor by floor, with an AI assistant that answers from the campus directory.",
      problem: "New students and visitors lose time finding buildings, then rooms. Printed maps don't say which way to turn, and GPS stops working indoors.",
      role: "One of the four programmers, working with Frank Malbog, Lino Dela Cruz and Ann Lubo. I redesigned the white-and-green look, rebuilt the admin panel (dashboard, buildings, rooms and login), added the camera and location toggles, and built the AR arrow.",
      stack: ["PHP", "MySQL", "Vue 3", "A-Frame + AR.js", "Leaflet", "Gemini API", "Service Worker"],
      why: "Admins describe the campus as a network of walkable paths. The phone finds your place on it and shows the way in AR, and the assistant answers from the same records. PHP and MySQL serve the data, Vue 3 builds the interface, A-Frame with AR.js draws the arrow and ground path over the camera, and a service worker keeps it working with no signal.",
      challenges: [
        "Routing: positions snap to the nearest drawn walkway, then Dijkstra finds the shortest path. A floor change costs a flat amount, so routes never go up and back for nothing.",
        "Indoor position without GPS: scan a room sign, then count steps and read the compass, aligned to each floor plan by an admin calibration, with buttons to correct drift.",
        "Offline use: students keep working from a cached copy. Admins queue edits on their device and sync them after approval, with conflicts reported and no change ever applied twice.",
        "Security by design: only signed-in admins can write, queries use prepared statements, admin passwords are hashed, students have no accounts and aren't tracked, and the AI key stays on the server.",
      ],
      backend: [
        "Offline sync API: applies up to 300 queued admin changes in order, each under its own savepoint so one failure never undoes the rest. Every applied change id is remembered, so a retry after a dropped connection can't create duplicates, and records created offline get temporary ids that are resolved to real ones.",
        "Conflict detection: an update carries the version the admin saw offline. If the row changed on the server since, it comes back as a conflict with the server's current values instead of being silently overwritten.",
        "Grounded AI chat: the server pulls a building's registered facts from MySQL and Gemini answers only from those, turning down off-topic questions. The API key never leaves the server.",
        "Rate limiting without a database: a small per-visitor throttle replies with HTTP 429 and a Retry-After header, protecting the paid AI endpoints and the admin login. The limits are loose enough for a whole class on one school Wi-Fi.",
        "One graph model for routing: outdoor walkways are stored as GPS nodes and edges, indoor paths as percentage positions on each floor plan, and stairs as edges that link two plans, all feeding the same shortest-path search.",
        "Room-number rules kept identical in PHP and JavaScript: input like 1112-a is normalized to 1112 - A and checked for duplicates.",
        "A setup-audit script (php Backend/scripts/setup-audit.php) that inspects the database and lists what is still missing before the AR guide can work.",
      ],
      features: ["Outdoor AR guide", "Indoor AR arrow", "Room scan & search", "Admin panel", "Offline mode & sync", "Door-sign reading (Gemini)", "Ask Lampara chat"],
      status: "Covered by 228 automated browser checks across 9 suites (offline sync, walking, room numbers and more). The AI features (sign reading and the chat) need a Gemini key and were not part of those tests. Testing the compass, step counting and GPS drift on real phones is still planned.",
      gallery: [
        { kind: "phone", src: "assets/img/lampara/student-home.jpg", alt: "Lampara home screen on a phone with three feature cards", caption: "Student home" },
        { kind: "phone", src: "assets/img/lampara/student-outdoor-guide.jpg", alt: "Outdoor AR guide with a turn banner and distance card", caption: "Outdoor AR guide" },
        { kind: "phone", src: "assets/img/lampara/student-floor-route.jpg", alt: "A route drawn on a floor plan with a Start AR guide button", caption: "Route on the floor plan" },
        { kind: "phone", src: "assets/img/lampara/student-indoor-ar.jpg", alt: "Indoor AR view with a turn banner, mini-map and drift adjust buttons", caption: "Indoor AR walking view" },
        { kind: "wide", src: "assets/img/lampara/admin-dashboard.jpg", alt: "Admin dashboard with directory counts and recent buildings", caption: "Admin dashboard" },
        { kind: "wide", src: "assets/img/lampara/admin-campus-paths.jpg", alt: "Campus Paths editor on a satellite map with walkway points", caption: "Drawing campus walkways" },
        { kind: "wide", src: "assets/img/lampara/admin-floor-calibration.jpg", alt: "Floor calibration with two points marked along a hallway", caption: "Floor calibration" },
      ],
      repo: "https://github.com/linovvin-sys/Lampara",
    },
    {
      title: "School Administration System with LMS",
      kind: "Team project · Web app",
      featured: true,
      team: ["Frank Malbog", "Lino Dela Cruz", "Ann Lubo"],
      summary: "One system for running a school: online admission, enrollment, payments and class scheduling, plus an LMS where professors post assignments, materials and announcements and students submit work and track their grades. Each role gets its own portal, and a built-in assistant answers questions about that role's own figures.",
      problem: "Admission, enrollment, payments, scheduling and classroom work usually live in separate tools and offices, and each office needs its own view and its own permissions.",
      role: "Full-stack developer, in a team of four with Frank Malbog, Lino Dela Cruz and Ann Lubo. I worked on both the interface and the backend: the Treasury and Registrar modules, add/drop subject, read-only monitoring for admins, the Professor portal redesign with calendar (.ics) export, session and role hardening, and the admin features.",
      stack: ["PHP", "MySQL", "JavaScript", "Bootstrap 5", "PayMongo", "PHPMailer"],
      why: "Plain PHP with no framework: every page is its own file and every AJAX action is its own endpoint under Backend/api, so a request is easy to trace and there is no build step.",
      challenges: [
        "Six portals on one codebase (Admin, Admission, Treasury, Registrar, Professor, Student), each gated on the server, with Head Registrar sign-off on curriculum and schedules and read-only monitoring for admins.",
        "Enrollment rules: subject and schedule selection with prerequisite checks, irregular schedules re-validated on the server, and add/drop with fees.",
        "Online payments with PayMongo, including a bug where the session cookie was dropped on return from the payment page, fixed by changing SameSite from Strict to Lax.",
        "Security layers: CSRF tokens, rate limiting, account lockout, optional TOTP two-factor login for staff, per-tab session guard, hashed passwords, a data-privacy export for students, and a spam guard on the public admission form.",
        "LMS: professors post assignments, class materials and announcements and record attendance. Students submit files, and scores roll up into weighted grade categories for each grading period.",
      ],
      features: ["Online admission", "Enrollment & add/drop", "Online payments", "Class scheduling", "Assignments & submissions", "Class materials", "Attendance & weighted grades", "Staff messaging", "Two-factor login", "Role-aware assistant (Dotty)"],
      status: "All six portals work. A self-audit logged 30 findings, and the critical and high-severity ones are fixed. Automated tests and a database schema file are still to do.",
      gallery: [
        { kind: "wide", src: "assets/img/sia/landing-page.jpg", alt: "Public landing page with an Apply Now button and admissions information", caption: "Public admissions page" },
        { kind: "wide", src: "assets/img/sia/admin-dashboard.jpg", alt: "Admin dashboard with student counts, an admissions trend chart and a status breakdown", caption: "Admin dashboard" },
        { kind: "wide", src: "assets/img/sia/dotty-assistant.jpg", alt: "Dotty, the in-app assistant, open over the admin dashboard", caption: "Dotty, the role-aware assistant" },
        { kind: "wide", src: "assets/img/sia/professor-home.jpg", alt: "Professor portal home with next class, active offerings and quick actions for the LMS", caption: "Professor portal (LMS)" },
      ],
      repo: "https://github.com/linovvin-sys/SIAdrafts",
    },
    {
      title: "ParkQueue: Parking Monitoring System",
      kind: "Team project · Desktop app · Java (NetBeans)",
      team: ["Frank Malbog", "Lino Dela Cruz", "Yohanz Glorioso", "Benedict Almario"],
      summary: "A Java desktop app for running a multi-floor parking facility. Staff log vehicles in and out, watch a live grid of slots by floor, take cash or GCash payments with tickets and reference numbers, and read reports, while admins manage staff and review system logs.",
      problem: "Running a parking lot on paper makes it hard to know which slots are free, how long each vehicle has stayed and what to charge, and there is no record of who did what.",
      role: "Backend programmer, in a team of five with Frank Malbog, Lino Dela Cruz, Yohanz Glorioso and Benedict Almario. I built the backend: the models and the MySQL data-access classes behind parking slots, vehicles, parking sessions and the dashboard figures.",
      stack: ["Java", "Swing", "NetBeans GUI Builder", "JDBC", "MySQL", "JavaMail"],
      why: "A desktop app suits a front desk that works from one counter. The screens were laid out with the NetBeans drag-and-drop GUI Builder, and the logic sits in separate classes so the interface and the backend could be built side by side. MySQL, reached over JDBC, stores slots, sessions and payments, and JavaMail sends password-reset codes.",
      challenges: [
        "A layered backend: models describe slots, vehicles, sessions, users and payments, DAO interfaces with JDBC implementations run the SQL, and controllers and small services connect them to the screens. That split let a team of five work at once on about 14,000 lines of Java.",
        "Slot data that drives the live grid: each slot has a floor, a type (PWD, VIP, motorcycle or car), a status and an hourly rate, queried so staff can see availability by floor at a glance and pick a slot when a vehicle enters.",
        "Fees and tickets: the fee is worked out in the database from the minutes parked times the slot's hourly rate. Each exit gets a ticket code that is validated at the gate, and each payment gets a unique reference number, whether it is cash or GCash.",
        "Accounts and accountability: registration generates a staff code, sign-in sessions are saved to the database, password reset sends a time-limited code by email, passwords are hashed, and a system log lets admins review activity.",
        "A drag-and-drop interface built as a team: 21 screens in the NetBeans GUI Builder, including login, password reset, the staff dashboard, live parking, entry and exit, payments, reports and the admin pages, with reusable dialogs for entry, exit, slot selection, ticket validation and payment.",
      ],
      features: ["Vehicle entry & exit", "Live slot grid by floor", "Cash & GCash payments", "Ticket validation", "Reports", "Staff & admin portals", "Password reset by email", "System logs"],
      status: "Working app of about 14,000 lines across 68 Java files. Next step: replace the plain SHA-256 password hashing with a salted algorithm such as bcrypt or PBKDF2.",
      gallery: [
        { kind: "wide", src: "assets/img/parkqueue/live-parking.jpg", alt: "Live Parking Monitoring screen with a grid of slots by floor, each marked available and typed PWD, VIP, motorcycle or car", caption: "Live parking grid" },
        { kind: "wide", src: "assets/img/parkqueue/entry-exit-monitoring.jpg", alt: "Vehicle Entry and Exit Monitoring screen with totals for vehicles served and revenue, and tables of entries and outgoing vehicles", caption: "Entry & exit monitoring" },
      ],
    },
  ],

  credentials: {
    certs: [
      { name: "Introduction to CSS", issuer: "SoloLearn", year: "Mar 2025", image: "assets/img/certs/sololearn-css.jpg" },
      { name: "Introduction to HTML", issuer: "SoloLearn", year: "Feb 2025", image: "assets/img/certs/sololearn-html.jpg" },
    ],
    experience: [],
  },
};
