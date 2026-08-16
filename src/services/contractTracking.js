/**
 * Módulo 4 — Seguimiento de contratos.
 * Construye línea de tiempo, ejecución financiera y una señal automática
 * que compara avance de plazo vs. avance de pago — sin depender de reportes
 * de avance físico, que no existen como dato público estructurado.
 */

const TOLERANCE_PCT = 15; // puntos porcentuales de margen antes de marcar desalineación

function pctBetween(startDate, endDate, atDate = new Date()) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const at = atDate.getTime();
  if (!start || !end || end <= start) return null;
  return Math.max(0, Math.min(100, ((at - start) / (end - start)) * 100));
}

function buildTimeline(contract) {
  const events = [];
  if (contract.signDate) events.push({ date: contract.signDate, type: "firma", label: "Firma del contrato" });
  if (contract.startDate) events.push({ date: contract.startDate, type: "inicio", label: "Inicio de ejecución" });
  for (const a of contract.additions || []) {
    const valuePart = a.value != null ? `Adición de ${formatCOP(a.value)}` : "Adición registrada (sin valor monetario reportado)";
    events.push({ date: a.date, type: "adicion", label: `${valuePart} — ${a.description || "sin descripción"}` });
  }
  for (const item of contract.deliveryPlan || []) {
    events.push({ date: item.plannedDate, type: "hito", label: `Hito planeado: ${item.item} (${item.plannedPct}%)`, actualPct: item.actualPct, plannedPct: item.plannedPct });
  }
  if (contract.endDate) events.push({ date: contract.endDate, type: "fin", label: "Fecha de terminación pactada" });
  return events
    .filter((e) => e.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function formatCOP(value) {
  if (value == null) return "$0";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function alignmentSignal(contract) {
  const timeElapsedPct = pctBetween(contract.startDate, contract.endDate);
  const totalValue = (contract.value || 0) + (contract.additions || []).reduce((sum, a) => sum + (a.value || 0), 0);
  const paidPct = totalValue ? Math.min(100, ((contract.paidToDate || 0) / totalValue) * 100) : null;

  const plan = contract.deliveryPlan || [];
  const latestMilestone = [...plan].reverse().find((p) => typeof p.actualPct === "number");
  const physicalProgressPct = latestMilestone ? latestMilestone.actualPct : null;

  if (timeElapsedPct === null) {
    return { status: "sin_datos", label: "Sin datos suficientes", detail: "No hay fechas de inicio/fin registradas para calcular la señal.", timeElapsedPct, paidPct, physicalProgressPct };
  }

  const referenceProgress = physicalProgressPct ?? paidPct;
  if (referenceProgress === null) {
    return { status: "sin_datos", label: "Sin datos suficientes", detail: "No hay avance físico ni pagos registrados para comparar contra el plazo.", timeElapsedPct, paidPct, physicalProgressPct };
  }

  const gap = timeElapsedPct - referenceProgress;
  if (Math.abs(gap) <= TOLERANCE_PCT) {
    return { status: "alineado", label: "Plazo y avance alineados", detail: `El ${Math.round(timeElapsedPct)}% del plazo transcurrido es consistente con el ${Math.round(referenceProgress)}% de avance registrado.`, timeElapsedPct, paidPct, physicalProgressPct };
  }
  if (gap > TOLERANCE_PCT) {
    return { status: "alerta_atraso", label: "⚠ El plazo avanza más rápido que la ejecución", detail: `Ha transcurrido el ${Math.round(timeElapsedPct)}% del plazo pero el avance registrado es de solo ${Math.round(referenceProgress)}%. Señal automática, no un hallazgo de incumplimiento — requiere verificación.`, timeElapsedPct, paidPct, physicalProgressPct };
  }
  return { status: "adelantado", label: "Ejecución por delante del plazo", detail: `El avance registrado (${Math.round(referenceProgress)}%) supera el ${Math.round(timeElapsedPct)}% del plazo transcurrido.`, timeElapsedPct, paidPct, physicalProgressPct };
}

export async function buildContractTracking(source, contractId) {
  const { found, contract } = await source.secopContract(contractId);
  if (!found) return { found: false, contractId };

  const totalAdditions = (contract.additions || []).reduce((sum, a) => sum + (a.value || 0), 0);
  const totalValue = (contract.value || 0) + totalAdditions;

  return {
    found: true,
    contract: {
      ...contract,
      valueFormatted: formatCOP(contract.value),
      totalValueFormatted: formatCOP(totalValue),
      totalValue,
      paidToDateFormatted: formatCOP(contract.paidToDate || 0),
      pending: Math.max(0, totalValue - (contract.paidToDate || 0)),
      pendingFormatted: formatCOP(Math.max(0, totalValue - (contract.paidToDate || 0))),
    },
    timeline: buildTimeline(contract),
    alignment: alignmentSignal(contract),
  };
}
