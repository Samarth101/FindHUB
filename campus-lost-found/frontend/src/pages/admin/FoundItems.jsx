import { useState, useEffect } from 'react';
import { Eye, Loader2, Trash2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

const statusVariant = { unmatched: 'warning', matched: 'info', returned: 'success', archived: 'default' };

export default function FoundItems() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchItems = () => {
    setLoading(true);
    const params = { limit: 30 };
    if (search) params.search = search;
    api.get('/found', { params })
      .then(res => { setItems(res.data.items || []); setTotal(res.data.total || 0); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [search]);

  const handleDelete = async (id) => {
    if (!confirm('Archive this found item?')) return;
    try { await api.delete(`/found/${id}`); toast.success('Archived'); fetchItems(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Found Items<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">Hidden database — only visible to admins. {total} total items.</p>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search found items..." className="px-4 py-2 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body w-full max-w-md" style={{ borderRadius: RADIUS.wobblySm }} />
      {loading ? <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div> : (
        <div className="space-y-3">
          {items.length === 0 ? <p className="text-gray-400 text-center py-8">No found items.</p> : items.map((f, i) => (
            <div key={f._id} className={`bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-between gap-4`} style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Eye size={20} className="text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold dark:text-white truncate">{f.itemName}</p>
                  <p className="text-sm text-gray-400">{f.category} · {f.location} · {formatDate(f.dateFound)} · by {f.submittedBy?.name || f.intakeAdmin?.name || 'Admin'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={statusVariant[f.status] || 'default'}>{f.status}</Badge>
                <button onClick={() => handleDelete(f._id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}