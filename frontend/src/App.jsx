import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PacientesPage from './pages/PacientesPage';
import AgendaPage from './pages/AgendaPage';
import UsuariosAdminPage from './pages/UsuariosAdminPage';
import PacienteDetallePage from './pages/PacienteDetallePage';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pacientes"
        element={
          <ProtectedRoute roles={['ADMINISTRADOR', 'RECEPCIONISTA', 'ODONTOLOGO']}>
            <Layout>
              <PacientesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pacientes/:id"
        element={
          <ProtectedRoute roles={['ADMINISTRADOR', 'RECEPCIONISTA', 'ODONTOLOGO']}>
            <Layout>
              <PacienteDetallePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute roles={['ADMINISTRADOR']}>
            <Layout>
              <UsuariosAdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Layout>
              <AgendaPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
