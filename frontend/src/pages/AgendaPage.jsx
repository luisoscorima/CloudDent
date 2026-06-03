import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import CitaList from '../components/citas/CitaList';
import Modal from '../components/ui/Modal';
import { ESTADOS_CITA, estadoCitaLabels, getEstadoCitaStyles } from '../utils/estadoCita';

const emptyCita = {
  fecha: new Date().toISOString().split('T')[0],
  hora: '09:00',
  motivo: '',
  estado: 'PENDIENTE',
  pacienteId: '',
  odontologoId: '',
};

export default function AgendaPage() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [odontologoId, setOdontologoId] = useState('');
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCita);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/api/citas', {
        params: { fecha, odontologoId: odontologoId || undefined },
      });
      setCitas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, [fecha, odontologoId]);

  useEffect(() => {
    const cargarCatalogos = async () => {
      const [pacRes, odonRes] = await Promise.all([
        axiosClient.get('/api/pacientes', { params: { size: 500 } }),
        axiosClient.get('/api/odontologos'),
      ]);
      setPacientes(pacRes.data.content || pacRes.data);
      setOdontologos(odonRes.data);
    };
    cargarCatalogos();
  }, []);

  const abrirCrear = () => {
    setEditingId(null);
    setForm({ ...emptyCita, fecha });
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (cita) => {
    setEditingId(cita.id);
    setForm({
      fecha: cita.fecha,
      hora: cita.hora?.substring(0, 5) || cita.hora,
      motivo: cita.motivo || '',
      estado: cita.estado,
      pacienteId: cita.pacienteId,
      odontologoId: cita.odontologoId,
    });
    setError('');
    setModalOpen(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      pacienteId: Number(form.pacienteId),
      odontologoId: Number(form.odontologoId),
    };
    try {
      if (editingId) {
        await axiosClient.put(`/api/citas/${editingId}`, payload);
      } else {
        await axiosClient.post('/api/citas', payload);
      }
      setModalOpen(false);
      cargarCitas();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar cita');
    }
  };

  const cancelarCita = async (cita) => {
    if (!confirm(`¿Cancelar cita de ${cita.pacienteNombre}?`)) return;
    try {
      await axiosClient.patch(`/api/citas/${cita.id}/cancelar`);
      cargarCitas();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo cancelar');
    }
  };

  const citasFiltradas =
    filtroEstado === 'TODOS'
      ? citas
      : citas.filter((c) => c.estado === filtroEstado);

  const fechaLabel = new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Agenda</h2>
          <p className="text-slate-400 text-sm mt-1">Gestiona citas por fecha</p>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Nueva Cita
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1">Odontólogo</label>
          <select
            value={odontologoId}
            onChange={(e) => setOdontologoId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white min-w-[200px]"
          >
            <option value="">Todos</option>
            {odontologos.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombres} {o.apellidos}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-slate-400 mr-1">Filtrar estado:</span>
        <button
          type="button"
          onClick={() => setFiltroEstado('TODOS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            filtroEstado === 'TODOS' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          Todos
        </button>
        {ESTADOS_CITA.map((estado) => {
          const styles = getEstadoCitaStyles(estado);
          return (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                filtroEstado === estado ? styles.badge : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {estadoCitaLabels[estado]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-500">
        {ESTADOS_CITA.map((estado) => {
          const styles = getEstadoCitaStyles(estado);
          return (
            <span key={estado} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm border-l-4 ${styles.card}`} />
              {estadoCitaLabels[estado]} (HU08)
            </span>
          );
        })}
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4 capitalize">{fechaLabel}</h3>
        {loading ? (
          <p className="text-slate-500">Cargando citas...</p>
        ) : (
          <CitaList citas={citasFiltradas} onEdit={abrirEditar} onCancel={cancelarCita} />
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Cita' : 'Nueva Cita'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <form onSubmit={guardar} className="space-y-4">
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
                <label className="text-sm text-slate-400">Paciente *</label>
                <select
                  required
                  value={form.pacienteId}
                  onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Seleccionar...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} — {p.dni}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-400">Odontólogo *</label>
                <select
                  required
                  value={form.odontologoId}
                  onChange={(e) => setForm({ ...form, odontologoId: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Seleccionar...</option>
                  {odontologos.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombres} {o.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-400">Motivo / Tratamiento</label>
                <input
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Ej: Limpieza + Evaluación"
                />
              </div>
              {editingId && (
                <div>
                  <label className="text-sm text-slate-400">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {ESTADOS_CITA.map((e) => (
                      <option key={e} value={e}>
                        {estadoCitaLabels[e]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
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
