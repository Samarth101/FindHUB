import { useState, useEffect } from 'react';
import { FileSearch, Eye, Trash2, Loader2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

const statusVariant = { searching: 'warning', matched: 'info', returned: 'success', closed: 'default' };

export default function MyReports() {
  const [tab, setTab] = useState('lost');
  const [lostReports, setLostReports] = useState([]);
  const [lostTotal, setLostTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/lost/mine', { params: { limit: 50 } })
      .then(res => { setLostReports(res.data.reports || []); setLostTotal(res.data.total || 0); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      await api.delete(`/lost/${id}`);
      toast.success('Report deleted');
      setLostReports(prev => prev.filter(r => r._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const reports = tab === 'lost' ? lostReports : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-4xl font-bold dark:text-white">My Reports<span className="text-[#ff4d4d]">.</span></h1>

      <div className="flex gap-2">
        <Button variant={tab === 'lost' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('lost')}>
          <FileSearch size={18} strokeWidth={2.5} /> Lost ({lostTotal})
        </Button>
        <Button variant={tab === 'found' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('found')}>
          <Eye size={18} strokeWidth={2.5} /> Found (hidden)
        </Button>
      </div>

      {tab === 'found' ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-[#222] border-2 border-dashed border-gray-300 dark:border-gray-600" style={{ borderRadius: RADIUS.wobblyMd }}>
          <Eye size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 font-body text-lg">Found item reports are hidden for privacy.</p>
          <p className="text-gray-400 font-body text-sm">They exist in the database and are used for AI matching, but you cannot view them.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>
      ) : reports.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No reports yet. Report a lost item to get started.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <div key={r._id} className={`bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-between gap-4 ${i % 2 === 0 ? 'rotate-[0.1deg]' : '-rotate-[0.1deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex items-center gap-3 min-w-0">
                <FileSearch size={20} className="text-[#ff4d4d] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold dark:text-white truncate">{r.itemName}</p>
                  <p className="text-sm text-gray-400">{r.category} · {r.location} · {formatDate(r.dateLost)}</p>
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