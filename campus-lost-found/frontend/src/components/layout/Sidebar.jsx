import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, FileSearch, Eye, ShieldCheck, 
  MessageCircle, Bell, User, LayoutDashboard, Search
} from 'lucide-react';
import { RADIUS } from '../../utils/constants';

const navItems = [
  { label: 'Dashboard',   path: '/student',         icon: Home,           end: true },
  { label: 'Report Lost', path: '/student/report-lost', icon: FileSearch },
  { label: 'Report Found',path: '/student/report-found',icon: Eye },
  { label: 'Matches',     path: '/student/matches',     icon: ShieldCheck },
  { label: 'Community',   path: '/student/community',   icon: MessageCircle },
  { label: 'Notifications',path: '/student/notifications',icon: Bell },
  { label: 'My Profile',  path: '/student/profile',     icon: User },
];

export default function Sidebar({ className = '' }) {
  return (
    <aside className={`w-64 border-r-2 border-[#2d2d2d] bg-[#fdfbf7] p-6 lg:flex flex-col gap-8 hidden ${className}`}>
      
      {/* Brand logo */}
      <div className="flex items-center gap-2 px-2">
        <div className="bg-[#ff4d4d] w-8 h-8 flex items-center justify-center border-2 border-[#2d2d2d] transform -rotate-3" style={{ borderRadius: RADIUS.wobblySm }}>
          <Search size={18} strokeWidth={3} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-wider text-[#2d2d2d]">
          Find<span className="text-[#2d5da1]">HUB</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-3">
        {navItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink 
            key={label}
            to={path}
            end={end}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 font-bold text-lg border-2 transition-all group
              ${isActive 
                ? 'bg-white border-[#2d2d2d] text-[#2d2d2d]' 
                : 'border-transparent text-gray-500 hover:border-[#2d2d2d] hover:bg-white hover:text-[#2d2d2d]'
              }
            `}
            style={{ borderRadius: RADIUS.wobblySm }}
          >
            <Icon size={20} strokeWidth={2.5} className="group-hover:text-[#ff4d4d] transition-colors" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="bg-[#eef3f9] border-2 border-[#2d2d2d] p-4 text-center mt-auto shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobbly }}>
        <p className="font-bold text-[#2d2d2d] text-sm mb-1 uppercase tracking-wider">Need Help?</p>
        <p className="text-gray-600 text-sm font-medium">Check our public <NavLink to="/faq" className="text-[#2d5da1] underline decoration-2">FAQ</NavLink>.</p>
      </div>

    </aside>
  );
}
