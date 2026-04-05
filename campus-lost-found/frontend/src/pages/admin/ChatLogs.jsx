import { useState, useEffect } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import api from '../../api/http';

export default function ChatLogs() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat/admin/all')
      .then(res => setRooms(res.data.rooms || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Chat Logs<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">All chat rooms between verified owners and finders.</p>
      </div>
      <div className="space-y-3">
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-body text-xl">No chat rooms created yet.</p>
          </div>
        ) : rooms.map(r => (
          <div key={r._id} className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-between gap-4" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-[#2d5da1]" />
              <div>
                <p className="font-bold dark:text-white">Room: {r._id.slice(-8)}</p>
                <p className="text-sm text-gray-400">
                  Participants: {r.participants?.map(p => p.name).join(', ') || '?'} · Last: {r.lastMessage ? `"${r.lastMessage.slice(0, 40)}..."` : 'No messages'} · {timeAgo(r.lastActivity)}
                </p>
              </div>
            </div>
            <Badge variant={r.isClosed ? 'default' : 'success'}>{r.isClosed ? 'Closed' : 'Active'}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}