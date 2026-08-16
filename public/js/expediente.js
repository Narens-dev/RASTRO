// Vista de expediente: renderiza el resultado del Módulo 2 (scoreEngine) + Módulo 6 (IA) + Módulo 4 (historial de contratos).

const LEVEL_COLORS = {
  alto: { bg: "var(--alto-bg)", fg: "var(--alto)" },
  sin_hallazgo: { bg: "var(--sin-bg)", fg: "var(--sin)" },
  limpio: { bg: "var(--limpio-bg)", fg: "var(--limpio)" },
};
const LEVEL_ORDER = ["alto", "sin_hallazgo", "limpio"];
const LEVEL_NOUN = { alto: "Alto", sin_hallazgo: "Sin hallazgo", limpio: "Limpio" };

const doc = qs("doc");
const docType = qs("docType") || "NIT";
const name = qs("name");

function renderHeader(exp) {
  document.title = `${exp.name || exp.doc} — Expediente RASTRO`;
  document.getElementById("entity-name").textContent = exp.name || `Documento ${exp.doc}`;

  const chips = [`${exp.docType} · ${exp.doc}`];
  if (exp.rues) chips.push(`RUES: ${exp.rues.status}`);
  if (exp.rues?.chamberName) chips.push(exp.rues.chamberName);
  document.getElementById("entity-chips").innerHTML = chips.map((c) => `<span class="chip">${escapeHtml(c)}</span>`).join("");

  const counts = exp.counts;
  document.getElementById("counts-row").innerHTML = LEVEL_ORDER.map((lvl) => {
    const c = LEVEL_COLORS[lvl];
    return `<div class="count-pill" style="background:${c.bg}; color:${c.fg};">
      <div class="n">${counts[lvl]}</div>
      <div class="lbl">${LEVEL_NOUN[lvl]}</div>
    </div>`;
  }).join("");
}

function formatDetail(detail) {
  if (detail == null) return "";
  if (Array.isArray(detail)) {
    if (!detail.length) return "(vacío)";
    return detail
      .map((item) => {
        if (typeof item === "object") {
          return Object.entries(item)
            .filter(([, v]) => v !== null && v !== undefined && v !== "")
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");
        }
        return String(item);
      })
      .join("\n\n---\n\n");
  }
  if (typeof detail === "object") {
    return Object.entries(detail)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }
  return String(detail);
}

function renderEvidence(exp) {
  const el = document.getElementById("evidence-list");
  el.innerHTML = exp.evidence
    .map((e, i) => {
      const detailText = formatDetail(e.detail);
      return `
      <div class="evidence-item">
        <div class="evidence-body">
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <span class="evidence-source">${escapeHtml(e.sourceLabel)}</span>
            <span class="badge badge-${e.level}">${e.levelLabel}</span>
          </div>
          <p class="evidence-summary">${escapeHtml(e.summary)}</p>
          <p class="evidence-checked">Consultado: ${formatDate(e.checkedAt)}</p>
          ${detailText ? `
            <button class="evidence-detail-toggle" data-idx="${i}">Ver detalle ↓</button>
            <div class="evidence-detail" id="detail-${i}">${escapeHtml(detailText)}</div>
          ` : ""}
        </div>
      </div>`;
    })
    .join("");

  el.querySelectorAll(".evidence-detail-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const box = document.getElementById(`detail-${btn.dataset.idx}`);
      const open = box.classList.toggle("open");
      btn.textContent = open ? "Ocultar detalle ↑" : "Ver detalle ↓";
    });
  });
}

function renderContracts(exp) {
  const el = document.getElementById("contracts-card");
  if (!exp.contractHistory.count) {
    el.innerHTML = `<div class="state-box"><div class="icon">📄</div>Sin contratos registrados en SECOP para este documento.</div>`;
    return;
  }
  el.innerHTML = `
    <table class="contracts-table">
      <thead><tr><th>Entidad</th><th>Objeto</th><th>Valor</th><th>Estado</th><th>Firma</th></tr></thead>
      <tbody>
        ${exp.contractHistory.contracts
          .map(
            (c) => `
          <tr class="clickable" data-contract="${escapeHtml(c.contractId)}">
            <td>${escapeHtml(c.entity)}</td>
            <td style="max-width:280px;">${escapeHtml((c.description || "").slice(0, 90))}${(c.description || "").length > 90 ? "…" : ""}</td>
            <td class="value-cell">${formatCOP(c.value)}</td>
            <td>${escapeHtml(c.status)}</td>
            <td>${formatDate(c.signDate)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>`;

  el.querySelectorAll("tr[data-contract]").forEach((row) => {
    row.addEventListener("click", () => {
      window.location.href = `/contrato.html?id=${encodeURIComponent(row.dataset.contract)}`;
    });
  });
}

function renderAiSummary() {
  const el = document.getElementById("ai-summary-slot");
  el.innerHTML = `
    <div class="ai-summary-card">
      <span class="tag">✦ Resumen ejecutivo — IA</span>
      <div class="ai-summary-loading"><span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span></div>
    </div>`;

  RastroAPI.entitySummary(docType, doc, name)
    .then((res) => {
      if (!res.available) {
        el.innerHTML = "";
        return;
      }
      el.innerHTML = `
        <div class="ai-summary-card">
          <span class="tag">✦ Resumen ejecutivo — IA</span>
          <p class="ai-summary-text">${escapeHtml(res.text)}</p>
        </div>`;
    })
    .catch(() => {
      el.innerHTML = "";
    });
}

async function init() {
  if (!doc) {
    document.getElementById("entity-name").textContent = "Falta el documento a consultar.";
    return;
  }
  try {
    const exp = await RastroAPI.entity(docType, doc, name);
    renderHeader(exp);
    renderEvidence(exp);
    renderContracts(exp);
    renderAiSummary();
  } catch (err) {
    document.getElementById("entity-name").textContent = "No fue posible construir el expediente.";
    document.getElementById("evidence-list").innerHTML = `<div class="state-box">${escapeHtml(err.message)}</div>`;
  }
}

init();
