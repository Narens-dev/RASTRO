// Navegación, pie de página y utilidades compartidas por las cuatro vistas (Módulo 9).

const BRAND_MARK_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 12C5.5 5.5 18.5 5.5 22 12C18.5 18.5 5.5 18.5 2 12Z" stroke="#F7F5F0" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="3" fill="#F7F5F0"/>
  <path d="M16.5 7.5L20.5 3.5M7.5 16.5L3.5 20.5" stroke="#F7F5F0" stroke-width="1.3" stroke-linecap="round"/>
  <circle cx="20.5" cy="3.5" r="1" fill="#F7F5F0"/>
  <circle cx="3.5" cy="20.5" r="1" fill="#F7F5F0"/>
</svg>`;

function renderNav(activePath) {
  const links = [
    { href: "/index.html", label: "Inicio" },
    { href: "/oportunidades.html", label: "Modo Oportunidad" },
  ];
  const el = document.getElementById("rastro-nav");
  if (!el) return;
  el.innerHTML = `
    <nav class="nav">
      <div class="container">
        <a href="/index.html" class="brand">
          <span class="brand-mark">${BRAND_MARK_SVG}</span>
          RASTRO
        </a>
        <div class="nav-links">
          ${links.map((l) => `<a href="${l.href}" class="nav-link ${activePath === l.href ? "active" : ""}">${l.label}</a>`).join("")}
        </div>
      </div>
    </nav>`;
}

function renderFooter() {
  const el = document.getElementById("rastro-footer");
  if (!el) return;
  el.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <p class="footer-note">RASTRO no crea información nueva ni emite veredictos. Toda la evidencia mostrada es pública por ley, con su fuente oficial citada y fecha de consulta — preservando la presunción de inocencia.</p>
          <span id="data-badge" class="data-badge"><span class="dot"></span> Cargando fuente de datos…</span>
        </div>
        <p style="font-size:12.5px; opacity:0.7;">Hackathon Croma / Datos Abiertos Colombia — RASTRO, ${new Date().getFullYear()}.</p>
      </div>
    </footer>`;

  RastroAPI.meta()
    .then((meta) => {
      const badge = document.getElementById("data-badge");
      if (!badge) return;
      if (meta.degraded) {
        badge.classList.add("degraded");
        badge.innerHTML = `<span class="dot"></span> Fuente: respaldo local (Croma no disponible)`;
      } else if (meta.dataSource === "croma") {
        badge.innerHTML = `<span class="dot"></span> Conectado a Croma en vivo`;
      } else {
        badge.innerHTML = `<span class="dot"></span> Modo demo (datos de respaldo)`;
      }
    })
    .catch(() => {});
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  // Red de seguridad: si el observer no dispara para algún elemento (captura de
  // pantalla de página completa, prefers-reduced-motion, timing de layout), el
  // contenido no debe quedar invisible para siempre — se revela igual poco después.
  const fallback = setTimeout(() => items.forEach((it) => it.classList.add("in")), 600);

  if (!("IntersectionObserver" in window)) {
    items.forEach((it) => it.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );
  items.forEach((it) => io.observe(it));

  window.addEventListener("beforeunload", () => clearTimeout(fallback), { once: true });
}

function formatCOP(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav(window.location.pathname);
  renderFooter();
  initReveal();
});
