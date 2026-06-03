import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';

const emptyForm = {
  nombres: '',
  apellidos: '',
  dni: '',
  telefono: '',
  email: '',
  fechaNacimiento: '',
};

export default function PacientesPage() {
  const { canWritePacientes } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/api/pacientes', {
        params: { busqueda: busqueda || undefined, size: 100 },
      });
      setPacientes(data.content || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(cargar, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const abrirCrear = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (p) => {
    setEditingId(p.id);
    setForm({
      nombres: p.nombres,
      apellidos: p.apellidos,
      dni: p.dni,
      telefono: p.telefono || '',
      email: p.email || '',
      fechaNacimiento: p.fechaNacimiento || '',
    });
    setError('');
    setModalOpen(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await axiosClient.put(`/api/pacientes/${editingId}`, form);
      } else {
        await axiosClient.post('/api/pacientes', form);
      }
      setModalOpen(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este paciente?')) return;
    try {
      await axiosClient.delete(`/api/pacientes/${id}`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Pacientes</h2>
          <p className="text-slate-400 text-sm mt-1">Registro y gestión de pacientes</p>
        </div>
        {canWritePacientes && (
          <button
            onClick={abrirCrear}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Paciente
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr className="text-left text-slate-400 text-xs uppercase">
              <th className="px-5 py-3">Nombres</th>
              <th className="px-5 py-3">Apellidos</th>
              <th className="px-5 py-3">DNI</th>
              <th className="px-5 py-3">Teléfono</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : pacientes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                  No hay pacientes registrados
                </td>
              </tr>
            ) : (
              pacientes.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-5 py-4 text-white">{p.nombres}</td>
                  <td className="px-5 py-4">{p.apellidos}</td>
                  <td className="px-5 py-4">{p.dni}</td>
                  <td className="px-5 py-4">{p.telefono || '-'}</td>
                  <td className="px-5 py-4">{p.email || '-'}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/pacientes/${p.id}`}
                      className="text-cyan-400 hover:text-cyan-300 mr-3 inline-flex items-center gap-1 text-xs"
                      title="Ver ficha clínica"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                    {canWritePacientes && (
                      <>
                        <button
                          onClick={() => abrirEditar(p)}
                          className="text-slate-400 hover:text-white mr-3"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => eliminar(p.id)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Paciente' : 'Nuevo Paciente'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Nombres *</label>
                <input
                  required
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Apellidos *</label>
                <input
                  required
                  value={form.apellidos}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">DNI *</label>
                <input
                  required
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500"
              >
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
