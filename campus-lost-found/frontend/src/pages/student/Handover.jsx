import { useState, useEffect } from 'react';
import { Handshake, Loader2, CheckCircle, Clock, MapPin } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

const statusVariant = { pending: 'warning', scheduled: 'info', completed: 'success' };

export default function Handover() {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/handovers/mine')
      .then(res => setHandovers(res.data.handovers || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (id) => {
    try {
      await api.patch(`/handovers/${id}/confirm`);
      toast.success('Pickup confirmed! Item marked as returned.');
      setHandovers(prev => prev.map(h => h._id === id ? { ...h, status: 'completed' } : h));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold">Handovers<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">Track scheduled pickups for your items.</p>
      </div>

      {handovers.length === 0 ? (
        <div className="text-center py-16">
          <Handshake size={56} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-body text-xl">No handovers scheduled.</p>
          <p className="text-gray-300 font-body">Handovers are created after a claim is approved.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {handovers.map(h => (
            <div key={h._id} className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-5 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Handshake size={24} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold dark:text-white">{h.lostReport?.itemName || 'Item'}</p>
                    <div className="flex gap-3 text-sm text-gray-400 mt-1">
                      {h.location && <span className="flex items-center gap-1"><MapPin size={12} /> {h.location}</span>}
                      {h.scheduledAt && <span className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(h.scheduledAt)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[h.status] || 'default'}>{h.status}</Badge>
                  {h.status === 'scheduled' && (
                    <Button size="sm" variant="primary" onClick={() => handleConfirm(h._id)}><CheckCircle size={14} /> Confirm received</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}