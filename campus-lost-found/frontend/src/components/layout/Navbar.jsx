import React, { useState, useEffect } from 'react';
import { LogOut, Moon, Sun, Bell, User } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { RADIUS } from '../../utils/constants';
import api from '../../api/http';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setUnreadCount(res.data.count || 0))
      .catch(() => {}); // silent fail
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const basePath = user?.role === 'admin' ? '/admin' : '/student';

  return (
    <header className="bg-white dark:bg-[#1a1a2e] border-b-2 border-[#2d2d2d] dark:border-[#444] flex items-center justify-between px-6 py-3 sticky top-0 z-50 w-full transition-colors">
      {/* Mobile brand */}
      <div className="lg:hidden text-2xl font-black text-[#2d2d2d] dark:text-white">
        Find<span className="text-[#2d5da1]">HUB</span>
      </div>

      {/* Spacer on desktop */}
      <div className="hidden lg:block" />

      {/* Right side controls */}
      <div className="flex items-center gap-4 ml-auto">

        {/* Dark / Light toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="p-2 border-2 border-[#2d2d2d] dark:border-gray-500 bg-gray-100 dark:bg-gray-800 text-[#2d2d2d] dark:text-yellow-300 hover:scale-105 transition-all"
          style={{ borderRadius: RADIUS.wobblySm }}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
        </button>

        {/* Notification bell */}
        <Link
          to={`${basePath}/notifications`}
          className="relative p-2 border-2 border-[#2d2d2d] dark:border-gray-500 bg-gray-100 dark:bg-gray-800 text-[#2d2d2d] dark:text-white hover:scale-105 transition-all"
          style={{ borderRadius: RADIUS.wobblySm }}
          title="Notifications"
        >
          <Bell size={18} strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#ff4d4d] text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile link with username */}
        <Link
          to={`${basePath}/profile`}
          className="flex items-center gap-2 px-3 py-2 border-2 border-transparent hover:border-[#2d2d2d] dark:hover:border-gray-500 transition-all"
          style={{ borderRadius: RADIUS.wobblySm }}
        >
          <div
            className="w-8 h-8 bg-[#2d5da1] text-white flex items-center justify-center font-bold text-sm border-2 border-[#2d2d2d]"
            style={{ borderRadius: RADIUS.blob }}
          >
            {user?.name?.[0]?.toUpperCase() || <User size={14} />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-bold text-sm text-[#2d2d2d] dark:text-white leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{user?.role || 'student'}</p>
          </div>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-[#2d2d2d] hover:bg-[#ff4d4d] text-white flex items-center gap-2 px-4 py-2 font-bold transition-colors border-2 border-[#2d2d2d]"
          style={{ borderRadius: RADIUS.wobblySm }}
          title="Logout"
        >
          <LogOut size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}
