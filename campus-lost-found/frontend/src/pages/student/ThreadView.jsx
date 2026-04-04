import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, Send, MapPin, Clock, MessageCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const mockThread = {
  id: 't1', title: 'Lost black earbuds near the library',
  description: 'Left my earbuds somewhere on the 2nd floor of the library around Monday afternoon. They are wireless, in-ear type. I was sitting near the window section.',
  category: 'Electronics', location: 'Library 2nd Floor', postedAt: new Date(Date.now() - 7200000),
  author: 'Rahul S.',
};

const mockReplies = [
  { id: 'r1', text: 'I saw something like that on the bench near the printer area around 3pm!', author: 'Priya M.', time: new Date(Date.now() - 5400000), upvotes: 4, downvotes: 0 },
  { id: 'r2', text: 'Check with the library front desk - they collect lost items every evening.', author: 'Amit K.', time: new Date(Date.now() - 3600000), upvotes: 7, downvotes: 1 },
  { id: 'r3', text: 'I think the cleaning staff found some earbuds yesterday. Ask the admin office.', author: 'Neha R.', time: new Date(Date.now() - 1800000), upvotes: 2, downvotes: 0 },
];

export default function ThreadView() {
  const { id } = useParams();
  const [newReply, setNewReply] = useState('');
  const [replies, setReplies] = useState(mockReplies);

  const handleReply = (e) => {
    e.preventDefault();
    if (!newReply.trim()) return toast.error('Write something first!');
    setReplies([...replies, {
      id: `r${replies.length + 1}`, text: newReply, author: 'You', time: new Date(), upvotes: 0, downvotes: 0,
    }]);
    setNewReply('');
    toast.success('Reply posted!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/student/community" className="inline-flex items-center gap-2 font-body text-lg text-pencil/60 hover:text-accent transition-colors">
        <ArrowLeft size={18} strokeWidth={2.5} /> Back to threads
      </Link>

      {/* Thread card */}
      <div className="relative bg-white border-[3px] border-pencil p-6 shadow-hard" style={{ borderRadius: RADIUS.wobblyMd }}>
        <div className="tape-strip" />
        <div className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="default">{mockThread.category}</Badge>
            <span className="font-body text-sm text-pencil/50">{timeAgo(mockThread.postedAt)}</span>
          </div>
          <h1 className="font-heading text-3xl font-bold mb-3">{mockThread.title}</h1>
          <p className="font-body text-lg text-pencil/70 leading-relaxed mb-4">{mockThread.description}</p>
          <div className="flex gap-4 font-body text-sm text-pencil/50">
            <span className="flex items-center gap-1"><MapPin size={14} /> {mockThread.location}</span>
            <span>Posted by {mockThread.author}</span>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-1">
        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
          <MessageCircle size={22} strokeWidth={2.5} /> Replies ({replies.length})
        </h2>
        <div className="dashed-sep mb-4" />

        {replies.map((reply, i) => (
          <div
            key={reply.id}
            className={`bg-white border-2 border-pencil p-4 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`}
            style={{ borderRadius: RADIUS.wobblySm, marginBottom: '12px' }}
          >
            <p className="font-body text-lg mb-3">{reply.text}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 font-body text-sm text-pencil/50">
                <span className="font-bold">{reply.author}</span>
                <span>{timeAgo(reply.time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-pencil/40 hover:text-green-600 transition-colors font-body text-sm">
                  <ThumbsUp size={14} strokeWidth={2.5} /> {reply.upvotes}
                </button>
                <button className="flex items-center gap-1 text-pencil/40 hover:text-accent transition-colors font-body text-sm">
                  <ThumbsDown size={14} strokeWidth={2.5} /> {reply.downvotes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      <form onSubmit={handleReply} className="relative bg-muted/30 border-2 border-dashed border-muted p-4" style={{ borderRadius: RADIUS.wobblyMd }}>
        <textarea
          value={newReply} onChange={(e) => setNewReply(e.target.value)}
          rows={3} placeholder="Share a sighting or tip..."
          className="w-full p-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand resize-none mb-3"
          style={{ borderRadius: RADIUS.wobblySm }}
        />
        <div className="flex justify-end">
          <Button type="submit" size="md"><Send size={16} strokeWidth={3} /> Reply</Button>
        </div>
      </form>
    </div>
  );
}