import { ScrollText, Search, User, Clock, Shield, FileText, Package, Handshake } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const mockAudit = [
  { id: 'au1', action: 'Approved claim', details: 'Approved claim #42 for Student ID Card', actor: 'Admin User', target: 'Priya M.', time: new Date(Date.now() - 1800000), type: 'claim' },
  { id: 'au2', action: 'Banned user', details: 'Banned Neha R. for rate limit abuse', actor: 'Admin User', target: 'Neha R.', time: new Date(Date.now() - 3600000), type: 'user' },
  { id: 'au3', action: 'Removed content', details: 'Removed spam reply from community thread', actor: 'Admin User', target: 'SpamBot420', time: new Date(Date.now() - 7200000), type: 'moderation' },
  { id: 'au4', action: 'Completed handover', details: 'Marked handover for MacBook Charger as completed', actor: 'Admin User', target: 'Walk-in', time: new Date(Date.now() - 86400000), type: 'handover' },
  { id: 'au5', action: 'Manual match override', details: 'Forced match between Red Keychain reports', actor: 'Admin User', target: 'System', time: new Date(Date.now() - 172800000), type: 'match' },
  { id: 'au6', action: 'Found item intake', details: 'Recorded new found item: Blue Umbrella', actor: 'Admin User', target: '-', time: new Date(Date.now() - 259200000), type: 'intake' },
];

const typeIcon = {
  claim: FileText, user: User, moderation: Shield,
  handover: Handshake, match: Package, intake: Package,
};
const typeColor = {
  claim: 'bg-yellow-100 text-yellow-700', user: 'bg-accent/10 text-accent',
  moderation: 'bg-blue-100 text-blue-700', handover: 'bg-green-100 text-green-700',
  match: 'bg-ink/10 text-ink', intake: 'bg-postit text-pencil',
};

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Audit Logs<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Complete history of admin actions for accountability.</p>
      </div>

      <div className="relative">
        <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-pencil/40" />
        <input type="text" placeholder="Search audit logs..." className="w-full pl-12 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand" style={{ borderRadius: RADIUS.wobblySm }} />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-muted" />

        <div className="space-y-4">
          {mockAudit.map((entry, i) => {
            const Icon = typeIcon[entry.type] || ScrollText;
            const colorCls = typeColor[entry.type] || 'bg-muted text-pencil';
            return (
              <div key={entry.id} className="relative pl-14">
                {/* Timeline dot */}
                <div className={`absolute left-3 top-4 w-7 h-7 border-2 border-pencil flex items-center justify-center z-10 ${colorCls}`} style={{ borderRadius: RADIUS.blob }}>
                  <Icon size={12} strokeWidth={2.5} />
                </div>

                <div className={`bg-white border-2 border-pencil p-4 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.15deg]' : '-rotate-[0.15deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-heading text-lg font-bold">{entry.action}</p>
                        <Badge variant="default">{entry.type}</Badge>
                      </div>
                      <p className="font-body text-base text-pencil/70">{entry.details}</p>
                      <div className="flex gap-4 mt-1 font-body text-sm text-pencil/40">
                        <span className="flex items-center gap-1"><User size={12} /> {entry.actor}</span>
                        <span>Target: {entry.target}</span>
                      </div>
                    </div>
                    <span className="font-body text-sm text-pencil/40 flex items-center gap-1 flex-shrink-0">
                      <Clock size={12} /> {timeAgo(entry.time)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}