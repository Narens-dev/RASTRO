import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Persistencia mínima sin dependencias externas — un archivo JSON por
 * colección, lectura/escritura síncrona. RASTRO era stateless (todo se
 * recalculaba en cada consulta contra Croma); las suscripciones de empresas
 * y el registro de oportunidades ya notificadas necesitan sobrevivir a un
 * reinicio del proceso. Suficiente para el volumen de un hackathon/demo —
 * el camino natural de evolución es Postgres si el volumen de empresas
 * registradas lo justifica.
 */
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "..", "data");

class JsonCollection {
  constructor(name) {
    this.file = path.join(DATA_DIR, `${name}.json`);
    this.rows = this._load();
  }

  _load() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(this.file)) return [];
    try {
      return JSON.parse(readFileSync(this.file, "utf-8"));
    } catch {
      return [];
    }
  }

  _save() {
    writeFileSync(this.file, JSON.stringify(this.rows, null, 2), "utf-8");
  }

  all() {
    return this.rows;
  }

  find(predicate) {
    return this.rows.find(predicate) ?? null;
  }

  filter(predicate) {
    return this.rows.filter(predicate);
  }

  insert(row) {
    this.rows.push(row);
    this._save();
    return row;
  }

  update(predicate, patch) {
    const idx = this.rows.findIndex(predicate);
    if (idx === -1) return null;
    this.rows[idx] = { ...this.rows[idx], ...patch };
    this._save();
    return this.rows[idx];
  }
}

const collections = new Map();

export function collection(name) {
  if (!collections.has(name)) collections.set(name, new JsonCollection(name));
  return collections.get(name);
}
