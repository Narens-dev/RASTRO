/**
 * Caché en memoria con TTL — Map simple, sin dependencias externas.
 * Suficiente para el ciclo de vida de una demo o sesión de uso; protege a
 * Croma de golpes repetidos con la misma consulta durante una sesión.
 */
export class MemoryCache {
  constructor(ttlMs = 10 * 60 * 1000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  _key(namespace, args) {
    return `${namespace}:${JSON.stringify(args)}`;
  }

  get(namespace, args) {
    const key = this._key(namespace, args);
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(namespace, args, value) {
    const key = this._key(namespace, args);
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Envuelve una función async: cachea su resultado por (namespace, args). */
  async wrap(namespace, args, fn) {
    const cached = this.get(namespace, args);
    if (cached !== undefined) return cached;
    const value = await fn();
    this.set(namespace, args, value);
    return value;
  }

  clear() {
    this.store.clear();
  }
}
