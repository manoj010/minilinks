import { BarChart3, Link as LinkIcon, LogOut, Settings, UserCircle } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from '../../utils/auth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/dashboard/links', label: 'Links', icon: LinkIcon },
  { to: '/dashboard/profile', label: 'Profile', icon: Settings },
];

export function DashboardLayout() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-200 bg-white p-5 md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-600 text-white">
            <UserCircle size={22} />
          </div>
          <div>
            <p className="text-lg font-bold">MiniLinks</p>
            <p className="text-xs text-slate-500">Creator dashboard</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button className="btn-secondary absolute bottom-5 left-5 right-5" onClick={logout}>
          <LogOut size={17} /> Logout
        </button>
      </aside>

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-bold">MiniLinks</p>
          <button className="btn-secondary px-3" onClick={logout} aria-label="Logout">
            <LogOut size={17} />
          </button>
        </div>
        <nav className="grid grid-cols-3 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-semibold ${
                    isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </header>

      <main className="px-4 py-6 md:ml-64 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
