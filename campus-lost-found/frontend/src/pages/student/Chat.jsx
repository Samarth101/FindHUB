import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/http';

export default function Chat() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch rooms initially + poll every 5s for new rooms
  useEffect(() => {
    const fetchRooms = () => {
      api.get('/chat')
        .then(res => {
          const r = res.data.rooms || [];
          setRooms(r);
          if (r.length > 0 && !selectedRoom) setSelectedRoom(r[0]._id);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    };
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, [selectedRoom]);

  // Load messages when room changes + poll every 3s for new messages
  useEffect(() => {
    if (!selectedRoom) return;
    const fetchMessages = () => {
      api.get(`/chat/${selectedRoom}`)
        .then(res => setMessages(res.data.room?.messages || []))
        .catch(err => console.error(err));
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedRoom) return;
    setSending(true);
    try {
      const res = await api.post(`/chat/${selectedRoom}/messages`, { text: newMsg });
      setMessages(prev => [...prev, { ...res.data.message, sender: { _id: user._id, name: user.name } }]);
      setNewMsg('');
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-4xl font-bold dark:text-white">Chat<span className="text-[#ff4d4d]">.</span></h1>
        <span className="flex items-center gap-1 text-xs font-body text-green-500 bg-green-50 px-2 py-1 rounded-full border border-green-200">
          <RefreshCw size={10} className="animate-spin" /> Live
        </span>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle size={56} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-body text-xl">No chat rooms yet.</p>
          <p className="text-gray-300 font-body">Chats are created after successful ownership verification.</p>
          <p className="text-gray-300 font-body text-sm mt-2">This page refreshes automatically — new chats will appear here.</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[500px]">
          {/* Room list */}
          <div className="w-64 border-2 border-[#2d2d2d] bg-white dark:bg-[#222] overflow-y-auto flex-shrink-0" style={{ borderRadius: RADIUS.wobblySm }}>
            {rooms.map(r => (
              <button
                key={r._id}
                onClick={() => setSelectedRoom(r._id)}
                className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-700 transition-colors ${selectedRoom === r._id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <p className="font-bold text-sm dark:text-white truncate">{r.name || `Room ${r._id.slice(-6)}`}</p>
                <p className="text-xs text-gray-400 truncate">{r.lastMessage || 'No messages yet'}</p>
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className="flex-1 border-2 border-[#2d2d2d] bg-white dark:bg-[#222] flex flex-col" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-300 font-body">
                  <p>No messages yet. Say hello! 👋</p>
                </div>
              )}
              {messages.map((m, i) => {
                const isMe = m.sender?._id === user?._id || m.sender === user?._id;
                return (
                  <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 ${isMe ? 'bg-[#2d5da1] text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-white'}`} style={{ borderRadius: RADIUS.wobblySm }}>
                      {!isMe && <p className="text-xs font-bold mb-1">{m.sender?.name || 'Anonymous Finder'}</p>}
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>{timeAgo(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#333] dark:text-white font-body text-sm" style={{ borderRadius: RADIUS.wobblySm }} />
              <Button type="submit" size="sm" disabled={sending}><Send size={14} /></Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}