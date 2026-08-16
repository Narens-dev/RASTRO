// Cliente HTTP mínimo para el Módulo 8 (API REST). Sin dependencias.
const RastroAPI = {
  async _get(path) {
    const res = await fetch(`/api${path}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(body.error || `Error ${res.status}`);
      err.detail = body.detail;
      err.status = res.status;
      throw err;
    }
    return body;
  },

  meta() {
    return this._get("/meta");
  },
  search(q) {
    return this._get(`/search?q=${encodeURIComponent(q)}`);
  },
  entity(docType, doc, name) {
    const qs = name ? `?name=${encodeURIComponent(name)}` : "";
    return this._get(`/entity/${encodeURIComponent(docType)}/${encodeURIComponent(doc)}${qs}`);
  },
  entitySummary(docType, doc, name) {
    const qs = name ? `?name=${encodeURIComponent(name)}` : "";
    return this._get(`/entity/${encodeURIComponent(docType)}/${encodeURIComponent(doc)}/summary${qs}`);
  },
  contract(contractId) {
    return this._get(`/contract/${encodeURIComponent(contractId)}`);
  },
  opportunities(params = {}) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, v);
    }
    return this._get(`/opportunities?${qs.toString()}`);
  },
};
