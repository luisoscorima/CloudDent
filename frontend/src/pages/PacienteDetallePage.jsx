import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import HistorialTimeline from '../components/pacientes/HistorialTimeline';
import Modal from '../components/ui/Modal';

const emptyAtencion = {
  fecha: new Date().toISOString().split('T')[0],
  hora: '09:00',
  diagnostico: '',
  observaciones: '',
  tratamiento: '',
};

export default function PacienteDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, hasRole } = useAuth();
  const canWriteAtencion = hasRole(['ADMINISTRADOR', 'ODONTOLOGO']);

  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyAtencion);
  const [error, setError] = useState('');

  const cargar = async () => {
    setLoading(true);
    try {
      const [pacRes, histRes] = await Promise.all([
        axiosClient.get(`/api/pacientes/${id}`),
        axiosClient.get(`/api/pacientes/${id}/historial`),
      ]);
      setPaciente(pacRes.data);
      setHistorial(histRes.data);
    } catch (err) {
      console.error(err);
      navigate('/pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [id]);

  const guardarAtencion = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post(`/api/pacientes/${id}/atenciones`, {
        ...form,
        odontologoId: usuario.id,
      });
      setModalOpen(false);
      setForm(emptyAtencion);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar atención');
    }
  };

  if (loading || !paciente) {
    return <p className="text-slate-500">Cargando ficha...</p>;
  }

  const nombreCompleto = `${paciente.nombres} ${paciente.apellidos}`;
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=64&background=0D9488&color=fff&bold=true`;
  const edad = paciente.fechaNacimiento
    ? Math.floor(
        (Date.now() - new Date(paciente.fechaNacimiento).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/pacientes" className="p-2 hover:bg-slate-800 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <h2 className="text-2xl font-bold text-white">Ficha Clínica Digital</h2>
        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">
          ID: P-{paciente.id}
        </span>
      </div>

      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <img
              src={avatarUrl}
              alt={nombreCompleto}
              className="w-16 h-16 rounded-full border-2 border-cyan-500/50"
            />
            <div>
              <h3 className="text-xl font-bold text-white">{nombreCompleto}</h3>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-400">
                {edad != null && (
                  <span>
                    {edad} años ({paciente.fechaNacimiento})
                  </span>
                )}
                <span>DNI: {paciente.dni}</span>
                {paciente.telefono && <span>Tel: {paciente.telefono}</span>}
                {paciente.email && <span>{paciente.email}</span>}
              </div>
            </div>
          </div>
          {canWriteAtencion && (
            <button
              onClick={() => {
                setForm(emptyAtencion);
                setError('');
                setModalOpen(true);
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nueva Atención
            </button>
          )}
        </div>
      </div>

      <HistorialTimeline atenciones={historial} loading={false} />

      {modalOpen && (
        <Modal title="Registrar Atención Clínica" onClose={() => setModalOpen(false)} wide>
          <form onSubmit={guardarAtencion} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Fecha *</label>
                <input
                  type="date"
                  required
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Hora *</label>
                <input
                  type="time"
                  required
                  value={form.hora}
                  onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-400">Diagnóstico</label>
                <input
                  value={form.diagnostico}
                  onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Ej: Consulta General"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-400">Tratamiento realizado</label>
                <input
                  value={form.tratamiento}
                  onChange={(e) => setForm({ ...form, tratamiento: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-400">Observaciones</label>
                <textarea
                  rows={3}
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-white"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-600 text-white">
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
