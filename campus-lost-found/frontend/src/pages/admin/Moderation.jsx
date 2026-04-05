import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

export default function Moderation() {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFlagged = () => {
    setLoading(true);
    api.get('/admin/flagged')
      .then(res => setFlagged(res.data.threads || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFlagged(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this thread?')) return;
    try { await api.delete(`/admin/threads/${id}`); toast.success('Thread removed'); fetchFlagged(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Moderation<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">Review flagged content and take action. {flagged.length} items need attention.</p>
      </div>
      <div className="space-y-3">
        {flagged.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-body text-xl">No flagged content — all clear!</p>
          </div>
        ) : flagged.map(t => (
          <div key={t._id} className="bg-white dark:bg-[#222] border-2 border-orange-400 p-4 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold dark:text-white">{t.title}</p>
                <p className="text-sm text-gray-400">by {t.author?.name || 'Unknown'} · {timeAgo(t.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="accent">flagged</Badge>
                <Button size="sm" variant="danger" onClick={() => handleDelete(t._id)}><Trash2 size={14} /> Remove</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}