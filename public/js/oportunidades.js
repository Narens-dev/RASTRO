// Vista Modo Oportunidad (Módulo 5).

const sectorEl = document.getElementById("filter-sector");
const locationEl = document.getElementById("filter-location");
const valueEl = document.getElementById("filter-value");
const winnersEl = document.getElementById("filter-winners");
const gridEl = document.getElementById("opps-grid");
const countEl = document.getElementById("results-count");

async function initFilters() {
  try {
    const meta = await RastroAPI.meta();
    sectorEl.innerHTML = meta.sectors.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
    locationEl.innerHTML = meta.locations.map((l) => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("");
  } catch {
    sectorEl.innerHTML = `<option value="Todos">Todos los sectores</option>`;
    locationEl.innerHTML = `<option value="Todas">Todas las ubicaciones</option>`;
  }
}

function renderOpportunities(data) {
  countEl.textContent = data.capped
    ? `Mostrando las ${data.count} más recientes de ${data.totalMatched} licitaciones activas encontradas — filtra por sector para ver todas.`
    : `${data.count} licitación(es) activa(s) encontradas.`;
  if (!data.count) {
    gridEl.innerHTML = `<div class="state-box" style="grid-column:1/-1;"><div class="icon">🔍</div>Sin licitaciones activas con estos filtros. Prueba ampliando el rango de valor o el sector.</div>`;
    return;
  }
  gridEl.innerHTML = data.opportunities
    .map(
      (o) => `
    <a class="card opp-card" href="${escapeHtml(o.url)}" target="_blank" rel="noopener">
      <div class="opp-top">
        <div>
          <span class="opp-sector-chip">${escapeHtml(o.modality || "Proceso SECOP")}</span>
          <div class="opp-title">${escapeHtml(o.name || o.reference)}</div>
          <div class="opp-entity">${escapeHtml(o.entity)} · ${escapeHtml(o.entityLocation || "")}</div>
        </div>
      </div>
      ${o.previousWinners?.length ? `
        <div class="winners-box">
          <b>Ganadores anteriores en procesos similares:</b> ${o.previousWinners.map((w) => `${escapeHtml(w.name)} (${w.count})`).join(", ")}
        </div>` : ""}
      <div class="opp-meta-row">
        <div class="opp-value">${formatCOP(o.basePrice)}</div>
        <div class="opp-deadline">Publicado ${formatDate(o.publishedDate)}</div>
      </div>
    </a>`
    )
    .join("");
}

function parseValueRange(v) {
  if (!v) return { minValue: undefined, maxValue: undefined };
  const [min, max] = v.split("-");
  return { minValue: min || undefined, maxValue: max || undefined };
}

async function load() {
  gridEl.innerHTML = `<div class="state-box" style="grid-column:1/-1;"><div class="spinner"></div>Cargando licitaciones activas…</div>`;
  countEl.textContent = "Buscando…";
  const { minValue, maxValue } = parseValueRange(valueEl.value);
  try {
    const data = await RastroAPI.opportunities({
      sector: sectorEl.value,
      location: locationEl.value,
      minValue,
      maxValue,
      winners: winnersEl.checked,
    });
    renderOpportunities(data);
  } catch (err) {
    gridEl.innerHTML = `<div class="state-box" style="grid-column:1/-1;">${escapeHtml(err.message)}</div>`;
  }
}

[sectorEl, locationEl, valueEl, winnersEl].forEach((el) => el.addEventListener("change", load));

initFilters().then(load);
