import { useState } from 'react';
import { Users as UsersIcon, Search, Mail, Shield, Ban, CheckCircle2, UserCircle } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const mockUsers = [
  { id: 'u1', name: 'Rahul Sharma', email: 'rahul@college.edu', role: 'student', joinDate: '2026-01-15', lostCount: 3, foundCount: 1, status: 'active' },
  { id: 'u2', name: 'Priya Mehta', email: 'priya@college.edu', role: 'student', joinDate: '2026-02-01', lostCount: 1, foundCount: 2, status: 'active' },
  { id: 'u3', name: 'Amit Kumar', email: 'amit@college.edu', role: 'student', joinDate: '2026-01-20', lostCount: 0, foundCount: 3, status: 'active' },
  { id: 'u4', name: 'Neha Roy', email: 'neha@college.edu', role: 'student', joinDate: '2026-03-05', lostCount: 2, foundCount: 0, status: 'banned' },
  { id: 'u5', name: 'Admin User', email: 'admin@college.edu', role: 'admin', joinDate: '2025-08-01', lostCount: 0, foundCount: 0, status: 'active' },
];

export default function Users() {
  const [search, setSearch] = useState('');
  const filtered = mockUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleBan = (name) => toast.success(`${name} has been banned.`);
  const handleUnban = (name) => toast.success(`${name} has been unbanned.`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">User Management<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">{mockUsers.length} registered users.</p>
      </div>

      <div className="relative">
        <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-pencil/40" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-12 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand" style={{ borderRadius: RADIUS.wobblySm }} />
      </div>

      <div className="space-y-3">
        {filtered.map((user, i) => (
          <div key={user.id} className={`bg-white border-2 border-pencil p-4 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.15deg]' : '-rotate-[0.15deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 border-2 flex items-center justify-center font-heading text-lg font-bold ${user.role === 'admin' ? 'bg-ink text-white border-ink' : 'bg-postit border-pencil'}`} style={{ borderRadius: RADIUS.blob }}>
                  {user.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-lg font-bold">{user.name}</p>
                    {user.role === 'admin' && <Badge variant="info"><Shield size={10} className="inline" /> Admin</Badge>}
                    {user.status === 'banned' && <Badge variant="accent"><Ban size={10} className="inline" /> Banned</Badge>}
                  </div>
                  <p className="font-body text-sm text-pencil/50 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex gap-4 font-body text-sm text-pencil/50">
                  <span>Lost: {user.lostCount}</span>
                  <span>Found: {user.foundCount}</span>
                  <span>Joined: {formatDate(user.joinDate)}</span>
                </div>
                {user.role !== 'admin' && (
                  user.status === 'banned'
                    ? <Button size="sm" variant="secondary" onClick={() => handleUnban(user.name)}><CheckCircle2 size={14} /> Unban</Button>
                    : <Button size="sm" variant="ghost" onClick={() => handleBan(user.name)}><Ban size={14} /> Ban</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}