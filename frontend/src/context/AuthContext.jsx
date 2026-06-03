import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  useEffect(() => {
    const init = async () => {
      if (token && !usuario) {
        try {
          const { data } = await axiosClient.get('/api/auth/me');
          setUsuario(data);
          localStorage.setItem('usuario', JSON.stringify(data));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await axiosClient.post('/api/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setToken(data.token);
    setUsuario(data.usuario);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!usuario?.roles) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.some((r) => usuario.roles.includes(r));
    },
    [usuario]
  );

  const canWritePacientes = hasRole(['ADMINISTRADOR', 'RECEPCIONISTA']);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        canWritePacientes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
