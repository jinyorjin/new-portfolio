/* ============================================================
   EUNJIN KIM — PORTFOLIO SCRIPT
   Firebase · Leaflet · Navigation · Galaxy Animations
   ============================================================ */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ============================================================
// FIREBASE CONFIG
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDV_T31W-_FV95paA6v9tICDLjtU4qO2zY",
  authDomain: "qrportfolio-dca92.firebaseapp.com",
  projectId: "qrportfolio-dca92",
  storageBucket: "qrportfolio-dca92.firebasestorage.app",
  messagingSenderId: "1038363567989",
  appId: "1:1038363567989:web:c6920f62ca9cdb8ccc553c",
  measurementId: "G-D63KS5JNJ7",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================================
// UTILITY: Country code → Twemoji flag SVG
// ============================================================
function countryCodeToFlagIcon(code) {
  if (!code) return "🌍";
  const cc = String(code).trim().toUpperCase();
  if (cc.length !== 2) return cc;
  const emoji = cc.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt())
  );
  return twemoji.parse(emoji, { folder: "svg", ext: ".svg" });
}

// ============================================================
// FIREBASE: Save visitor
// ============================================================
async function saveVisitor() {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (!data || data.success === false) throw new Error("Geo lookup failed");

    await db.collection("visitors").add({
      country: data.country,
      country_code: data.country_code,
      lat: data.latitude,
      lng: data.longitude,
      timestamp: new Date(),
    });
  } catch (e) {
    console.error("Error saving visitor:", e);
  }
}

