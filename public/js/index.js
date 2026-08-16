// Lógica de la vista de inicio: búsqueda (Módulo 3) + navegación a la ficha de expediente.

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const statusEl = document.getElementById("search-status");
const resultsEl = document.getElementById("search-results");

function goToExpediente(doc, docType, name) {
  const params = new URLSearchParams({ doc, docType });
  if (name) params.set("name", name);
  window.location.href = `/expediente.html?${params.toString()}`;
}

function renderCandidates(candidates) {
  if (!candidates.length) {
    resultsEl.innerHTML = "";
    statusEl.innerHTML = `<p class="hero-hint" style="margin-top:18px;">Sin coincidencias en RUES. Verifica el nombre o intenta con el NIT/cédula directamente.</p>`;
    return;
  }
  statusEl.innerHTML = candidates.length > 1
    ? `<p class="hero-hint" style="margin-top:18px;">${candidates.length} coincidencias — elige la correcta:</p>`
    : "";
  resultsEl.innerHTML = candidates
    .map(
      (c, i) => `
      <button type="button" class="search-result-item" data-idx="${i}">
        <div>
          <div class="search-result-name">${escapeHtml(c.name || `Documento ${c.doc}`)}</div>
          <div class="search-result-meta">${c.docType}${c.doc ? " · " + c.doc : ""}${c.status ? " · " + escapeHtml(c.status) : ""}</div>
        </div>
        <span class="search-result-arrow">→</span>
      </button>`
    )
    .join("");

  resultsEl.querySelectorAll(".search-result-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = candidates[Number(btn.dataset.idx)];
      if (!c.doc) {
        statusEl.innerHTML = `<p class="hero-hint" style="margin-top:18px;">Este registro está cancelado y no tiene NIT activo para consultar. Elige otra coincidencia.</p>`;
        return;
      }
      goToExpediente(c.doc, c.docType, c.name);
    });
  });
}

async function runSearch(query) {
  statusEl.innerHTML = `<p class="hero-hint" style="margin-top:18px;">Consultando RUES…</p>`;
  resultsEl.innerHTML = "";
  try {
    const result = await RastroAPI.search(query);
    if (result.queryType === "document" && result.candidates.length === 1) {
      const c = result.candidates[0];
      goToExpediente(c.doc, c.docType, c.name);
      return;
    }
    statusEl.innerHTML = "";
    renderCandidates(result.candidates);
  } catch (err) {
    statusEl.innerHTML = `<p class="hero-hint" style="margin-top:18px; color:#ff9a86;">No fue posible completar la búsqueda: ${escapeHtml(err.message)}</p>`;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (q) runSearch(q);
});

document.querySelectorAll("[data-sample]").forEach((btn) => {
  btn.addEventListener("click", () => {
    input.value = btn.dataset.sample;
    input.focus();
    runSearch(btn.dataset.sample);
  });
});

document.getElementById("mode-transparencia").addEventListener("click", (e) => {
  e.preventDefault();
  input.focus();
  input.scrollIntoView({ behavior: "smooth", block: "center" });
});
