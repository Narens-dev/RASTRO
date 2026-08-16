import type { AlignmentSignal, AlignmentStatus } from "@/types/rastro";

const GAUGE_COLOR: Record<AlignmentStatus, string> = {
  alineado: "var(--color-primary-container, #046A38)",
  adelantado: "var(--color-brand-accent, #C9A227)",
  alerta_atraso: "#BA1A1A",
  sin_datos: "var(--color-outline, #6f7a6f)",
};

const GAUGE_ICON: Record<AlignmentStatus, string> = {
  alineado: "check_circle",
  adelantado: "rocket_launch",
  alerta_atraso: "warning",
  sin_datos: "info",
};

const GAUGE_LABEL: Record<AlignmentStatus, string> = {
  alineado: "Alineado",
  adelantado: "Por delante",
  alerta_atraso: "Alerta de Atraso",
  sin_datos: "Sin datos",
};

// Semicírculo vía SVG (arco de 180°, radio 80, centro 100,100): más confiable
// entre navegadores que aproximar un gauge con clip-path/conic-gradient.
const RADIUS = 80;
const ARC_LENGTH = Math.PI * RADIUS;

interface ExecutionGaugeProps {
  alignment: AlignmentSignal;
}

/** Gauge de estado de ejecución — versión con datos reales del mockup de Stitch (Contrato). */
export const ExecutionGauge = ({ alignment }: ExecutionGaugeProps) => {
  const value = alignment.physicalProgressPct ?? alignment.paidPct ?? 0;
  const clamped = Math.max(0, Math.min(100, value));
  const color = GAUGE_COLOR[alignment.status];
  const offset = ARC_LENGTH * (1 - clamped / 100);

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm">
      <span className="absolute top-4 left-4 font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
        Estado de Ejecución
      </span>

      <svg viewBox="0 0 200 110" className="mt-6 w-48">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--color-surface-container-high, #eae8e3)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="-mt-8 flex flex-col items-center gap-1">
        <span className="material-symbols-outlined text-3xl" style={{ color, fontVariationSettings: "'FILL' 1" }}>
          {GAUGE_ICON[alignment.status]}
        </span>
        <span className="font-display text-base font-bold" style={{ color }}>
          {GAUGE_LABEL[alignment.status]}
        </span>
      </div>

      <p className="mt-4 text-center font-body text-sm text-on-surface-variant">
        {alignment.timeElapsedPct != null && (alignment.physicalProgressPct != null || alignment.paidPct != null)
          ? `Avance Financiero (${Math.round(alignment.paidPct ?? 0)}%) vs. Avance Físico (${Math.round(alignment.physicalProgressPct ?? alignment.paidPct ?? 0)}%)`
          : alignment.label}
      </p>
    </div>
  );
};