// ============================================================
// FIREBASE: Load visitors & render map
// ============================================================
async function loadVisitors() {
  try {
    const snapshot = await db.collection("visitors").get();

    let total = 0;
    let today = 0;
    const todayDate = new Date().toDateString();

    snapshot.forEach((doc) => {
      const v = doc.data();
      total++;

      const ts =
        v.timestamp && typeof v.timestamp.toDate === "function"
          ? v.timestamp.toDate()
          : new Date(v.timestamp || Date.now());

      if (ts.toDateString() === todayDate) today++;

      if (v.lat && v.lng) {
        const flagIcon = countryCodeToFlagIcon(v.country_code);

        const customIcon = L.divIcon({
          className: "flag-icon",
          html: `<div style="font-size:22px; text-align:center;">${flagIcon}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.marker([v.lat, v.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align:center; font-size:14px; font-family:'Space Grotesk',sans-serif; padding:4px 6px;">
              ${flagIcon} <strong>${v.country}</strong><br/>
              <span style="font-size:12px; opacity:0.7;">${ts.toLocaleString()}</span>
            </div>
          `);
      }
    });

    // Update hero stats
    const totalEl    = document.getElementById("total-visitors");
    const todayEl    = document.getElementById("today-visitors");
    // Update map section stats
    const totalMapEl = document.getElementById("total-visitors-map");
    const todayMapEl = document.getElementById("today-visitors-map");

    if (totalEl)    totalEl.textContent    = total;
    if (todayEl)    todayEl.textContent    = today;
    if (totalMapEl) totalMapEl.textContent = total;
    if (todayMapEl) todayMapEl.textContent = today;

  } catch (e) {
    console.error("Error loading visitors:", e);
  }
}

// ============================================================
// LEAFLET MAP INIT
// ============================================================
const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// ============================================================
// VISITORS: Run on load
// ============================================================
saveVisitor().then(loadVisitors);

// ============================================================
// FOOTER YEAR
// ============================================================
const footerYear = document.getElementById("footer-year");
if (footerYear) footerYear.textContent = new Date().getFullYear();

// ============================================================
// NAVIGATION: Scrolled state + Active section highlight
// ============================================================
const nav        = document.getElementById("main-nav");
const navLinks   = document.querySelectorAll(".nav-link");
const sections   = document.querySelectorAll("section[id]");

function onScroll() {
  // Scrolled class
  if (window.scrollY > 40) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }

  // Active nav link
  let currentId = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      currentId = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentId}`) {
      link.classList.add("active");
    }
  });

  // Fade the scroll indicator out once the user leaves the hero
  const scrollIndicator = document.getElementById("scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.style.opacity = window.scrollY > 120 ? "0" : "1";
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll(); // run once on load

// ============================================================
// NAVIGATION: Mobile hamburger
// ============================================================
const hamburger  = document.getElementById("nav-hamburger");
const navLinksEl = document.getElementById("nav-links");

hamburger.addEventListener("click", () => {
  const isOpen = hamburger.classList.toggle("open");
  navLinksEl.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});

// Close menu when a link is clicked
navLinksEl.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinksEl.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

// Close menu on outside click
document.addEventListener("click", (e) => {
  if (
    navLinksEl.classList.contains("open") &&
    !navLinksEl.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    hamburger.classList.remove("open");
    navLinksEl.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
});

// ============================================================
// SCROLL REVEAL: IntersectionObserver
// ============================================================
if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
  );

  document
    .querySelectorAll(".reveal-section, .reveal-child")
    .forEach((el) => revealObserver.observe(el));
} else {
  document
    .querySelectorAll(".reveal-section, .reveal-child")
    .forEach((el) => el.classList.add("is-visible"));
}

// ============================================================
// CURSOR GLOW: Mouse follower
// ============================================================
if (!prefersReducedMotion) {
  const glowEl = document.getElementById("cursor-glow");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX  = mouseX;
  let glowY  = mouseY;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("touchstart", () => {
    if (glowEl) glowEl.style.opacity = "0";
  }, { once: true });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;

    if (glowEl) {
      glowEl.style.left = `${glowX}px`;
      glowEl.style.top  = `${glowY}px`;
    }
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

// ============================================================
// STARFIELD: JS-generated depth layers (single-div box-shadow stars)
// ============================================================
function buildStarfield(el, count, sizePx, alpha) {
  if (!el) return;
  const w = 2200;
  const h = 2200;
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(Math.random() * w);
    const y = Math.round(Math.random() * h);
    const a = (alpha - Math.random() * alpha * 0.6).toFixed(2);
    shadows.push(`${x}px ${y}px 0 rgba(255,255,255,${a})`);
  }
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.position = "absolute";
  el.style.top = "0";
  el.style.left = "0";
  el.style.borderRadius = "50%";
  el.style.boxShadow = shadows.join(",");
}

buildStarfield(document.getElementById("starfield-far"), 90, 1, 0.55);
buildStarfield(document.getElementById("starfield-mid"), 70, 1, 0.7);
buildStarfield(document.getElementById("starfield-near"), 45, 2, 0.9);

// ============================================================
// HERO PARALLAX: planet system + starfields react to pointer
// ============================================================
if (!prefersReducedMotion) {
  const heroEl        = document.getElementById("hero");
  const planetSystem   = document.getElementById("planet-system");
  const starFar        = document.getElementById("starfield-far");
  const starMid        = document.getElementById("starfield-mid");
  const starNear       = document.getElementById("starfield-near");

  let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;

  if (heroEl && planetSystem) {
    heroEl.addEventListener("mousemove", (e) => {
      const rect = heroEl.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = px * 14;
      targetRX = -py * 10;

      if (starFar)  starFar.style.transform  = `translate(${-px * 10}px, ${-py * 10}px)`;
      if (starMid)  starMid.style.transform  = `translate(${-px * 22}px, ${-py * 22}px)`;
      if (starNear) starNear.style.transform = `translate(${-px * 38}px, ${-py * 38}px)`;
    });

    heroEl.addEventListener("mouseleave", () => {
      targetRX = 0;
      targetRY = 0;
    });

    function animatePlanetTilt() {
      curRX += (targetRX - curRX) * 0.06;
      curRY += (targetRY - curRY) * 0.06;
      planetSystem.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      requestAnimationFrame(animatePlanetTilt);
    }
    animatePlanetTilt();
  }
}

// ============================================================
// PROJECT CARDS: mouse-follow spotlight + gentle 3D tilt
// ============================================================
if (!prefersReducedMotion) {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);

      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
}

// ============================================================
// SKILL CHIPS: shared floating tooltip
// ============================================================
(function initSkillTooltips() {
  const tooltip = document.createElement("div");
  tooltip.className = "skill-tooltip";
  document.body.appendChild(tooltip);

  const chips = document.querySelectorAll(".chip[data-desc]");

  function showTooltip(chip) {
    const desc = chip.getAttribute("data-desc");
    if (!desc) return;
    tooltip.textContent = desc;
    tooltip.classList.add("visible");

    const rect = chip.getBoundingClientRect();
    const top = rect.top - tooltip.offsetHeight - 10;
    let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - tooltip.offsetWidth - 12));

    tooltip.style.top = `${Math.max(12, top)}px`;
    tooltip.style.left = `${left}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  chips.forEach((chip) => {
    chip.setAttribute("tabindex", "0");
    chip.addEventListener("mouseenter", () => showTooltip(chip));
    chip.addEventListener("mouseleave", hideTooltip);
    chip.addEventListener("focus", () => showTooltip(chip));
    chip.addEventListener("blur", hideTooltip);
  });

  window.addEventListener("scroll", hideTooltip, { passive: true });
})();
