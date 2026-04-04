import { Handshake, MapPin, Calendar, User, CheckCircle2, Clock, XCircle, Package } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';

const mockHandovers = [
  { id: 'h1', itemName: 'Blue JBL Earbuds', owner: 'Rahul S.', finder: 'Anonymous', location: 'Admin Office', scheduledAt: new Date(Date.now() + 86400000), status: 'scheduled', supervised: true },
  { id: 'h2', itemName: 'Student ID Card', owner: 'Priya M.', finder: 'Amit K.', location: 'Security Desk', scheduledAt: new Date(Date.now() - 172800000), status: 'completed', supervised: false },
  { id: 'h3', itemName: 'MacBook Charger', owner: 'Neha R.', finder: 'Walk-in', location: 'Pending', scheduledAt: null, status: 'pending_schedule', supervised: true },
  { id: 'h4', itemName: 'Red Keychain', owner: 'Vikram D.', finder: 'Anonymous', location: 'Admin Office', scheduledAt: new Date(Date.now() - 86400000), status: 'disputed', supervised: true },
];

const statusCfg = {
  scheduled:        { variant: 'warning', label: 'Scheduled', icon: Clock },
  completed:        { variant: 'success', label: 'Completed', icon: CheckCircle2 },
  pending_schedule: { variant: 'default', label: 'Needs Scheduling', icon: Calendar },
  disputed:         { variant: 'accent',  label: 'Disputed', icon: XCircle },
};

export default function Handovers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Handovers<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Manage item pickup scheduling and completion.</p>
      </div>

      <div className="space-y-4">
        {mockHandovers.map((h, i) => {
          const cfg = statusCfg[h.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={h.id} className={`relative bg-white border-2 border-pencil p-5 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`} style={{ borderRadius: RADIUS.wobblyMd }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 bg-postit border-2 border-pencil flex items-center justify-center" style={{ borderRadius: RADIUS.blob }}>
                    <Handshake size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold">{h.itemName}</h3>
                    <div className="space-y-1 mt-1 font-body text-sm text-pencil/50">
                      <p className="flex items-center gap-1"><User size={12} /> Owner: {h.owner} | Finder: {h.finder}</p>
                      {h.location && <p className="flex items-center gap-1"><MapPin size={12} /> {h.location}</p>}
                      {h.scheduledAt && <p className="flex items-center gap-1"><Calendar size={12} /> {formatDateTime(h.scheduledAt)}</p>}
                    </div>
                    {h.supervised && <Badge variant="info">Admin supervised</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={cfg.variant}><StatusIcon size={14} className="inline mr-1" />{cfg.label}</Badge>
                  {h.status === 'pending_schedule' && <Button size="sm">Schedule</Button>}
                  {h.status === 'scheduled' && <Button size="sm" variant="accent"><CheckCircle2 size={14} /> Mark Complete</Button>}
                  {h.status === 'disputed' && <Button size="sm" variant="accent">Resolve</Button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}