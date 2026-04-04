import { GitCompare, Package, FileText, CheckCircle2, XCircle, Eye, Clock } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const mockMatches = [
  { id: 'm1', lostItem: 'Blue JBL Earbuds', foundItem: 'Wireless Earbuds (Blue)', score: 0.89, status: 'pending_verify', lostBy: 'Rahul S.', foundBy: 'Walk-in', time: new Date(Date.now() - 3600000) },
  { id: 'm2', lostItem: 'Student ID Card', foundItem: 'College ID (laminated)', score: 0.92, status: 'verified', lostBy: 'Priya M.', foundBy: 'Amit K.', time: new Date(Date.now() - 86400000) },
  { id: 'm3', lostItem: 'Red Keychain', foundItem: 'Keychain (3 keys)', score: 0.65, status: 'review', lostBy: 'Vikram D.', foundBy: 'Anonymous', time: new Date(Date.now() - 172800000) },
  { id: 'm4', lostItem: 'Black Backpack', foundItem: 'Backpack (dark)', score: 0.72, status: 'rejected', lostBy: 'Neha R.', foundBy: 'Walk-in', time: new Date(Date.now() - 259200000) },
];

const statusCfg = {
  pending_verify: { variant: 'warning', label: 'Pending Verify', icon: Clock },
  verified:       { variant: 'success', label: 'Verified', icon: CheckCircle2 },
  review:         { variant: 'info',    label: 'Manual Review', icon: Eye },
  rejected:       { variant: 'accent',  label: 'Rejected', icon: XCircle },
};

function ScoreBar({ score }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.85 ? 'bg-green-500' : score >= 0.6 ? 'bg-yellow-500' : 'bg-accent';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-3 bg-muted border border-pencil/30 overflow-hidden" style={{ borderRadius: '999px' }}>
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-body text-sm font-bold">{pct}%</span>
    </div>
  );
}

export default function Matches() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Match Overview<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">AI-generated matches between lost reports and found items.</p>
      </div>

      <div className="space-y-4">
        {mockMatches.map((match, i) => {
          const cfg = statusCfg[match.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={match.id} className={`relative bg-white border-2 border-pencil p-5 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`} style={{ borderRadius: RADIUS.wobblyMd }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Match pair */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Lost side */}
                    <div className="flex items-center gap-2 bg-accent/5 border border-accent/30 px-3 py-2" style={{ borderRadius: RADIUS.wobblySm }}>
                      <FileText size={16} strokeWidth={2.5} className="text-accent" />
                      <div>
                        <p className="font-body text-sm font-bold">{match.lostItem}</p>
                        <p className="font-body text-xs text-pencil/40">by {match.lostBy}</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1">
                      <GitCompare size={20} strokeWidth={2.5} className="text-ink" />
                    </div>

                    {/* Found side */}
                    <div className="flex items-center gap-2 bg-ink/5 border border-ink/30 px-3 py-2" style={{ borderRadius: RADIUS.wobblySm }}>
                      <Package size={16} strokeWidth={2.5} className="text-ink" />
                      <div>
                        <p className="font-body text-sm font-bold">{match.foundItem}</p>
                        <p className="font-body text-xs text-pencil/40">by {match.foundBy}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <ScoreBar score={match.score} />
                    <span className="font-body text-xs text-pencil/40">{timeAgo(match.time)}</span>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-3">
                  <Badge variant={cfg.variant}>
                    <StatusIcon size={14} className="inline mr-1" />
                    {cfg.label}
                  </Badge>
                  {match.status === 'review' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="accent">Approve</Button>
                      <Button size="sm" variant="ghost">Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}