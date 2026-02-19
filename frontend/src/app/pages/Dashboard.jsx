import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { GraduationCap, Users, Package, DollarSign, History, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../hooks';
import { logout } from '../store/slices/authSlice';

export function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard/subscriptions', icon: Users, label: 'Subscriptions' },
    { to: '/dashboard/modules', icon: Package, label: 'Modules' },
    { to: '/dashboard/billing', icon: DollarSign, label: 'Billing' },
    { to: '/dashboard/subscription-log', icon: History, label: 'Subscription Log' },
    { to: '/dashboard/billing-subscription-log', icon: History, label: 'Billing Subscription Log' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Navy header */}
      <header className="bg-[#0f172a] text-white sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white tracking-tight">LMS Admin Portal</h1>
              <p className="text-xs text-slate-400">Billing & Subscription Management</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-white/15 text-white border border-white/40 font-medium text-sm hover:bg-white/25 hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navy sidebar */}
        <aside className="w-64 bg-[#0f172a] border-r border-white/10 min-h-[calc(100vh-4rem)] flex-shrink-0">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-auto bg-slate-50/50">
          <div className="max-w-6xl mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
