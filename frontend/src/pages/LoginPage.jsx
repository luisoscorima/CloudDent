import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex bg-cyan-600 p-3 rounded-xl mb-4">
            <span className="text-white font-bold text-xl">CD</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Cloud<span className="text-cyan-400">Dent</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Sistema de gestión odontológica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/30 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700 text-xs text-slate-500">
          <p className="font-medium text-slate-400 mb-1">Usuarios demo (pass: Admin123!)</p>
          <p>admin · odontologo · recepcionista</p>
        </div>
      </div>
    </div>
  );
}
