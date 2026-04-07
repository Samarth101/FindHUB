import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Clock, Plus, Search, Loader2, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { RADIUS, CATEGORIES } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/http';
import toast from 'react-hot-toast';

export default function Community() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '' });

  useEffect(() => {
    api.get('/community', { params: { limit: 30 } })
      .then(res => setThreads(res.data.threads || []))
      .catch(err => console.error('Failed to load threads:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return toast.error('Title and description are required!');
    setCreating(true);
    try {
      const res = await api.post('/community', form);
      setThreads(prev => [res.data.thread, ...prev]);
      setForm({ title: '', description: '', category: '', location: '' });
      setShowForm(false);
      toast.success('Thread created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create thread');
    } finally {
      setCreating(false);
    }
  };

  const filtered = threads.filter(t => {
    const q = search.toLowerCase();
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#2d5da1]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Community<span className="text-[#ff4d4d]">.</span></h1>
          <p className="font-body text-lg text-gray-500 mt-1">Campus-wide threads for lost items. Share sightings and help each other!</p>
        </div>
        <Button size="md" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} strokeWidth={2.5} /> New Thread</>}
        </Button>
      </div>

      {/* Inline Create Thread Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-[#222] border-2 border-[#2d5da1] p-6 space-y-4 shadow-[3px_3px_0px_#2d5da1]" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold dark:text-white">Create a Thread</h2>
          <div>
            <label className="font-body text-sm text-gray-500 mb-1 block">Title *</label>
            <input
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Lost white earbuds near Library"
              className="w-full px-4 py-3 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body"
              style={{ borderRadius: RADIUS.wobblySm }} maxLength={160}
            />
          </div>
          <div>
            <label className="font-body text-sm text-gray-500 mb-1 block">Description *</label>
            <textarea
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the item vaguely (no brand, model, or personal details). Ask if anyone has seen it."
              rows={3}
              className="w-full px-4 py-3 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body resize-none"
              style={{ borderRadius: RADIUS.wobblySm }} maxLength={1000}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-gray-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body"
                style={{ borderRadius: RADIUS.wobblySm }}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body text-sm text-gray-500 mb-1 block">Last seen at</label>
              <input
                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Library 2nd floor"
                className="w-full px-4 py-3 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body"
                style={{ borderRadius: RADIUS.wobblySm }} maxLength={200}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={creating}>
            {creating ? 'Creating...' : 'Post Thread'}
          </Button>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search threads..."
          className="w-full pl-12 pr-4 py-3 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body text-lg placeholder:text-gray-300"
          style={{ borderRadius: RADIUS.wobblySm }}
        />
      </div>

      {/* Info banner */}
      <div className="bg-[#fef3c7] border-2 border-[#2d2d2d] p-4 flex items-start gap-3 transform -rotate-[0.3deg]" style={{ borderRadius: RADIUS.wobblySm }}>
        <MessageCircle size={20} strokeWidth={2.5} className="text-gray-600 flex-shrink-0 mt-0.5" />
        <p className="font-body text-sm text-gray-600">
          Threads only share vague details — no brand names, model numbers, or images. Privacy first!
        </p>
      </div>

      {/* Thread list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} strokeWidth={2} className="mx-auto text-gray-200 mb-4" />
            <p className="font-body text-xl text-gray-400">{search ? 'No threads match your search.' : 'No community threads yet. Be the first!'}</p>
          </div>
        ) : (
          filtered.map((thread, i) => {
            const isOwn = thread.author?._id === user?._id;
            const authorName = thread.author?.name || 'Anonymous';
            const replyCount = thread.replyCount ?? thread.replies?.length ?? 0;
            return (
              <Link key={thread._id} to={`/student/community/${thread._id}`} className="block">
                <div
                  className={`relative bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-5 shadow-[2px_2px_0px_#2d2d2d] hover:shadow-[4px_4px_0px_#2d2d2d] hover:-translate-y-0.5 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`}
                  style={{ borderRadius: RADIUS.wobblyMd }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading text-xl font-bold dark:text-white">{thread.title}</h3>
                        {isOwn && <Badge variant="info">yours</Badge>}
                      </div>
                      <p className="font-body text-base text-gray-500 mb-3 line-clamp-2">{thread.description}</p>
                      <div className="flex flex-wrap gap-4 font-body text-sm text-gray-400">
                        {thread.location && <span className="flex items-center gap-1"><MapPin size={14} /> {thread.location}</span>}
                        <span className="flex items-center gap-1"><Clock size={14} /> {timeAgo(thread.createdAt)}</span>
                        <span>by {authorName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {thread.category && <Badge variant="default">{thread.category}</Badge>}
                      <div className="flex items-center gap-1 font-body text-sm text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 border border-gray-200 dark:border-gray-600" style={{ borderRadius: RADIUS.wobblySm }}>
                        <MessageCircle size={14} /> {replyCount}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}