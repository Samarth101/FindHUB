import { ClipboardCheck, User, Package, CheckCircle2, XCircle, Eye, Clock, BarChart3 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const mockClaims = [
  { id: 'c1', itemName: 'Blue JBL Earbuds', claimant: 'Rahul S.', matchScore: 89, verifyScore: 85, status: 'pending', answers: 4, time: new Date(Date.now() - 1800000) },
  { id: 'c2', itemName: 'Student ID Card', claimant: 'Priya M.', matchScore: 92, verifyScore: 95, status: 'approved', answers: 4, time: new Date(Date.now() - 86400000) },
  { id: 'c3', itemName: 'Red Keychain', claimant: 'Vikram D.', matchScore: 65, verifyScore: 40, status: 'rejected', answers: 3, time: new Date(Date.now() - 172800000) },
  { id: 'c4', itemName: 'Blue JBL Earbuds', claimant: 'Sanjay P.', matchScore: 89, verifyScore: 55, status: 'review', answers: 4, time: new Date(Date.now() - 3600000) },
];

const statusCfg = {
  pending:  { variant: 'warning', label: 'Pending', icon: Clock },
  approved: { variant: 'success', label: 'Approved', icon: CheckCircle2 },
  rejected: { variant: 'accent',  label: 'Rejected', icon: XCircle },
  review:   { variant: 'info',    label: 'Needs Review', icon: Eye },
};

function ScoreCircle({ value, label, color }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 border-[3px] ${color} flex items-center justify-center font-heading text-lg font-bold`} style={{ borderRadius: RADIUS.blob }}>
        {value}%
      </div>
      <span className="font-body text-xs text-pencil/40 mt-1">{label}</span>
    </div>
  );
}

export default function Claims() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Claims Review<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Review verification answers and approve or reject ownership claims.</p>
      </div>

      {/* Duplicate claim banner */}
      <div className="bg-postit border-2 border-pencil p-4 flex items-start gap-3 transform -rotate-[0.3deg]" style={{ borderRadius: RADIUS.wobblySm }}>
        <BarChart3 size={20} strokeWidth={2.5} className="text-pencil/60 flex-shrink-0 mt-0.5" />
        <p className="font-body text-sm text-pencil/70">
          <strong>Multi-claimant detected:</strong> Blue JBL Earbuds has 2 competing claims. Compare verification scores below.
        </p>
      </div>

      <div className="space-y-4">
        {mockClaims.map((claim, i) => {
          const cfg = statusCfg[claim.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={claim.id} className={`relative bg-white border-2 border-pencil p-5 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`} style={{ borderRadius: RADIUS.wobblyMd }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 bg-muted/50 border-2 border-muted flex items-center justify-center" style={{ borderRadius: RADIUS.blob }}>
                    <Package size={20} strokeWidth={2.5} className="text-pencil/50" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold">{claim.itemName}</h3>
                    <p className="font-body text-sm text-pencil/50 flex items-center gap-1"><User size={12} /> Claimed by: {claim.claimant}</p>
                    <p className="font-body text-xs text-pencil/40 mt-1">{claim.answers} questions answered - {timeAgo(claim.time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <ScoreCircle value={claim.matchScore} label="Match" color="border-ink" />
                  <ScoreCircle value={claim.verifyScore} label="Verify" color={claim.verifyScore >= 75 ? 'border-green-600' : claim.verifyScore >= 50 ? 'border-yellow-500' : 'border-accent'} />
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant={cfg.variant}>
                    <StatusIcon size={14} className="inline mr-1" />
                    {cfg.label}
                  </Badge>
                  {(claim.status === 'pending' || claim.status === 'review') && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="accent">Approve</Button>
                      <Button size="sm" variant="ghost">Reject</Button>
                      <Button size="sm" variant="secondary"><Eye size={14} /> Answers</Button>
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