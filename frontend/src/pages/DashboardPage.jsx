import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarCheck, PlusCircle, UserPlus } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import CitaList from '../components/citas/CitaList';

export default function DashboardPage() {
  const [resumen, setResumen] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(true);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dashRes, citasRes] = await Promise.all([
          axiosClient.get('/api/dashboard'),
          axiosClient.get('/api/citas', { params: { fecha: hoy } }),
        ]);
        setResumen(dashRes.data);
        setCitasHoy(citasRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [hoy]);

  const fechaLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">¡Buenos días!</h2>
          <p className="text-slate-400 text-sm mt-1">Panel principal CloudDent</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/agenda"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" /> Nueva Cita
          </Link>
          <Link
            to="/pacientes"
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-cyan-900/30 flex items-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" /> Nuevo Paciente
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Pacientes</p>
            <p className="text-2xl font-bold text-white">
              {loading ? '...' : resumen?.totalPacientes ?? 0}
            </p>
          </div>
          <div className="bg-blue-950/50 p-3 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Citas Hoy</p>
            <p className="text-2xl font-bold text-white">
              {loading ? '...' : resumen?.citasHoy ?? 0}
            </p>
            <p className="text-slate-400 text-xs">
              {resumen?.citasConfirmadasHoy ?? 0} confirmadas
            </p>
          </div>
          <div className="bg-cyan-950/50 p-3 rounded-lg">
            <CalendarCheck className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Estado</p>
            <p className="text-lg font-bold text-emerald-400">Operativo</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-cyan-400" />
            Agenda de Hoy
          </h3>
          <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">
            {fechaLabel}
          </span>
        </div>
        {loading ? (
          <p className="text-slate-500">Cargando citas...</p>
        ) : (
          <CitaList citas={citasHoy} showActions={false} />
        )}
      </div>
    </>
  );
}
