import { useState, useEffect } from 'react';
import { Handshake, Loader2, Clock, CheckCircle } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

const statusVariant = { pending: 'warning', scheduled: 'info', completed: 'success' };

export default function Handovers() {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHandovers = () => {
    setLoading(true);
    api.get('/handovers', { params: { limit: 50 } })
      .then(res => setHandovers(res.data.handovers || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHandovers(); }, []);

  const handleSchedule = async (id) => {
    const location = prompt('Pickup location:');
    if (!location) return;
    const date = prompt('Date & time (YYYY-MM-DDTHH:mm):');
    if (!date) return;
    try {
      await api.patch(`/handovers/${id}/schedule`, { location, scheduledAt: new Date(date).toISOString() });
      toast.success('Handover scheduled');
      fetchHandovers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Handovers<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">Schedule and track item pickups.</p>
      </div>
      <div className="space-y-3">
        {handovers.length === 0 ? <p className="text-gray-400 text-center py-8">No handovers yet.</p> : handovers.map(h => (
          <div key={h._id} className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-between gap-4" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex items-center gap-3">
              <Handshake size={20} className="text-emerald-600" />
              <div>
                <p className="font-bold dark:text-white">{h.lostReport?.itemName || 'Item'}</p>
                <p className="text-sm text-gray-400">Owner: {h.owner?.name || '?'} · {h.location || 'No location set'} · {h.scheduledAt ? formatDateTime(h.scheduledAt) : 'Not scheduled'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[h.status] || 'default'}>{h.status}</Badge>
              {h.status === 'pending' && <Button size="sm" onClick={() => handleSchedule(h._id)}><Clock size={14} /> Schedule</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}