import { useState, useEffect } from 'react';
import { FileSearch, Loader2, Trash2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

const statusVariant = { searching: 'warning', matched: 'info', returned: 'success', closed: 'default' };

export default function LostReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReports = () => {
    setLoading(true);
    const params = { limit: 30 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get('/lost', { params })
      .then(res => { setReports(res.data.reports || []); setTotal(res.data.total || 0); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Soft-delete this report?')) return;
    try {
      await api.delete(`/lost/${id}`);
      toast.success('Report deleted');
      fetchReports();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Lost Reports<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">{total} total reports.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="px-4 py-2 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body" style={{ borderRadius: RADIUS.wobblySm }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border-2 border-[#2d2d2d] bg-white font-body" style={{ borderRadius: RADIUS.wobblySm }}>
          <option value="">All statuses</option>
          <option value="searching">Searching</option>
          <option value="matched">Matched</option>
          <option value="returned">Returned</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div> : (
        <div className="space-y-3">
          {reports.length === 0 ? <p className="text-gray-400 text-center py-8">No reports found.</p> : reports.map((r, i) => (
            <div key={r._id} className={`bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-between gap-4 ${i % 2 === 0 ? 'rotate-[0.1deg]' : '-rotate-[0.1deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileSearch size={20} className="text-[#ff4d4d] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold dark:text-white truncate">{r.itemName}</p>
                  <p className="text-sm text-gray-400">{r.category} · {r.location} · {formatDate(r.dateLost)} · by {r.student?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={statusVariant[r.status] || 'default'}>{r.status}</Badge>
                <button onClick={() => handleDelete(r._id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}