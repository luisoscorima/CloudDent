export const ESTADOS_CITA = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'ATENDIDA'];

export const estadoCitaLabels = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  ATENDIDA: 'Atendida',
};

export function getEstadoCitaStyles(estado) {
  switch (estado) {
    case 'CONFIRMADA':
      return {
        card: 'border-l-4 border-emerald-500',
        badge: 'bg-emerald-950/50 text-emerald-300 border border-emerald-800',
      };
    case 'PENDIENTE':
      return {
        card: 'border-l-4 border-amber-500',
        badge: 'bg-amber-950/50 text-amber-300 border border-amber-800',
      };
    case 'CANCELADA':
      return {
        card: 'border-l-4 border-red-500 opacity-70',
        badge: 'bg-red-950/50 text-red-300 border border-red-800',
      };
    case 'ATENDIDA':
      return {
        card: 'border-l-4 border-cyan-500',
        badge: 'bg-cyan-950/50 text-cyan-300 border border-cyan-800',
      };
    default:
      return {
        card: 'border-l-4 border-slate-500',
        badge: 'bg-slate-950/50 text-slate-300 border border-slate-800',
      };
  }
}
