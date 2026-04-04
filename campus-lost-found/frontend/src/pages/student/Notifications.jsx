import { useState } from 'react';
import { Bell, CheckCheck, ShieldCheck, MessageCircle, Package, Handshake, Trash2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const mockNotifications = [
  { id: 'n1', type: 'match',    title: 'New match found!',         body: 'A potential match was found for your Blue Earbuds.', time: new Date(Date.now() - 1800000),  read: false, icon: ShieldCheck },
  { id: 'n2', type: 'chat',     title: 'New message',              body: 'Finder sent you a message in the chat.', time: new Date(Date.now() - 3600000),  read: false, icon: MessageCircle },
  { id: 'n3', type: 'handover', title: 'Handover scheduled',       body: 'Your pickup for Student ID is set for tomorrow at 2pm.', time: new Date(Date.now() - 86400000), read: true, icon: Handshake },
  { id: 'n4', type: 'community',title: 'New reply on your thread', body: 'Amit K. replied: "Check with the admin office."', time: new Date(Date.now() - 172800000), read: true, icon: MessageCircle },
];

const typeColor = { match: 'text-accent', chat: 'text-ink', handover: 'text-green-600', community: 'text-pencil' };

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">Notifications<span className="text-accent">.</span></h1>
          <p className="font-body text-lg text-pencil/60 mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={16} strokeWidth={2.5} /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} strokeWidth={2} className="mx-auto text-pencil/15 mb-4" />
            <p className="font-body text-xl text-pencil/40">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`relative bg-white border-2 p-4 transition-all duration-100 ${
                  n.read ? 'border-muted' : 'border-pencil shadow-hard-sm'
                } ${!n.read ? 'bg-postit/30' : ''}`}
                style={{ borderRadius: RADIUS.wobblySm }}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 border-2 border-current flex items-center justify-center ${typeColor[n.type]}`} style={{ borderRadius: RADIUS.blob }}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-lg font-bold">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />}
                    </div>
                    <p className="font-body text-base text-pencil/60">{n.body}</p>
                    <p className="font-body text-sm text-pencil/40 mt-1">{timeAgo(n.time)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}