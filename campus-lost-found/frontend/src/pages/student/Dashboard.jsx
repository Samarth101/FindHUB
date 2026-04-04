import { Link } from 'react-router-dom';
import {
  FileSearch, Eye, ShieldCheck, MessageCircle,
  AlertTriangle, CheckCircle2, ArrowRight, TrendingUp, Package
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge  from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const stats = [
  { label: 'Lost Reports',    value: 3,  icon: FileSearch,    color: 'bg-accent/10 text-accent',     border: 'border-accent' },
  { label: 'Found Reports',   value: 1,  icon: Eye,           color: 'bg-ink/10 text-ink',           border: 'border-ink' },
  { label: 'Pending Matches', value: 2,  icon: ShieldCheck,   color: 'bg-postit text-pencil',        border: 'border-pencil' },
  { label: 'Items Returned',  value: 1,  icon: CheckCircle2,  color: 'bg-green-100 text-green-700',  border: 'border-green-700' },
];

const recentMatches = [
  { id: 'm1', itemName: 'Blue Earbuds',   score: 0.89, status: 'pending',   time: new Date(Date.now() - 3600000) },
  { id: 'm2', itemName: 'Black Backpack',  score: 0.72, status: 'verified',  time: new Date(Date.now() - 86400000) },
];

const recentActivity = [
  { id: 'a1', text: 'You reported a lost water bottle.',       time: new Date(Date.now() - 7200000),  icon: FileSearch },
  { id: 'a2', text: 'Match found for your blue earbuds!',      time: new Date(Date.now() - 3600000),  icon: ShieldCheck },
  { id: 'a3', text: 'Community thread got 3 new replies.',     time: new Date(Date.now() - 1800000),  icon: MessageCircle },
  { id: 'a4', text: 'Verification passed - chat unlocked!',    time: new Date(Date.now() - 86400000), icon: CheckCircle2 },
];

const statusColor = { pending: 'warning', verified: 'success', rejected: 'accent', manual_review: 'info' };

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Dashboard<span className="text-accent">.</span></h1>
        <p className="font-body text-xl text-pencil/60 mt-1">Welcome back! Here is what is happening with your items.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/student/report-lost"><Button size="md"><FileSearch size={18} strokeWidth={2.5} /> Report lost item</Button></Link>
        <Link to="/student/report-found"><Button variant="secondary" size="md"><Eye size={18} strokeWidth={2.5} /> Report found item</Button></Link>
        <Link to="/student/community"><Button variant="ghost" size="md"><MessageCircle size={18} strokeWidth={2.5} /> Community</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, border }, i) => (
          <div key={label} className={`relative bg-white border-2 ${border} p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-1 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`} style={{ borderRadius: RADIUS.wobblyMd }}>
            <div className={`inline-flex p-2 mb-3 border-2 border-current ${color}`} style={{ borderRadius: RADIUS.blob }}><Icon size={22} strokeWidth={2.5} /></div>
            <p className="font-heading text-3xl font-bold">{value}</p>
            <p className="font-body text-sm text-pencil/60">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="tape-strip" />
          <h2 className="font-heading text-2xl font-bold mb-4 pt-2 flex items-center gap-2"><ShieldCheck size={22} strokeWidth={2.5} className="text-ink" /> Recent Matches</h2>
          <div className="space-y-3">
            {recentMatches.map(({ id, itemName, score, status, time }) => (
              <div key={id} className="flex items-center justify-between p-3 border-2 border-dashed border-muted hover:border-pencil transition-colors" style={{ borderRadius: RADIUS.wobblySm }}>
                <div className="flex items-center gap-3">
                  <Package size={20} strokeWidth={2.5} className="text-pencil/50" />
                  <div>
                    <p className="font-body text-lg font-bold">{itemName}</p>
                    <p className="font-body text-sm text-pencil/50">{Math.round(score * 100)}% match - {timeAgo(time)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusColor[status]}>{status}</Badge>
                  {status === 'pending' && (<Link to={`/student/verify/${id}`}><button className="text-ink hover:text-accent transition-colors"><ArrowRight size={18} strokeWidth={3} /></button></Link>)}
                </div>
              </div>
            ))}
          </div>
          <Link to="/student/matches" className="block mt-4"><Button variant="ghost" size="sm" className="w-full">View all matches</Button></Link>
        </div>

        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="pin-tack" />
          <h2 className="font-heading text-2xl font-bold mb-4 pt-2 flex items-center gap-2"><TrendingUp size={22} strokeWidth={2.5} className="text-accent" /> Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map(({ id, text, time, icon: Icon }) => (
              <div key={id} className="flex items-start gap-3 py-2 border-b border-dashed border-muted last:border-0">
                <div className="flex-shrink-0 w-8 h-8 bg-muted/50 border-2 border-muted flex items-center justify-center mt-0.5" style={{ borderRadius: RADIUS.blob }}><Icon size={14} strokeWidth={2.5} /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-base">{text}</p>
                  <p className="font-body text-sm text-pencil/40">{timeAgo(time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-postit border-2 border-pencil p-6 shadow-hard-sm flex flex-col md:flex-row items-center justify-between gap-4 transform -rotate-[0.5deg]" style={{ borderRadius: RADIUS.wobbly }}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={28} strokeWidth={2.5} className="text-accent flex-shrink-0" />
          <div>
            <p className="font-heading text-xl font-bold">No match for an item?</p>
            <p className="font-body text-base text-pencil/70">Start a community thread - let the campus help you look!</p>
          </div>
        </div>
        <Link to="/student/community"><Button variant="accent" size="md"><MessageCircle size={18} strokeWidth={2.5} /> Start thread</Button></Link>
      </div>
    </div>
  );
}
