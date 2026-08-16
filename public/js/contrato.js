// Vista de seguimiento de contrato (Módulo 4).

const SIGNAL_ICON = { alineado: "✅", alerta_atraso: "⚠️", adelantado: "🚀", sin_datos: "ℹ️" };
const contractId = qs("id");

function renderBackLink() {
  const link = document.getElementById("back-link");
  if (document.referrer && document.referrer.includes(window.location.host)) {
    link.href = document.referrer;
  } else {
    link.href = "/index.html";
    link.textContent = "← Ir al inicio";
  }
}

function renderSignal(alignment) {
  const el = document.getElementById("signal-slot");
  el.innerHTML = `
    <div class="signal-banner ${alignment.status}">
      <div class="signal-icon">${SIGNAL_ICON[alignment.status] || "ℹ️"}</div>
      <div>
        <div class="signal-title">${escapeHtml(alignment.label)}</div>
        <div class="signal-detail">${escapeHtml(alignment.detail)}</div>
      </div>
    </div>`;
}

function renderFinance(contract) {
  document.getElementById("finance-grid").innerHTML = `
    <div class="finance-item"><div class="finance-label">Valor total (con adiciones)</div><div class="finance-value">${contract.totalValueFormatted}</div></div>
    <div class="finance-item"><div class="finance-label">Pagado a la fecha</div><div class="finance-value">${contract.paidToDateFormatted}</div></div>
    <div class="finance-item"><div class="finance-label">Pendiente por pagar</div><div class="finance-value">${contract.pendingFormatted}</div></div>`;
}

function renderProgress(alignment) {
  const timePct = Math.round(alignment.timeElapsedPct ?? 0);
  const payPct = Math.round(alignment.paidPct ?? alignment.physicalProgressPct ?? 0);
  document.getElementById("progress-time").style.width = `${timePct}%`;
  document.getElementById("progress-time-label").textContent = `${timePct}%`;
  document.getElementById("progress-pay").style.width = `${payPct}%`;
  document.getElementById("progress-pay-label").textContent = `${payPct}%`;
}

function renderTimeline(timeline) {
  const el = document.getElementById("timeline");
  if (!timeline.length) {
    el.innerHTML = `<p style="color:var(--text-on-light-muted); font-size:14px;">Sin fechas registradas para construir la línea de tiempo.</p>`;
    return;
  }
  el.innerHTML = timeline
    .map(
      (ev) => `
    <div class="timeline-item ${ev.type}">
      <div class="timeline-dot"></div>
      <div class="timeline-date">${formatDate(ev.date)}</div>
      <div class="timeline-label">${escapeHtml(ev.label)}</div>
    </div>`
    )
    .join("");
}

function renderGuarantees(contract) {
  const el = document.getElementById("guarantees-card");
  if (!contract.guarantees?.length) {
    el.innerHTML = `<div class="section-kicker">Garantías</div><p style="margin-top:10px; font-size:14px; color:var(--text-on-light-muted);">Sin pólizas registradas para este contrato.</p>`;
    return;
  }
  el.innerHTML = `
    <div class="section-kicker">Garantías</div>
    <div style="margin-top:16px; display:flex; flex-direction:column; gap:12px;">
      ${contract.guarantees
        .map(
          (g) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:var(--surface); border-radius:12px; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="font-weight:600; font-size:14.5px;">${escapeHtml(g.type || "Póliza")}</div>
            <div style="font-size:13px; color:var(--text-on-light-muted); margin-top:2px;">${escapeHtml(g.insurer || "Aseguradora no especificada")} · vigente ${formatDate(g.validFrom)} → ${formatDate(g.validTo)}</div>
          </div>
          <div class="value-cell">${formatCOP(g.value)}</div>
        </div>`
        )
        .join("")}
    </div>`;
}

async function init() {
  renderBackLink();
  if (!contractId) {
    document.getElementById("contract-title").textContent = "Falta el identificador del contrato.";
    return;
  }
  try {
    const tracking = await RastroAPI.contract(contractId);
    const c = tracking.contract;
    document.title = `${c.contractId} — Seguimiento RASTRO`;
    document.getElementById("contract-title").textContent = c.object ? c.object.slice(0, 110) + (c.object.length > 110 ? "…" : "") : c.contractId;
    document.getElementById("contract-sub").textContent = `${c.entity} · Contratista: ${c.provider || "no especificado"} · ${c.contractId}`;

    renderSignal(tracking.alignment);
    renderFinance(c);
    renderProgress(tracking.alignment);
    renderTimeline(tracking.timeline);
    renderGuarantees(c);
  } catch (err) {
    document.getElementById("contract-title").textContent = "No fue posible cargar el contrato.";
    document.getElementById("contract-sub").textContent = err.message;
  }
}

init();
