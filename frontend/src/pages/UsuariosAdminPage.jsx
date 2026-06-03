import { useEffect, useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import Modal from '../components/ui/Modal';

const ROLES_DISPONIBLES = ['ADMINISTRADOR', 'ODONTOLOGO', 'RECEPCIONISTA'];

const emptyForm = {
  username: '',
  password: '',
  nombres: '',
  apellidos: '',
  email: '',
  activo: true,
  roles: [],
};

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/api/usuarios');
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (u) => {
    setEditingId(u.id);
    setForm({
      username: u.username,
      password: '',
      nombres: u.nombres,
      apellidos: u.apellidos,
      email: u.email || '',
      activo: u.activo,
      roles: [...u.roles],
    });
    setError('');
    setModalOpen(true);
  };

  const toggleRol = (rol) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(rol)
        ? prev.roles.filter((r) => r !== rol)
        : [...prev.roles, rol],
    }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    if (form.roles.length === 0) {
      setError('Seleccione al menos un rol');
      return;
    }
    try {
      const payload = { ...form };
      if (editingId && !payload.password) {
        delete payload.password;
      }
      if (editingId) {
        await axiosClient.put(`/api/usuarios/${editingId}`, payload);
      } else {
        await axiosClient.post('/api/usuarios', payload);
      }
      setModalOpen(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Usuarios y Roles</h2>
          <p className="text-slate-400 text-sm mt-1">Gestión de accesos del sistema (HU02)</p>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr className="text-left text-slate-400 text-xs uppercase">
              <th className="px-5 py-3">Usuario</th>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Roles</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 text-white font-medium">{u.username}</td>
                  <td className="px-5 py-4">
                    {u.nombres} {u.apellidos}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className="text-xs bg-cyan-950/50 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.activo
                          ? 'bg-emerald-950/50 text-emerald-300'
                          : 'bg-red-950/50 text-red-300'
                      }`}
                    >
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => abrirEditar(u)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Usuario *</label>
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">
                  Contraseña {editingId ? '(vacío = sin cambio)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
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
              <div className="col-span-2">
                <label className="text-sm text-slate-400">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Roles *</label>
              <div className="flex flex-wrap gap-2">
                {ROLES_DISPONIBLES.map((rol) => (
                  <button
                    key={rol}
                    type="button"
                    onClick={() => toggleRol(rol)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      form.roles.includes(rol)
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {rol}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="rounded"
              />
              Usuario activo
            </label>

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
