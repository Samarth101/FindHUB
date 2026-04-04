import { MessageSquare, User, Clock, Eye, Search } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const mockLogs = [
  { id: 'cl1', roomName: 'Blue Earbuds - Match #12', participants: ['Rahul S.', 'Anonymous Finder'], messageCount: 23, lastActivity: new Date(Date.now() - 300000), status: 'active' },
  { id: 'cl2', roomName: 'Student ID - Verification', participants: ['Priya M.', 'Amit K.'], messageCount: 8, lastActivity: new Date(Date.now() - 3600000), status: 'completed' },
  { id: 'cl3', roomName: 'Keychain Dispute', participants: ['Vikram D.', 'Admin'], messageCount: 45, lastActivity: new Date(Date.now() - 86400000), status: 'flagged' },
  { id: 'cl4', roomName: 'Backpack Handover', participants: ['Neha R.', 'Walk-in'], messageCount: 12, lastActivity: new Date(Date.now() - 172800000), status: 'completed' },
];

const statusCfg = {
  active:    { variant: 'success', label: 'Active' },
  completed: { variant: 'default', label: 'Completed' },
  flagged:   { variant: 'accent',  label: 'Flagged' },
};

export default function ChatLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Chat Logs<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Review chat rooms and flagged conversations.</p>
      </div>

      <div className="relative">
        <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-pencil/40" />
        <input type="text" placeholder="Search chat rooms..." className="w-full pl-12 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand" style={{ borderRadius: RADIUS.wobblySm }} />
      </div>

      <div className="space-y-3">
        {mockLogs.map((log, i) => {
          const cfg = statusCfg[log.status];
          return (
            <div key={log.id} className={`bg-white border-2 border-pencil p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all cursor-pointer ${i % 2 === 0 ? 'rotate-[0.15deg]' : '-rotate-[0.15deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 border-2 flex items-center justify-center ${log.status === 'flagged' ? 'bg-accent/10 border-accent' : 'bg-muted/50 border-muted'}`} style={{ borderRadius: RADIUS.blob }}>
                    <MessageSquare size={18} strokeWidth={2.5} className={log.status === 'flagged' ? 'text-accent' : 'text-pencil/50'} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold">{log.roomName}</h3>
                    <p className="font-body text-sm text-pencil/50 flex items-center gap-1"><User size={12} /> {log.participants.join(', ')}</p>
                    <div className="flex gap-4 mt-1 font-body text-xs text-pencil/40">
                      <span>{log.messageCount} messages</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(log.lastActivity)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  <button className="p-1 text-pencil/30 hover:text-ink transition-colors"><Eye size={16} strokeWidth={2.5} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}