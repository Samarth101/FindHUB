import {
  Package, FileText, GitCompare, ClipboardCheck, Handshake,
  Users, TrendingUp, AlertTriangle, Clock, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const stats = [
  { label: 'Total Lost Reports',   value: 127, icon: FileText,      color: 'bg-accent/10 text-accent',    border: 'border-accent',  change: '+12 this week' },
  { label: 'Found Items (Hidden)', value: 89,  icon: Package,       color: 'bg-ink/10 text-ink',          border: 'border-ink',     change: '+7 this week' },
  { label: 'Active Matches',       value: 34,  icon: GitCompare,    color: 'bg-postit text-pencil',       border: 'border-pencil',  change: '5 pending review' },
  { label: 'Pending Claims',       value: 8,   icon: ClipboardCheck,color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-600', change: '3 urgent' },
  { label: 'Completed Handovers',  value: 62,  icon: Handshake,     color: 'bg-green-100 text-green-700', border: 'border-green-700', change: '+4 this week' },
  { label: 'Registered Users',     value: 1234,icon: Users,         color: 'bg-blue-100 text-blue-700',   border: 'border-blue-700', change: '+23 new' },
];

const recentActions = [
  { id: 'a1', text: 'New match: Earbuds (89% confidence)',       type: 'match',    time: new Date(Date.now() - 600000) },
  { id: 'a2', text: 'Claim #42 submitted for review',            type: 'claim',    time: new Date(Date.now() - 1800000) },
  { id: 'a3', text: 'Handover completed: Student ID Card',       type: 'handover', time: new Date(Date.now() - 3600000) },
  { id: 'a4', text: 'Flagged community reply: spam detected',    type: 'flag',     time: new Date(Date.now() - 7200000) },
  { id: 'a5', text: 'New found item intake: MacBook charger',    type: 'intake',   time: new Date(Date.now() - 10800000) },
  { id: 'a6', text: 'User report: suspicious claim activity',    type: 'flag',     time: new Date(Date.now() - 14400000) },
];

const actionIcon = {
  match: GitCompare, claim: ClipboardCheck, handover: Handshake,
  flag: AlertTriangle, intake: Package,
};
const actionColor = {
  match: 'text-ink', claim: 'text-yellow-600', handover: 'text-green-600',
  flag: 'text-accent', intake: 'text-pencil',
};

const urgentItems = [
  { id: 'u1', text: '3 claims pending for > 24 hours', priority: 'high' },
  { id: 'u2', text: '2 flagged community posts need review', priority: 'medium' },
  { id: 'u3', text: '1 disputed handover', priority: 'high' },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Admin Dashboard<span className="text-accent">.</span></h1>
        <p className="font-body text-xl text-pencil/60 mt-1">Platform overview and actionable insights.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, border, change }, i) => (
          <div
            key={label}
            className={`relative bg-white border-2 ${border} p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-1 transition-all duration-100 ${i % 3 === 1 ? '-rotate-[0.5deg]' : 'rotate-[0.3deg]'}`}
            style={{ borderRadius: RADIUS.wobblyMd }}
          >
            <div className={`inline-flex p-2 mb-3 border-2 border-current ${color}`} style={{ borderRadius: RADIUS.blob }}>
              <Icon size={20} strokeWidth={2.5} />
            </div>
            <p className="font-heading text-3xl font-bold">{value.toLocaleString()}</p>
            <p className="font-body text-sm text-pencil/60">{label}</p>
            <p className="font-body text-xs text-pencil/40 mt-1 flex items-center gap-1">
              <ArrowUpRight size={12} /> {change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Urgent Attention */}
        <div className="relative bg-accent/5 border-2 border-accent p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="pin-tack" />
          <h2 className="font-heading text-2xl font-bold mb-4 pt-2 flex items-center gap-2">
            <AlertTriangle size={22} strokeWidth={2.5} className="text-accent" />
            Needs Attention
          </h2>
          <div className="space-y-3">
            {urgentItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-white border-2 border-dashed border-accent/30" style={{ borderRadius: RADIUS.wobblySm }}>
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${item.priority === 'high' ? 'bg-accent animate-pulse' : 'bg-yellow-500'}`} />
                <p className="font-body text-base">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="tape-strip" />
          <h2 className="font-heading text-2xl font-bold mb-4 pt-2 flex items-center gap-2">
            <TrendingUp size={22} strokeWidth={2.5} className="text-ink" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActions.map(action => {
              const Icon = actionIcon[action.type];
              return (
                <div key={action.id} className="flex items-start gap-3 py-2 border-b border-dashed border-muted last:border-0">
                  <div className={`flex-shrink-0 w-8 h-8 bg-muted/50 border-2 border-muted flex items-center justify-center mt-0.5 ${actionColor[action.type]}`} style={{ borderRadius: RADIUS.blob }}>
                    <Icon size={14} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-base">{action.text}</p>
                    <p className="font-body text-sm text-pencil/40">{timeAgo(action.time)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick bar chart placeholder */}
      <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
        <h2 className="font-heading text-2xl font-bold mb-6">Weekly Overview</h2>
        <div className="flex items-end gap-3 h-40">
          {[
            { day: 'Mon', lost: 5, found: 3 }, { day: 'Tue', lost: 8, found: 6 },
            { day: 'Wed', lost: 4, found: 7 }, { day: 'Thu', lost: 12, found: 5 },
            { day: 'Fri', lost: 9, found: 8 }, { day: 'Sat', lost: 3, found: 2 },
            { day: 'Sun', lost: 2, found: 1 },
          ].map(({ day, lost, found }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex gap-1 items-end w-full justify-center">
                <div className="w-4 bg-accent border border-pencil" style={{ height: `${lost * 8}px`, borderRadius: '4px 4px 0 0' }} title={`Lost: ${lost}`} />
                <div className="w-4 bg-ink border border-pencil" style={{ height: `${found * 8}px`, borderRadius: '4px 4px 0 0' }} title={`Found: ${found}`} />
              </div>
              <span className="font-body text-xs text-pencil/50">{day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-4 font-body text-sm">
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-accent border border-pencil" /> Lost</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-ink border border-pencil" /> Found</span>
        </div>
      </div>
    </div>
  );
}