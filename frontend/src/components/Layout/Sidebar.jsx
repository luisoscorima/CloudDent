import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Panel Principal', roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ODONTOLOGO'] },
  { to: '/agenda', icon: CalendarDays, label: 'Agenda', roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ODONTOLOGO'] },
  { to: '/pacientes', icon: Users, label: 'Pacientes', roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ODONTOLOGO'] },
  { to: '/admin/usuarios', icon: Shield, label: 'Usuarios', roles: ['ADMINISTRADOR'] },
];

export default function Sidebar() {
  const { usuario, logout, hasRole } = useAuth();
  const itemsVisibles = navItems.filter((item) => hasRole(item.roles));
  const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}` : '';
  const rolLabel = usuario?.roles?.[0] || '';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=0D9488&color=fff&bold=true`;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="bg-cyan-600 p-2 rounded-lg shadow-lg">
          <span className="text-white font-bold text-sm">CD</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Cloud<span className="text-cyan-400">Dent</span>
        </span>
      </div>

      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 mb-6 flex items-center gap-3">
        <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-cyan-500/50" />
        <div>
          <p className="text-sm font-semibold text-white truncate">{nombreCompleto}</p>
          <p className="text-[10px] text-cyan-300/80">{rolLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {itemsVisibles.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive
                  ? 'bg-cyan-950/30 text-cyan-300 border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}
