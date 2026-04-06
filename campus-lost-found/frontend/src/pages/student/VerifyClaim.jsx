import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Send, Loader2, Lock, CheckCircle, Clock, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import api from '../../api/http';
import toast from 'react-hot-toast';

export default function VerifyClaim() {
  const { id } = useParams(); // match ID
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch match details and AI-generated verification questions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get match info
        const matchRes = await api.get(`/matches/mine`);
        const m = (matchRes.data.matches || []).find(match => match._id === id);
        setMatch(m || null);

        // Get AI-generated questions from Python service
        const qRes = await api.get(`/matches/${id}/questions`);
        setQuestions(qRes.data.questions || []);
      } catch (err) {
        console.error('Failed to load verification data:', err);
        // Fallback to generic questions if AI fails
        setQuestions([
          { id: 'q1', text: 'Describe a unique feature or mark on this item that only the owner would know.' },
          { id: 'q2', text: 'What brand or model is this item?' },
          { id: 'q3', text: 'Describe where exactly you last had this item.' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answerList = questions.map(q => ({
      questionId: q.id,
      question: q.text,
      answer: answers[q.id] || '',
    })).filter(a => a.answer.trim());

    if (answerList.length === 0) {
      return toast.error('Please answer at least one question.');
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/matches/${id}/claim`, { answers: answerList });
      const status = res.data.claim?.status;
      setResult(status);
      if (status === 'approved') toast.success('Verification passed! Chat unlocked.');
      else if (status === 'review') toast('Submitted for manual review.', { icon: '🔍' });
      else toast.error('Verification failed. Your answers did not match.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  if (result) {
    const configs = {
      approved: { icon: CheckCircle, color: 'text-green-600 border-green-600 bg-green-50', title: 'Verification Passed!', desc: 'A chat has been created. You can now coordinate the handover.' },
      review: { icon: Clock, color: 'text-yellow-600 border-yellow-500 bg-yellow-50', title: 'Under Review', desc: 'An admin will review your answers and you will be notified.' },
      rejected: { icon: XCircle, color: 'text-red-600 border-red-500 bg-red-50', title: 'Not Verified', desc: 'Your answers did not match. You can try again later.' },
    };
    const cfg = configs[result] || configs.rejected;
    const Icon = cfg.icon;
    return (
      <div className="max-w-md mx-auto py-12">
        <div className={`border-2 p-8 text-center ${cfg.color}`} style={{ borderRadius: RADIUS.wobbly }}>
          <Icon size={56} className="mx-auto mb-4" />
          <h2 className="font-heading text-3xl font-bold mb-2">{cfg.title}</h2>
          <p className="font-body text-lg mb-6">{cfg.desc}</p>
          <Button onClick={() => navigate('/student/matches')}>Back to matches</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading text-4xl font-bold dark:text-white">Verify Ownership<span className="text-[#ff4d4d]">.</span></h1>
      <p className="font-body text-lg text-gray-500">
        {match ? `Verifying match for: ${match.lostReport?.itemName || 'your item'}` : 'Answer the questions below to prove you are the owner.'}
      </p>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-[#2d5da1] p-4 flex items-start gap-3" style={{ borderRadius: RADIUS.wobblySm }}>
        <Lock size={20} className="text-[#2d5da1] flex-shrink-0 mt-0.5" />
        <p className="font-body text-sm text-gray-600 dark:text-gray-300">Your answers are compared against secret clues submitted by the finder. You must answer accurately to pass.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-5 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblySm }}>
            <p className="font-heading text-lg font-bold mb-2 dark:text-white">Q{i + 1}: {q.text}</p>
            <textarea
              value={answers[q.id] || ''}
              onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
              rows={3}
              placeholder="Your answer..."
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#333] dark:text-white font-body resize-none"
              style={{ borderRadius: RADIUS.wobblySm }}
            />
          </div>
        ))}
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? <><Loader2 size={20} className="animate-spin" /> Verifying...</> : <><ShieldCheck size={20} /> Submit Verification</>}
        </Button>
      </form>
    </div>
  );
}