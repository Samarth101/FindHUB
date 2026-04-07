import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ThumbsUp, ThumbsDown, ArrowLeft, Send, Loader2, Brain, Route, Clock, Search, Sparkles } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatDate';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/http';
import toast from 'react-hot-toast';

export default function ThreadView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    api.get(`/community/${id}`)
      .then(res => {
        setThread(res.data.thread);
        setReplies(res.data.thread?.replies || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/community/${id}/replies`, { text: newReply });
      setReplies(prev => [...prev, { ...res.data.reply, author: { _id: user._id, name: user.name } }]);
      setNewReply('');
      toast.success('Reply posted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleVote = async (replyId, vote) => {
    try {
      await api.post(`/community/${id}/replies/${replyId}/vote`, { vote });
      const res = await api.get(`/community/${id}`);
      setReplies(res.data.thread?.replies || []);
    } catch { /* silent */ }
  };

  const handleAnalyze = async () => {
    if (replies.length === 0) return toast.error('Need at least one reply to analyze!');
    setAnalyzing(true);
    try {
      const res = await api.post(`/community/${id}/analyze`);
      setAnalysis(res.data);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error('AI analysis failed. Try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;
  if (!thread) return <p className="text-center py-12 text-gray-400">Thread not found.</p>;

  return (
    <div className="space-y-6">
      <Link to="/student/community" className="inline-flex items-center gap-1 text-gray-400 hover:text-[#2d2d2d] font-body text-sm"><ArrowLeft size={16} /> Back to community</Link>

      <div className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-6 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblyMd }}>
        <div className="flex items-center gap-2 mb-2">
          {thread.category && <Badge variant="default">{thread.category}</Badge>}
          <span className="font-body text-sm text-gray-400">{timeAgo(thread.createdAt)}</span>
        </div>
        <h1 className="font-heading text-3xl font-bold mb-3 dark:text-white">{thread.title}</h1>
        <p className="font-body text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{thread.description}</p>
        <div className="flex gap-4 font-body text-sm text-gray-400">
          {thread.location && <span className="flex items-center gap-1"><MapPin size={14} /> {thread.location}</span>}
          <span>Posted by {thread.author?.name || 'Anonymous'}</span>
        </div>
      </div>

      {/* AI Analysis Button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleAnalyze} disabled={analyzing} size="md">
          {analyzing ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Brain size={16} /> 🧠 AI Analyze Thread</>}
        </Button>
        <span className="font-body text-sm text-gray-400">Uses NLP to summarize the trail of your lost item from community replies</span>
      </div>

      {/* AI Analysis Results */}
      {analysis && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-300 dark:border-purple-700 p-6 space-y-5" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={22} className="text-purple-600" />
            <h3 className="font-heading text-2xl font-bold text-purple-800 dark:text-purple-300">AI Trail Analysis</h3>
          </div>

          {/* Summary trail */}
          <div className="bg-white/80 dark:bg-[#222]/80 border-2 border-purple-200 dark:border-purple-800 p-4" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex items-center gap-2 mb-2">
              <Route size={16} className="text-purple-600" />
              <h4 className="font-heading text-lg font-bold dark:text-white">Summary Trail</h4>
            </div>
            <p className="font-body text-base text-gray-700 dark:text-gray-300 italic">"{analysis.summary_trail}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Likely Locations */}
            <div className="bg-white/80 dark:bg-[#222]/80 border border-purple-200 dark:border-purple-800 p-4" style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-red-500" />
                <h4 className="font-heading text-base font-bold dark:text-white">Likely Locations</h4>
              </div>
              <ul className="space-y-1">
                {(analysis.likely_locations || []).map((loc, i) => (
                  <li key={i} className="font-body text-sm text-gray-600 dark:text-gray-300 flex items-start gap-1">
                    <span className="text-red-400 mt-1">📍</span> {loc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="bg-white/80 dark:bg-[#222]/80 border border-purple-200 dark:border-purple-800 p-4" style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-blue-500" />
                <h4 className="font-heading text-base font-bold dark:text-white">Timeline</h4>
              </div>
              <ul className="space-y-1">
                {(analysis.timeline_events || []).map((evt, i) => (
                  <li key={i} className="font-body text-sm text-gray-600 dark:text-gray-300 flex items-start gap-1">
                    <span className="text-blue-400 mt-1">🕐</span> {evt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Synthesized Clues */}
            <div className="bg-white/80 dark:bg-[#222]/80 border border-purple-200 dark:border-purple-800 p-4" style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex items-center gap-2 mb-2">
                <Search size={16} className="text-green-500" />
                <h4 className="font-heading text-base font-bold dark:text-white">Clues</h4>
              </div>
              <ul className="space-y-1">
                {(analysis.synthesized_clues || []).map((clue, i) => (
                  <li key={i} className="font-body text-sm text-gray-600 dark:text-gray-300 flex items-start gap-1">
                    <span className="text-green-400 mt-1">🔍</span> {clue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <h2 className="font-heading text-2xl font-bold dark:text-white">Replies ({replies.length})</h2>

      <div className="space-y-3">
        {replies.filter(r => !r.isDeleted).map(r => (
          <div key={r._id} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 p-4" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-sm dark:text-white">{r.author?.name || 'Anonymous'} <span className="text-gray-400 font-normal">· {timeAgo(r.createdAt)}</span></p>
                <p className="font-body text-base mt-1 dark:text-gray-300">{r.text}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleVote(r._id, 'up')} className="p-1 text-gray-400 hover:text-green-600"><ThumbsUp size={14} /></button>
                <span className="text-xs text-gray-400">{(r.upvotes?.length || 0) - (r.downvotes?.length || 0)}</span>
                <button onClick={() => handleVote(r._id, 'down')} className="p-1 text-gray-400 hover:text-red-500"><ThumbsDown size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="flex gap-2">
        <input value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Write a reply..." className="flex-1 px-4 py-3 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body" style={{ borderRadius: RADIUS.wobblySm }} />
        <Button type="submit" disabled={submitting}><Send size={16} /> {submitting ? '...' : 'Reply'}</Button>
      </form>
    </div>
  );
}