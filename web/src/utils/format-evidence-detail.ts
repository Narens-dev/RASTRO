/** Renders an evidence item's raw `detail` payload as readable plain text. */
export function formatEvidenceDetail(detail: unknown): string {
  if (detail == null) return "";

  if (Array.isArray(detail)) {
    if (!detail.length) return "(vacío)";
    return detail
      .map((item) =>
        typeof item === "object" && item !== null
          ? Object.entries(item as Record<string, unknown>)
              .filter(([, v]) => v !== null && v !== undefined && v !== "")
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n")
          : String(item),
      )
      .join("\n\n---\n\n");
  }

  if (typeof detail === "object") {
    return Object.entries(detail as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }

  return String(detail);
}
