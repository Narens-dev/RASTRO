/**
 * Entidades contratantes "semilla" para el Modo Oportunidad.
 *
 * Limitación honesta y documentada: Croma expone búsqueda de procesos SECOP
 * por entidad contratante (NIT), no un índice global buscable por sector en
 * todo el universo de entidades públicas. Para que el Modo Oportunidad sea
 * útil dentro del alcance de un hackathon, RASTRO consulta en paralelo un
 * conjunto curado de entidades de alto volumen de contratación y filtra sus
 * procesos activos por sector/valor/ubicación en el propio backend. Ampliar
 * esta lista (o sustituirla por un índice propio indexado en background) es
 * el camino natural de evolución post-hackathon.
 */
export const OPPORTUNITY_SEED_ENTITIES = [
  { nit: "899999061", name: "ALCALDÍA MAYOR DE BOGOTÁ D.C.", location: "Bogotá D.C." },
  { nit: "890905211", name: "DISTRITO ESPECIAL DE CIENCIA, TECNOLOGÍA E INNOVACIÓN DE MEDELLÍN", location: "Antioquia" },
  { nit: "890399011", name: "ALCALDÍA DE CALI", location: "Valle del Cauca" },
  { nit: "899999068", name: "FONDO NACIONAL DEL AHORRO", location: "Bogotá D.C." },
  { nit: "899999059", name: "AEROCIVIL", location: "Nacional" },
];

export const SECTORS = [
  "Construcción e infraestructura",
  "Tecnología",
  "Salud",
  "Alimentos",
  "Servicios generales",
];

/**
 * Croma no expone el proceso SECOP con un código UNSPSC en el resumen — solo
 * nombre, referencia y tipo de contrato. Para poder filtrar por sector sin
 * ese campo, RASTRO empareja por palabras clave sobre nombre/referencia/tipo
 * de contrato. Es una aproximación deliberada, no una clasificación oficial.
 */
export const SECTOR_KEYWORDS = {
  "Construcción e infraestructura": ["obra", "construccion", "infraestructura", "via", "vias", "puente", "mantenimiento", "interventoria", "señalizacion", "senalizacion", "pavimento"],
  "Tecnología": ["software", "tecnologia", "sistemas", "informatica", "computo", "digital", "aplicativo", "plataforma"],
  "Salud": ["salud", "hospitalaria", "medico", "medica", "insumos medicos", "dotacion hospitalaria"],
  "Alimentos": ["alimentacion", "alimentos", "pae", "refrigerio", "nutricion"],
  "Servicios generales": ["aseo", "cafeteria", "vigilancia", "mantenimiento locativo", "logistica"],
};

// Clasificación deliberadamente basada en `phase` (más granular que
// `procedure_status`): en contratación directa, Croma puede devolver
// procedure_status "Seleccionado" mientras phase sigue en "Presentación de
// oferta" — phase es la señal más confiable de si el proceso sigue abierto.
export const OPEN_PHASES = ["presentación de oferta", "presentacion de oferta", "evaluación de ofertas", "evaluacion de ofertas", "verificación de requisitos", "verificacion de requisitos"];
export const CLOSED_PHASE_KEYWORDS = ["adjudicado", "terminado", "cerrado", "liquidado", "desierto", "cancelado", "en ejecucion", "en ejecución"];
