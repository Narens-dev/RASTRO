import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { collection } from "../store/jsonStore.js";

/**
 * Módulo — Cuentas de empresa (apartado Empresas).
 *
 * Gatea dos cosas sensibles: (1) las preferencias de alerta de Modo
 * Oportunidad (para no exponer a quién le interesa qué licitación), y (2) el
 * acceso al estudio de seguridad por cédula (backgroundCheck.js).
 *
 * Verificación deliberadamente ligera para el alcance de un hackathon:
 * registrarse exige un NIT que exista y esté ACTIVA en RUES (fuente
 * oficial, vía el mismo `source` que usa el resto de RASTRO), pero no
 * verifica que quien se registra sea el representante legal — eso requeriría
 * un mecanismo de verificación de identidad fuera del alcance actual. Nunca
 * se asigna el rol "estado" por auto-registro: solo se otorga a las cuentas
 * listadas en RASTRO_ESTADO_EMAILS (provisión manual).
 */

const JWT_SECRET = process.env.JWT_SECRET || "rastro-dev-secret-cambiar-en-produccion";
const JWT_EXPIRES_IN = "7d";

function estadoEmails() {
  return (process.env.RASTRO_ESTADO_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function toPublicCompany(row) {
  if (!row) return null;
  const { passwordHash: _passwordHash, whatsappPending: _whatsappPending, loginPending: _loginPending, ...pub } = row;
  return pub;
}

export function signToken(company) {
  return jwt.sign({ sub: company.id, role: company.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function registerCompany(source, { nit, email, password, sector, location }) {
  const cleanNit = (nit || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanNit || !cleanEmail || !password) {
    return { ok: false, error: "NIT, correo y contraseña son obligatorios." };
  }
  if (password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const companies = collection("companies");
  if (companies.find((c) => c.email === cleanEmail)) {
    return { ok: false, error: "Ya existe una cuenta registrada con ese correo." };
  }

  const rues = await source.ruesByNit(cleanNit);
  if (!rues.found) {
    return { ok: false, error: "El NIT no se encuentra en el Registro Único Empresarial y Social (RUES)." };
  }
  if (rues.entity.status !== "ACTIVA") {
    return { ok: false, error: `El registro mercantil de este NIT está en estado "${rues.entity.status}", no ACTIVA.` };
  }

  const role = estadoEmails().includes(cleanEmail) ? "estado" : "empresa";

  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nit: cleanNit,
    name: rues.entity.name,
    email: cleanEmail,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    subscription: { active: !!(sector || location), sector: sector || "Todos", location: location || "Todas" },
    createdAt: new Date().toISOString(),
  };
  companies.insert(row);
  return { ok: true, company: toPublicCompany(row), token: signToken(row) };
}

const LOGIN_CODE_TTL_MS = 10 * 60 * 1000;

/**
 * Paso 1 del login — valida credenciales, genera un código de 6 dígitos y lo
 * envía por correo (EmailPort). No emite token todavía: eso solo pasa en
 * completeLogin, tras confirmar el código. Mismo principio de honestidad que
 * la verificación de WhatsApp: sin un proveedor real distinto de mock, el
 * código se devuelve en la respuesta marcado como "modo demo" en vez de
 * fingir que llegó un correo real.
 */
export async function beginLogin(emailAdapter, { email, password }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const companies = collection("companies");
  const row = companies.find((c) => c.email === cleanEmail);
  if (!row || !bcrypt.compareSync(password || "", row.passwordHash)) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + LOGIN_CODE_TTL_MS).toISOString();
  companies.update((c) => c.id === row.id, { loginPending: { code, expiresAt } });

  const result = await emailAdapter.send({
    to: row.email,
    subject: "Tu código de verificación — RASTRO",
    html: `<p>Tu código de verificación es <strong>${code}</strong>. Vence en 10 minutos.</p>`,
    text: `Tu código de verificación es ${code}. Vence en 10 minutos.`,
  });

  const isMock = result.id != null && (process.env.EMAIL_PROVIDER || "mock") === "mock";
  return { ok: true, email: row.email, expiresAt, ...(isMock ? { devCode: code } : {}) };
}

/** Paso 2 del login — confirma el código y recién ahí emite el token. */
export function completeLogin({ email, code }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const companies = collection("companies");
  const row = companies.find((c) => c.email === cleanEmail);
  const pending = row?.loginPending;

  if (!row || !pending) return { ok: false, error: "No hay una verificación en curso — inicia sesión de nuevo." };
  if (new Date(pending.expiresAt).getTime() < Date.now()) return { ok: false, error: "El código venció — inicia sesión de nuevo." };
  if (String(code || "").trim() !== pending.code) return { ok: false, error: "Código incorrecto." };

  companies.update((c) => c.id === row.id, { loginPending: null });
  return { ok: true, company: toPublicCompany(row), token: signToken(row) };
}

export function getCompanyById(id) {
  return toPublicCompany(collection("companies").find((c) => c.id === id));
}

export function updateSubscription(id, { active, sector, location }) {
  const updated = collection("companies").update((c) => c.id === id, {
    subscription: { active: !!active, sector: sector || "Todos", location: location || "Todas" },
  });
  return toPublicCompany(updated);
}

/**
 * Empresas con alerta activa que coincide con una oportunidad nueva.
 * `sectors` es la lista de sectores que matchean esa oportunidad (puede
 * llegar vacía si no calzó con ningún keyword de SECTOR_KEYWORDS) — una
 * empresa suscrita a "Todos" igual debe recibir la alerta en ese caso.
 */
export function subscribersMatching({ sectors = [], location }) {
  return collection("companies")
    .filter((c) => {
      if (!c.subscription?.active) return false;
      const sectorOk = c.subscription.sector === "Todos" || sectors.includes(c.subscription.sector);
      const locationOk = c.subscription.location === "Todas" || c.subscription.location === location;
      return sectorOk && locationOk;
    })
    .map(toPublicCompany);
}

const WHATSAPP_CODE_TTL_MS = 10 * 60 * 1000;

function normalizePhone(raw) {
  const digits = (raw || "").replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+57${digits}`; // Colombia por defecto si no traen indicativo
}

/**
 * Genera un código de 6 dígitos, lo guarda pendiente de confirmación (nunca
 * se expone vía toPublicCompany) y lo "envía" por el adaptador configurado
 * (hoy siempre mock — ver src/adapters/whatsapp/). Devuelve el código en la
 * respuesta solo cuando el proveedor es mock: sin un WhatsApp Business API
 * real conectado, es la única forma de que el flujo sea probable en demo,
 * y queda claramente marcado como tal en vez de fingir un envío real.
 */
export async function requestWhatsAppCode(whatsappAdapter, companyId, rawPhone) {
  const phone = normalizePhone(rawPhone);
  if (!/^\+\d{7,15}$/.test(phone)) {
    return { ok: false, error: "Número de WhatsApp inválido." };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + WHATSAPP_CODE_TTL_MS).toISOString();

  const updated = collection("companies").update((c) => c.id === companyId, {
    whatsappPending: { phone, code, expiresAt },
  });
  if (!updated) return { ok: false, error: "Cuenta no encontrada." };

  const result = await whatsappAdapter.send({
    to: phone,
    message: `Tu código de verificación de RASTRO es ${code}. Vence en 10 minutos.`,
  });

  const isMock = result.id != null && !process.env.WHATSAPP_PROVIDER;
  return { ok: true, phone, expiresAt, ...(isMock ? { devCode: code } : {}) };
}

export function verifyWhatsAppCode(companyId, code) {
  const companies = collection("companies");
  const row = companies.find((c) => c.id === companyId);
  const pending = row?.whatsappPending;

  if (!pending) return { ok: false, error: "No hay una verificación de WhatsApp en curso — solicita un código primero." };
  if (new Date(pending.expiresAt).getTime() < Date.now()) return { ok: false, error: "El código venció — solicita uno nuevo." };
  if (String(code || "").trim() !== pending.code) return { ok: false, error: "Código incorrecto." };

  const updated = companies.update((c) => c.id === companyId, {
    whatsapp: { number: pending.phone, verifiedAt: new Date().toISOString() },
    whatsappPending: null,
  });
  return { ok: true, company: toPublicCompany(updated) };
}
