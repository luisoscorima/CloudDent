import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

function renderRoute(authValue) {
  useAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter>
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('muestra Cargando cuando loading es true', () => {
    renderRoute({
      loading: true,
      isAuthenticated: false,
      hasRole: () => false,
    });

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('redirige a login cuando no esta autenticado', () => {
    renderRoute({
      loading: false,
      isAuthenticated: false,
      hasRole: () => false,
    });

    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });
});
