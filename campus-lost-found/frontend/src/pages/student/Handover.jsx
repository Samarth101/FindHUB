import { useState } from 'react';
import { Handshake, MapPin, Calendar, Clock, CheckCircle2, Package, User } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const mockHandovers = [
  {
    id: 'h1', itemName: 'Blue JBL Earbuds', status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000), location: 'Admin Office, Room 102',
    otherParty: 'Finder (anonymous)', notes: 'Bring college ID for verification.',
  },
  {
    id: 'h2', itemName: 'Student ID Card', status: 'completed',
    scheduledAt: new Date(Date.now() - 172800000), location: 'Security Desk',
    otherParty: 'Priya M.', notes: '',
  },
];

const statusCfg = {
  scheduled:  { variant: 'warning', label: 'Scheduled' },
  completed:  { variant: 'success', label: 'Completed' },
  cancelled:  { variant: 'accent',  label: 'Cancelled' },
};

export default function Handover() {
  const [confirming, setConfirming] = useState(null);

  const handleConfirm = async (id) => {
    setConfirming(id);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Handover confirmed! Item marked as returned.');
    setConfirming(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Handover<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Schedule and confirm item pickups.</p>
      </div>

      {mockHandovers.length === 0 ? (
        <div className="text-center py-16">
          <Handshake size={56} strokeWidth={2} className="mx-auto text-pencil/15 mb-4" />
          <p className="font-heading text-2xl text-pencil/40">No handovers yet</p>
          <p className="font-body text-lg text-pencil/30">Once a match is verified, a handover will be scheduled here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockHandovers.map((h, i) => {
            const cfg = statusCfg[h.status];
            return (
              <div
                key={h.id}
                className={`relative bg-white border-2 border-pencil p-6 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.3deg]' : '-rotate-[0.3deg]'}`}
                style={{ borderRadius: RADIUS.wobblyMd }}
              >
                {i === 0 && <div className="tape-strip" />}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-postit border-2 border-pencil flex items-center justify-center" style={{ borderRadius: RADIUS.blob }}>
                      <Package size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold">{h.itemName}</h3>
                      <div className="space-y-1 mt-2 font-body text-sm text-pencil/60">
                        <p className="flex items-center gap-2"><MapPin size={14} /> {h.location}</p>
                        <p className="flex items-center gap-2"><Calendar size={14} /> {formatDateTime(h.scheduledAt)}</p>
                        <p className="flex items-center gap-2"><User size={14} /> With: {h.otherParty}</p>
                      </div>
                      {h.notes && (
                        <p className="font-body text-sm text-ink mt-2 bg-ink/5 p-2 border border-ink/20" style={{ borderRadius: RADIUS.wobblySm }}>
                          {h.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    {h.status === 'scheduled' && (
                      <Button
                        size="sm" variant="accent"
                        onClick={() => handleConfirm(h.id)}
                        disabled={confirming === h.id}
                      >
                        {confirming === h.id ? 'Confirming...' : <><CheckCircle2 size={14} strokeWidth={3} /> Confirm received</>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}