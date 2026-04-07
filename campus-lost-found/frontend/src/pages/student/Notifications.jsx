import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShieldCheck, MessageCircle, Handshake, Loader2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import api from '../../api/http';
import toast from 'react-hot-toast';

const typeConfig = {
  match:     { color: 'text-[#ff4d4d]', icon: ShieldCheck },
  chat:      { color: 'text-[#2d5da1]', icon: MessageCircle },
  handover:  { color: 'text-green-600',  icon: Handshake },
  community: { color: 'text-gray-600',   icon: MessageCircle },
  claim_review: { color: 'text-yellow-600', icon: ShieldCheck },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications', { params: { limit: 50 } })
      .then(res => setNotifications(res.data.notifications || []))
      .catch(err => console.error('Failed to load notifications:', err))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      // silent
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#2d5da1]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Notifications<span className="text-[#ff4d4d]">.</span></h1>
          <p className="font-body text-lg text-gray-500 mt-1">{unreadCount} unread</p>
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
            <Bell size={48} strokeWidth={2} className="mx-auto text-gray-200 mb-4" />
            <p className="font-body text-xl text-gray-400">No notifications yet.</p>
            <p className="font-body text-base text-gray-300">You'll be notified when AI finds a match for your items.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.match;
            const Icon = cfg.icon;
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markOneRead(n._id)}
                className={`relative bg-white dark:bg-[#222] border-2 p-4 transition-all duration-100 cursor-pointer ${
                  n.isRead ? 'border-gray-200 dark:border-gray-700' : 'border-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]'
                } ${!n.isRead ? 'bg-[#fef3c7]/30' : ''}`}
                style={{ borderRadius: RADIUS.wobblySm }}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 border-2 border-current flex items-center justify-center ${cfg.color}`} style={{ borderRadius: RADIUS.blob }}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-lg font-bold dark:text-white">{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 bg-[#ff4d4d] rounded-full flex-shrink-0" />}
                    </div>
                    <p className="font-body text-base text-gray-500">{n.body}</p>
                    <p className="font-body text-sm text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
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