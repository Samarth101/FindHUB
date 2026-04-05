import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Loader2, Package } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

const statusVariant = { pending_verify: 'warning', verified: 'success', rejected: 'accent' };

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMatches = () => {
    setLoading(true);
    api.get('/matches', { params: { limit: 50 } })
      .then(res => { setMatches(res.data.matches || []); setTotal(res.data.total || 0); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleReview = async (id, decision) => {
    try {
      await api.patch(`/matches/${id}/review`, { decision });
      toast.success(`Match ${decision}`);
      fetchMatches();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">All Matches<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">{total} total AI-generated matches.</p>
      </div>
      <div className="space-y-3">
        {matches.length === 0 ? <p className="text-gray-400 text-center py-8">No matches in database.</p> : matches.map((m, i) => (
          <div key={m._id} className={`bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-5 shadow-[2px_2px_0px_#2d2d2d]`} style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Package size={20} className="text-yellow-500" />
                <div>
                  <p className="font-bold dark:text-white">Lost: {m.lostReport?.itemName || '?'} ↔ Found: {m.foundItem?.itemName || '?'}</p>
                  <p className="text-sm text-gray-400">Score: {Math.round((m.score || 0) * 100)}% · {m.lostReport?.category} · {timeAgo(m.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[m.status] || 'default'}>{m.status?.replace('_', ' ')}</Badge>
                {m.status === 'pending_verify' && (
                  <>
                    <Button size="sm" variant="accent" onClick={() => handleReview(m._id, 'verified')}><CheckCircle size={14} /> Verify</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleReview(m._id, 'rejected')}><XCircle size={14} /> Reject</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}