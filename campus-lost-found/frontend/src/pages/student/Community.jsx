import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, ThumbsDown, MapPin, Clock, Plus, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';

const mockThreads = [
  {
    id: 't1', title: 'Lost black earbuds near the library',
    description: 'Left my earbuds somewhere on the 2nd floor of the library around Monday afternoon. They are wireless, in-ear type.',
    category: 'Electronics', location: 'Library', postedAt: new Date(Date.now() - 7200000),
    replies: 5, author: 'Rahul S.', isOwn: true,
  },
  {
    id: 't2', title: 'Missing blue water bottle - canteen area',
    description: 'Forgot my water bottle at the canteen counter during lunch. It is a standard sports bottle.',
    category: 'Water Bottles', location: 'Canteen', postedAt: new Date(Date.now() - 86400000),
    replies: 3, author: 'Priya M.', isOwn: false,
  },
  {
    id: 't3', title: 'Keys lost near parking lot B',
    description: 'Dropped my keys somewhere between parking lot B and the main building entrance. Small keychain with 3 keys.',
    category: 'Keys', location: 'Parking Lot B', postedAt: new Date(Date.now() - 172800000),
    replies: 8, author: 'Amit K.', isOwn: false,
  },
];

export default function Community() {
  const [search, setSearch] = useState('');

  const filtered = mockThreads.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">Community<span className="text-accent">.</span></h1>
          <p className="font-body text-lg text-pencil/60 mt-1">Campus-wide threads for lost items. Share sightings and help each other!</p>
        </div>
        <Link to="/student/report-lost">
          <Button size="md"><Plus size={18} strokeWidth={2.5} /> New thread</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-pencil/40" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search threads..."
          className="w-full pl-12 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand"
          style={{ borderRadius: RADIUS.wobblySm }}
        />
      </div>

      {/* Info banner */}
      <div className="bg-postit border-2 border-pencil p-4 flex items-start gap-3 transform -rotate-[0.3deg]" style={{ borderRadius: RADIUS.wobblySm }}>
        <MessageCircle size={20} strokeWidth={2.5} className="text-pencil/60 flex-shrink-0 mt-0.5" />
        <p className="font-body text-sm text-pencil/70">
          Threads only share vague details - no brand names, model numbers, or images. Privacy first!
        </p>
      </div>

      {/* Thread list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} strokeWidth={2} className="mx-auto text-pencil/15 mb-4" />
            <p className="font-body text-xl text-pencil/40">No threads found.</p>
          </div>
        ) : (
          filtered.map((thread, i) => (
            <Link key={thread.id} to={`/student/community/${thread.id}`} className="block">
              <div
                className={`relative bg-white border-2 border-pencil p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`}
                style={{ borderRadius: RADIUS.wobblyMd }}
              >
                {thread.isOwn && <div className="pin-tack" />}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-xl font-bold">{thread.title}</h3>
                      {thread.isOwn && <Badge variant="info">yours</Badge>}
                    </div>
                    <p className="font-body text-base text-pencil/60 mb-3 line-clamp-2">{thread.description}</p>
                    <div className="flex flex-wrap gap-4 font-body text-sm text-pencil/50">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {thread.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {timeAgo(thread.postedAt)}</span>
                      <span>by {thread.author}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="default">{thread.category}</Badge>
                    <div className="flex items-center gap-1 font-body text-sm text-pencil/50 bg-muted/50 px-2 py-1 border border-muted" style={{ borderRadius: RADIUS.wobblySm }}>
                      <MessageCircle size={14} /> {thread.replies}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}