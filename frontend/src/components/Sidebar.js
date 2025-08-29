import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const linkBase = 'block px-4 py-2 rounded-lg transition-colors text-sm';
  const active = 'bg-white/20 text-white';
  const inactive = 'text-white/80 hover:bg-white/10';

  return (
    <aside className="w-full md:w-72 shrink-0 md:sticky md:top-6 md:self-start md:h-[calc(100vh-4rem)]">
      <nav className="backdrop-blur bg-white/10 rounded-xl p-4 border border-white/10 h-full flex flex-col gap-2 overflow-y-auto">
        <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          Home
        </NavLink>
        <NavLink to="/compare" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          Compare
        </NavLink>
        <NavLink to="/moon" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          Moon
        </NavLink>
        <NavLink to="/news" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          News
        </NavLink>
        <NavLink to="/share" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          Share
        </NavLink>
        <NavLink to="/reminders" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
          Reminders
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;


