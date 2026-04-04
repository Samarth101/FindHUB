import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, User } from 'lucide-react';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const mockRooms = [
  { id: 'r1', name: 'Blue Earbuds - Match #1', lastMessage: 'When can you pick it up?', time: new Date(Date.now() - 300000), unread: 2 },
  { id: 'r2', name: 'Student ID - Admin', lastMessage: 'Please bring your college ID for verification.', time: new Date(Date.now() - 3600000), unread: 0 },
];

const mockMessages = [
  { id: 1, sender: 'finder', text: 'Hi! I found your earbuds at the library.', time: new Date(Date.now() - 7200000) },
  { id: 2, sender: 'me', text: 'Thank you so much! I was looking everywhere for them.', time: new Date(Date.now() - 7000000) },
  { id: 3, sender: 'finder', text: 'No worries! When can you pick them up?', time: new Date(Date.now() - 6800000) },
  { id: 4, sender: 'me', text: 'I can come by tomorrow around 2pm. Does that work?', time: new Date(Date.now() - 6600000) },
  { id: 5, sender: 'finder', text: 'When can you pick it up?', time: new Date(Date.now() - 300000) },
];

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState(mockRooms[0]?.id);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { id: messages.length + 1, sender: 'me', text: message, time: new Date() }]);
    setMessage('');
  };

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-4xl font-bold">Chat<span className="text-accent">.</span></h1>

      <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-240px)] min-h-[500px]">
        {/* Room list */}
        <div className="bg-white border-2 border-pencil overflow-y-auto" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="p-3 border-b-2 border-dashed border-muted">
            <p className="font-heading text-lg font-bold">Conversations</p>
          </div>
          {mockRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`w-full text-left p-4 border-b border-muted/50 transition-colors ${
                selectedRoom === room.id ? 'bg-postit' : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-body text-base font-bold truncate pr-2">{room.name}</p>
                {room.unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">{room.unread}</span>
                )}
              </div>
              <p className="font-body text-sm text-pencil/50 truncate">{room.lastMessage}</p>
              <p className="font-body text-xs text-pencil/30 mt-1">{timeAgo(room.time)}</p>
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="bg-white border-2 border-pencil flex flex-col" style={{ borderRadius: RADIUS.wobblyMd }}>
          {/* Header */}
          <div className="p-4 border-b-2 border-pencil flex items-center gap-3">
            <div className="w-8 h-8 bg-ink/10 border-2 border-ink flex items-center justify-center" style={{ borderRadius: RADIUS.blob }}>
              <MessageCircle size={16} strokeWidth={2.5} className="text-ink" />
            </div>
            <p className="font-heading text-lg font-bold">{mockRooms.find(r => r.id === selectedRoom)?.name}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] p-3 border-2 ${
                    msg.sender === 'me'
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-pencil border-pencil'
                  }`}
                  style={{ borderRadius: msg.sender === 'me' ? '15px 225px 15px 255px / 255px 15px 225px 15px' : RADIUS.wobblyMd }}
                >
                  <p className="font-body text-base">{msg.text}</p>
                  <p className={`font-body text-xs mt-1 ${msg.sender === 'me' ? 'text-white/50' : 'text-pencil/40'}`}>{timeAgo(msg.time)}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t-2 border-dashed border-muted flex gap-2">
            <input
              type="text" value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand"
              style={{ borderRadius: RADIUS.wobblySm }}
            />
            <Button type="submit" size="md"><Send size={18} strokeWidth={3} /></Button>
          </form>
        </div>
      </div>
    </div>
  );
}