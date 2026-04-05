import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, FileSearch, Eye, ShieldCheck,
  MessageCircle, Bell, User, Search, Package,
  Users, AlertTriangle, ScrollText, TrendingUp,
  Handshake, MessageSquare, ClipboardList,
  PanelLeftClose, PanelLeftOpen, Menu, X
} from 'lucide-react';
import { RADIUS } from '../../utils/constants';

const studentItems = [
  { label: 'Dashboard',     path: '/student',               icon: Home,           end: true },
  { label: 'Report Lost',   path: '/student/report-lost',   icon: FileSearch },
  { label: 'Report Found',  path: '/student/report-found',  icon: Eye },
  { label: 'My Reports',    path: '/student/my-reports',    icon: ClipboardList },
  { label: 'Matches',       path: '/student/matches',       icon: ShieldCheck },
  { label: 'Handovers',     path: '/student/handover',      icon: Handshake },
  { label: 'Chat',          path: '/student/chat',          icon: MessageSquare },
  { label: 'Community',     path: '/student/community',     icon: MessageCircle },
  { label: 'Notifications', path: '/student/notifications', icon: Bell },
  { label: 'My Profile',    path: '/student/profile',       icon: User },
];

const adminItems = [
  { label: 'Dashboard',     path: '/admin',               icon: Home,           end: true },
  { label: 'Found Intake',  path: '/admin/found-intake',  icon: Package },
  { label: 'Found Items',   path: '/admin/found-items',   icon: Eye },
  { label: 'Lost Reports',  path: '/admin/lost-reports',  icon: FileSearch },
  { label: 'Matches',       path: '/admin/matches',       icon: ShieldCheck },
  { label: 'Claims',        path: '/admin/claims',        icon: ClipboardList },
  { label: 'Handovers',     path: '/admin/handovers',     icon: Handshake },
  { label: 'Users',         path: '/admin/users',         icon: Users },
  { label: 'Moderation',    path: '/admin/moderation',    icon: AlertTriangle },
  { label: 'Chat Logs',     path: '/admin/chat-logs',     icon: MessageSquare },
  { label: 'Analytics',     path: '/admin/analytics',     icon: TrendingUp },
  { label: 'Audit Logs',    path: '/admin/audit-logs',    icon: ScrollText },
];

export default function Sidebar({ isAdmin = false }) {
  const items = isAdmin ? adminItems : studentItems;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (onNavClick) => (
    <>
      {/* Brand logo */}
      <div className={`flex items-center gap-2 px-2 ${collapsed ? 'justify-center' : ''}`}>
        <div className="bg-[#ff4d4d] w-8 h-8 flex items-center justify-center border-2 border-[#2d2d2d] transform -rotate-3 flex-shrink-0" style={{ borderRadius: RADIUS.wobblySm }}>
          <Search size={18} strokeWidth={3} className="text-white" />
        </div>
        {!collapsed && (
          <h1 className="text-2xl font-black tracking-wider text-[#2d2d2d]">
            Find<span className="text-[#2d5da1]">HUB</span>
          </h1>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className={`text-center text-xs font-bold uppercase tracking-widest py-1.5 border-2 ${isAdmin ? 'bg-red-50 text-red-600 border-red-300' : 'bg-blue-50 text-[#2d5da1] border-blue-300'}`} style={{ borderRadius: RADIUS.wobblySm }}>
          {isAdmin ? '🔒 Admin Panel' : '👤 Student'}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onNavClick}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `
              flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-3' : 'px-4'} py-2.5 font-bold text-sm border-2 transition-all group
              ${isActive
                ? 'bg-white border-[#2d2d2d] text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]'
                : 'border-transparent text-gray-500 hover:border-[#2d2d2d] hover:bg-white hover:text-[#2d2d2d]'
              }
            `}
            style={{ borderRadius: RADIUS.wobblySm }}
          >
            <Icon size={18} strokeWidth={2.5} className="group-hover:text-[#ff4d4d] transition-colors flex-shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!onNavClick && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-[#2d2d2d] border-2 border-transparent hover:border-gray-200 transition-all"
          style={{ borderRadius: RADIUS.wobblySm }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={18} /> <span className="text-xs font-bold">Collapse</span></>}
        </button>
      )}

      {/* Help box */}
      {!collapsed && (
        <div className="bg-[#eef3f9] border-2 border-[#2d2d2d] p-3 text-center shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobbly }}>
          <p className="font-bold text-[#2d2d2d] text-xs mb-1 uppercase tracking-wider">Need Help?</p>
          <p className="text-gray-600 text-xs font-medium">Check our <NavLink to="/faq" className="text-[#2d5da1] underline decoration-2">FAQ</NavLink>.</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-[#2d5da1] text-white border-2 border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] flex items-center justify-center hover:bg-[#1e4a85] transition-colors"
        style={{ borderRadius: RADIUS.blob }}
      >
        <Menu size={22} strokeWidth={2.5} />
      </button>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#fdfbf7] border-r-2 border-[#2d2d2d] p-5 flex flex-col gap-5 overflow-y-auto animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="self-end p-1 text-gray-400 hover:text-[#ff4d4d] transition-colors"
            >
              <X size={22} />
            </button>
            {sidebarContent(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Desktop sidebar — fixed position */}
      <aside
        className={`hidden lg:flex flex-col gap-5 bg-[#fdfbf7] border-r-2 border-[#2d2d2d] p-5 sticky top-0 h-screen overflow-y-auto transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-64'}`}
      >
        {sidebarContent(null)}
      </aside>
    </>
  );
}
