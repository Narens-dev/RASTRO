import type { ContractDetail } from "@/types/rastro";
import { formatCOP, formatDate } from "@/utils/format";

interface Row {
  date: string;
  concept: string;
  value: string | null;
  status: "cumplido" | "en_atraso" | "pendiente" | "registrado";
}

const STATUS_LABEL: Record<Row["status"], string> = {
  cumplido: "Cumplido",
  en_atraso: "En Atraso",
  pendiente: "Pendiente",
  registrado: "Registrado",
};

const STATUS_CLASS: Record<Row["status"], string> = {
  cumplido: "bg-secondary-container text-on-secondary-container border border-secondary",
  en_atraso: "bg-error text-on-error",
  pendiente: "border border-outline-variant bg-surface-dim text-on-surface",
  registrado: "border border-outline-variant bg-surface-container text-on-surface-variant",
};

function milestoneStatus(actualPct: number | null | undefined, plannedPct: number | null | undefined): Row["status"] {
  if (actualPct == null) return "pendiente";
  if (plannedPct == null || actualPct >= plannedPct) return "cumplido";
  return "en_atraso";
}

interface ExecutionTableProps {
  contract: ContractDetail;
}

/**
 * Registro de Ejecución — hitos del plan de entrega + adiciones contractuales,
 * en una sola tabla. Reemplaza la línea de tiempo vertical original con el
 * lenguaje visual del mockup de Stitch, pero sin su columna "Estado RASTRO"
 * (Verificado/Hallazgo) por fila: eso no existe como dato real por hito —
 * Croma no trae una verificación individual por pago. El único "estado" que
 * se muestra aquí es una comparación honesta de avance real vs. planeado.
 */
export const ExecutionTable = ({ contract }: ExecutionTableProps) => {
  const rows: Row[] = [
    ...(contract.deliveryPlan || [])
      .filter((m) => m.plannedDate)
      .map((m) => ({
        date: m.plannedDate as string,
        concept: `Hito: ${m.item ?? "sin nombre"}${m.plannedPct != null ? ` (${m.plannedPct}%)` : ""}`,
        value: null,
        status: milestoneStatus(m.actualPct, m.plannedPct),
      })),
    ...(contract.additions || [])
      .filter((a) => a.date)
      .map((a) => {
        const desc = a.description || "Adición contractual";
        return {
          date: a.date as string,
          concept: desc.length > 140 ? `${desc.slice(0, 140)}…` : desc,
          value: a.value != null ? formatCOP(a.value) : null,
          status: "registrado" as const,
        };
      }),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-outline-variant/40 bg-surface-container-low p-6">
        <h2 className="font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Registro de Ejecución</h2>
      </div>
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-on-surface-variant">Sin hitos ni adiciones registradas para este contrato.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-on-surface font-label text-xs text-surface uppercase">
                <th className="p-3 font-medium">Fecha</th>
                <th className="p-3 font-medium">Concepto</th>
                <th className="p-3 font-medium">Valor</th>
                <th className="p-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 align-top font-mono text-sm text-on-surface">
              {rows.map((row, i) => (
                <tr key={`${row.date}-${i}`} className="transition-colors hover:bg-surface-container-low">
                  <td className="p-3 whitespace-nowrap">{formatDate(row.date)}</td>
                  <td className="max-w-xs p-3 font-sans">{row.concept}</td>
                  <td className="p-3 whitespace-nowrap">{row.value ?? "—"}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`rounded px-2 py-1 text-xs font-label font-semibold ${STATUS_CLASS[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
