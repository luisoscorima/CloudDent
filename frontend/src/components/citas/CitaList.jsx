import { Edit, XCircle } from 'lucide-react';
import BadgeEstadoCita from '../ui/BadgeEstadoCita';
import { getEstadoCitaStyles } from '../../utils/estadoCita';

export default function CitaList({ citas, onEdit, onCancel, showActions = true }) {
  if (!citas?.length) {
    return (
      <p className="text-slate-500 text-sm text-center py-8">No hay citas para esta fecha</p>
    );
  }

  return (
    <div className="space-y-3">
      {citas.map((cita) => {
        const styles = getEstadoCitaStyles(cita.estado);
        const hora = cita.hora?.substring(0, 5) || cita.hora;
        return (
          <div
            key={cita.id}
            className={`bg-slate-800/70 p-4 rounded-xl flex items-center justify-between ${styles.card}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-center w-14">
                <p className="text-lg font-bold text-white">{hora}</p>
              </div>
              <div>
                <p className="font-semibold text-white">{cita.pacienteNombre}</p>
                <p className="text-sm text-slate-400">{cita.motivo || 'Sin motivo'}</p>
                <p className="text-xs text-slate-500 mt-1">{cita.odontologoNombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BadgeEstadoCita estado={cita.estado} />
              {showActions && cita.estado !== 'CANCELADA' && cita.estado !== 'ATENDIDA' && (
                <>
                  <button
                    onClick={() => onEdit?.(cita)}
                    className="text-slate-400 hover:text-white"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onCancel?.(cita)}
                    className="text-slate-400 hover:text-red-400"
                    title="Cancelar"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
