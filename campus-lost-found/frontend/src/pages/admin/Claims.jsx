import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

const statusVariant = { pending: 'warning', review: 'warning', approved: 'success', rejected: 'accent' };

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = () => {
    setLoading(true);
    api.get('/claims', { params: { limit: 50 } })
      .then(res => setClaims(res.data.claims || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClaims(); }, []);

  const handleReview = async (id, decision) => {
    try {
      await api.patch(`/claims/${id}/review`, { decision });
      toast.success(`Claim ${decision}`);
      fetchClaims();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Claims<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">Review verification claims submitted by students.</p>
      </div>
      <div className="space-y-3">
        {claims.length === 0 ? <p className="text-gray-400 text-center py-8">No claims submitted yet.</p> : claims.map(c => (
          <div key={c._id} className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-5 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold dark:text-white">Claim by {c.claimant?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-400">Score: {Math.round((c.verifyScore || 0) * 100)}% · {timeAgo(c.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[c.status] || 'default'}>{c.status}</Badge>
                {(c.status === 'pending' || c.status === 'review') && (
                  <>
                    <Button size="sm" variant="primary" onClick={() => handleReview(c._id, 'approved')}><CheckCircle size={14} /> Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleReview(c._id, 'rejected')}><XCircle size={14} /> Reject</Button>
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