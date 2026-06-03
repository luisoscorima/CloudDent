import { History } from 'lucide-react';

function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function HistorialTimeline({ atenciones, loading }) {
  if (loading) {
    return <p className="text-slate-500 text-sm">Cargando historial...</p>;
  }

  if (!atenciones?.length) {
    return (
      <p className="text-slate-500 text-sm text-center py-6">Sin atenciones registradas</p>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
      <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
        <History className="w-4 h-4 text-amber-400" />
        Historial de Atenciones
      </h4>
      <div className="space-y-4">
        {atenciones.map((a, index) => (
          <div key={a.id} className="relative pl-6 border-l border-slate-700">
            <div
              className={`absolute -left-1.5 top-2 w-3 h-3 rounded-full ${
                index === 0 ? 'bg-cyan-500' : 'bg-slate-500'
              }`}
            />
            <p className="text-sm font-medium text-white">
              {formatFecha(a.fecha)} — {a.diagnostico || a.tratamiento || 'Atención'}
            </p>
            {a.observaciones && (
              <p className="text-xs text-slate-400 mt-1">{a.observaciones}</p>
            )}
            {a.tratamiento && a.diagnostico && (
              <p className="text-xs text-slate-500 mt-1">Tratamiento: {a.tratamiento}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">{a.odontologoNombre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
