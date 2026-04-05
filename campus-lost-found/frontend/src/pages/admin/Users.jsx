import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Ban, ShieldCheck, Loader2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users', { params: { search, limit: 50 } })
      .then(res => { setUsers(res.data.users || []); setTotal(res.data.total || 0); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleBan = async (id) => {
    const reason = prompt('Ban reason (optional):') || '';
    try { await api.patch(`/admin/users/${id}/ban`, { reason }); toast.success('User banned'); fetchUsers(); }
    catch { toast.error('Failed'); }
  };

  const handleUnban = async (id) => {
    try { await api.patch(`/admin/users/${id}/unban`); toast.success('User unbanned'); fetchUsers(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Users<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">{total} registered users.</p>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body" style={{ borderRadius: RADIUS.wobblySm }} />
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div> : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u._id} className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-between gap-4" style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-[#2d5da1] text-white flex items-center justify-center font-bold border-2 border-[#2d2d2d]" style={{ borderRadius: RADIUS.blob }}>{u.name?.[0]?.toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="font-bold dark:text-white">{u.name}</p>
                  <p className="text-sm text-gray-400">{u.email} · joined {formatDate(u.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={u.role === 'admin' ? 'info' : 'default'}>{u.role}</Badge>
                {u.isBanned ? (
                  <Button size="sm" variant="secondary" onClick={() => handleUnban(u._id)}><ShieldCheck size={14} /> Unban</Button>
                ) : u.role !== 'admin' ? (
                  <Button size="sm" variant="danger" onClick={() => handleBan(u._id)}><Ban size={14} /> Ban</Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}