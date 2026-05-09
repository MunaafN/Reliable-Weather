import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, GitCompare, Star, Radio, History, ChevronLeft, ChevronRight } from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/compare', icon: GitCompare, label: 'Compare' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/saved', icon: Star, label: 'Saved' },
  { to: '/radar', icon: Radio, label: 'Radar' },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-white/[0.06] bg-surface/40 backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[200px]'}`}>
        <nav className="flex-1 flex flex-col gap-1 p-3 pt-4">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} strokeWidth={1.8} />
              {!collapsed && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap overflow-hidden text-sm">
                  {label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => setCollapsed(c => !c)}
          className="flex items-center justify-center p-3 m-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.06]">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-t border-white/[0.06] px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all ${isActive ? 'text-brand-blue' : 'text-slate-500'}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
