import { ShieldAlert, Flag, MessageCircle, User, CheckCircle2, Trash2, Eye } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const mockFlagged = [
  { id: 'f1', type: 'reply', content: 'BUY CHEAP PHONES AT www.scam.com', reporter: 'Auto-filter', author: 'SpamBot420', thread: 'Lost earbuds near library', time: new Date(Date.now() - 3600000), reason: 'Spam detected' },
  { id: 'f2', type: 'reply', content: 'This is definitely mine, I can prove it! GIVE IT BACK!!!', reporter: 'Rahul S.', author: 'AggressiveUser', thread: 'Missing blue bottle', time: new Date(Date.now() - 7200000), reason: 'Hostile language' },
  { id: 'f3', type: 'claim', content: 'Suspicious claim: user submitted 5 claims in 10 minutes for different items', reporter: 'System', author: 'Neha R.', thread: '', time: new Date(Date.now() - 86400000), reason: 'Rate limit abuse' },
  { id: 'f4', type: 'reply', content: 'I saw it, DM me on Instagram @fake for details', reporter: 'Priya M.', author: 'ShadyUser', thread: 'Keys lost near parking', time: new Date(Date.now() - 172800000), reason: 'Sharing personal info' },
];

const typeIcon = { reply: MessageCircle, claim: Flag, user: User };
const typeColor = { reply: 'text-ink', claim: 'text-accent', user: 'text-yellow-600' };

export default function Moderation() {
  const handleResolve = (id, action) => {
    toast.success(`Content ${action === 'remove' ? 'removed' : 'dismissed'}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Moderation<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Review flagged content and take action. {mockFlagged.length} items need attention.</p>
      </div>

      <div className="space-y-4">
        {mockFlagged.map((item, i) => {
          const Icon = typeIcon[item.type] || Flag;
          return (
            <div key={item.id} className={`relative bg-white border-2 border-accent/50 p-5 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`} style={{ borderRadius: RADIUS.wobblyMd }}>
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-accent/10 border-2 border-accent flex items-center justify-center ${typeColor[item.type]}`} style={{ borderRadius: RADIUS.blob }}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="accent">{item.type}</Badge>
                        <span className="font-body text-sm text-pencil/40">{timeAgo(item.time)}</span>
                      </div>
                      <p className="font-body text-sm text-pencil/50">By: {item.author} | Reported by: {item.reporter}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-accent/5 border-2 border-dashed border-accent/30 p-3" style={{ borderRadius: RADIUS.wobblySm }}>
                  <p className="font-body text-base">{item.content}</p>
                </div>

                {/* Reason + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="font-body text-sm text-pencil/60"><strong>Reason:</strong> {item.reason}{item.thread && ` - in "${item.thread}"`}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="accent" onClick={() => handleResolve(item.id, 'remove')}><Trash2 size={14} /> Remove</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleResolve(item.id, 'dismiss')}><CheckCircle2 size={14} /> Dismiss</Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}