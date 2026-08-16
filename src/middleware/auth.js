import { verifyToken, getCompanyById } from "../services/companies.js";

/** Exige un JWT válido (`Authorization: Bearer <token>`) y adjunta la cuenta a `req.company`. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = token && verifyToken(token);
  if (!payload) return res.status(401).json({ error: "No autenticado." });

  const company = getCompanyById(payload.sub);
  if (!company) return res.status(401).json({ error: "Cuenta no encontrada." });

  req.company = company;
  next();
}
