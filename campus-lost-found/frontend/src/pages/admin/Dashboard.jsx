import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileSearch, Eye, ShieldCheck, Handshake, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import api from '../../api/http';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Admin stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  const cards = [
    { label: 'Total Users',     value: stats?.users || 0,              icon: Users,          color: 'border-[#2d5da1] text-[#2d5da1]', bg: 'bg-blue-50' },
    { label: 'Lost Reports',    value: stats?.lost || 0,               icon: FileSearch,     color: 'border-[#ff4d4d] text-[#ff4d4d]', bg: 'bg-red-50' },
    { label: 'Found Items',     value: stats?.found || 0,              icon: Eye,            color: 'border-green-600 text-green-600', bg: 'bg-green-50' },
    { label: 'AI Matches',      value: stats?.matches || 0,            icon: ShieldCheck,    color: 'border-yellow-500 text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Pending Claims',  value: stats?.pendingClaims || 0,      icon: AlertTriangle,  color: 'border-orange-500 text-orange-500', bg: 'bg-orange-50' },
    { label: 'Completed Handovers', value: stats?.completedHandovers || 0, icon: Handshake, color: 'border-emerald-600 text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const quickLinks = [
    { label: 'Found Intake', path: '/admin/found-intake', icon: Eye },
    { label: 'Lost Reports', path: '/admin/lost-reports', icon: FileSearch },
    { label: 'Review Matches', path: '/admin/matches', icon: ShieldCheck },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#2d2d2d]">Admin Dashboard<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-xl text-gray-500 mt-1">System overview — all data from live database.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={label} className={`${bg} border-2 ${color} p-5 shadow-[2px_2px_0px_#2d2d2d] hover:shadow-[4px_4px_0px_#2d2d2d] hover:-translate-y-1 transition-all ${i % 2 === 0 ? 'rotate-[0.3deg]' : '-rotate-[0.3deg]'}`} style={{ borderRadius: RADIUS.wobblyMd }}>
            <div className={`inline-flex p-2 mb-3 border-2 border-current`} style={{ borderRadius: RADIUS.blob }}><Icon size={22} strokeWidth={2.5} /></div>
            <p className="font-heading text-3xl font-bold text-[#2d2d2d]">{value}</p>
            <p className="font-body text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-heading text-2xl font-bold mb-4 text-[#2d2d2d] flex items-center gap-2"><TrendingUp size={22} /> Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(({ label, path, icon: Icon }) => (
            <Link key={path} to={path}><Button size="md" variant="secondary"><Icon size={18} strokeWidth={2.5} /> {label}</Button></Link>
          ))}
        </div>
      </div>
    </div>
  );
}