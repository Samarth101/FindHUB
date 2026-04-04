import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Package, AlertCircle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const mockMatches = [
  { id: 'm1', lostItemName: 'Blue JBL Earbuds', score: 0.89, status: 'pending', createdAt: new Date(Date.now() - 3600000), category: 'Electronics' },
  { id: 'm2', lostItemName: 'Black Backpack', score: 0.72, status: 'verified', createdAt: new Date(Date.now() - 86400000), category: 'Bags & Backpacks' },
  { id: 'm3', lostItemName: 'Student ID Card', score: 0.65, status: 'rejected', createdAt: new Date(Date.now() - 172800000), category: 'ID / Documents' },
];

const statusConfig = {
  pending:  { variant: 'warning', label: 'Awaiting verification', icon: Clock },
  verified: { variant: 'success', label: 'Verified', icon: ShieldCheck },
  rejected: { variant: 'accent',  label: 'Not a match', icon: AlertCircle },
};

function ScoreBar({ score }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.85 ? 'bg-green-500' : score >= 0.6 ? 'bg-yellow-500' : 'bg-accent';
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-3 bg-muted border border-pencil/30 overflow-hidden" style={{ borderRadius: '999px' }}>
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-body text-sm font-bold">{pct}%</span>
    </div>
  );
}

export default function Matches() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">My Matches<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Potential matches for your lost items. No found item details are shown - verify ownership to proceed.</p>
      </div>

      <div className="bg-ink/5 border-2 border-ink p-4 flex items-start gap-3" style={{ borderRadius: RADIUS.wobblySm }}>
        <ShieldCheck size={24} strokeWidth={2.5} className="text-ink flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-body text-base font-bold text-ink">Privacy notice</p>
          <p className="font-body text-sm text-pencil/70">You cannot see any found item details. The AI detected similarities between your report and a found submission. Answer the verification questions to prove ownership.</p>
        </div>
      </div>

      {mockMatches.length === 0 ? (
        <div className="text-center py-16">
          <Package size={56} strokeWidth={2} className="mx-auto text-pencil/15 mb-4" />
          <p className="font-heading text-2xl text-pencil/40">No matches yet</p>
          <p className="font-body text-lg text-pencil/30">Our AI is continuously scanning. You will be notified when a match is found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockMatches.map((match, i) => {
            const cfg = statusConfig[match.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={match.id}
                className={`relative bg-white border-2 border-pencil p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.3deg]' : '-rotate-[0.3deg]'}`}
                style={{ borderRadius: RADIUS.wobblyMd }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-postit border-2 border-pencil flex items-center justify-center" style={{ borderRadius: RADIUS.blob }}>
                      <Package size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold">{match.lostItemName}</h3>
                      <p className="font-body text-sm text-pencil/50 mb-2">{match.category} - {timeAgo(match.createdAt)}</p>
                      <ScoreBar score={match.score} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={cfg.variant}>
                      <StatusIcon size={14} className="inline mr-1" />
                      {cfg.label}
                    </Badge>
                    {match.status === 'pending' && (
                      <Link to={`/student/verify/${match.id}`}>
                        <Button size="sm" variant="accent">
                          Verify now <ArrowRight size={14} strokeWidth={3} />
                        </Button>
                      </Link>
                    )}
                    {match.status === 'verified' && (
                      <Link to="/student/chat">
                        <Button size="sm">Open chat</Button>
                      </Link>
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