import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Send, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const mockQuestions = [
  { id: 'q1', text: 'Describe any stickers or markings on the item.' },
  { id: 'q2', text: 'What was the wallpaper or lock screen on the device (if electronic)?' },
  { id: 'q3', text: 'Are there any scratches or damage? If so, where?' },
  { id: 'q4', text: 'Describe the case or covering, if any.' },
];

export default function VerifyClaim() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null | 'pass' | 'fail' | 'review'

  const updateAnswer = (qId, val) => setAnswers({ ...answers, [qId]: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filled = Object.values(answers).filter(a => a.trim()).length;
    if (filled < 2) return toast.error('Please answer at least 2 questions.');

    setLoading(true);
    try {
      // const { data } = await claimsApi.submitAnswers(id, answers);
      // Simulate result
      await new Promise(r => setTimeout(r, 2000));
      const mockResult = Math.random() > 0.3 ? 'pass' : 'review';
      setResult(mockResult);
      if (mockResult === 'pass') toast.success('Verification passed!');
      else toast('Sent for manual review', { icon: '🔍' });
    } catch (err) {
      toast.error('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Result screens
  if (result === 'pass') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="relative bg-white border-[3px] border-green-700 shadow-hard-lg p-8 text-center transform rotate-[0.5deg]" style={{ borderRadius: RADIUS.wobbly }}>
          <CheckCircle2 size={64} strokeWidth={2} className="mx-auto text-green-600 mb-4" />
          <h2 className="font-heading text-3xl font-bold mb-2">Ownership verified!</h2>
          <p className="font-body text-lg text-pencil/70 mb-6">A secure chat has been opened with the finder. Coordinate your handover there.</p>
          <div className="flex gap-4 justify-center">
            <Button variant="accent" onClick={() => navigate('/student/chat')}>Open chat</Button>
            <Button variant="ghost" onClick={() => navigate('/student/matches')}>Back to matches</Button>
          </div>
        </div>
      </div>
    );
  }

  if (result === 'review') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="relative bg-postit border-[3px] border-pencil shadow-hard-lg p-8 text-center transform -rotate-[0.5deg]" style={{ borderRadius: RADIUS.wobbly }}>
          <div className="tape-strip" />
          <AlertCircle size={64} strokeWidth={2} className="mx-auto text-ink mb-4 mt-4" />
          <h2 className="font-heading text-3xl font-bold mb-2">Under review</h2>
          <p className="font-body text-lg text-pencil/70 mb-6">Your answers were partially matching. An admin will review your claim and decide shortly.</p>
          <Button variant="secondary" onClick={() => navigate('/student/matches')}>Back to matches</Button>
        </div>
      </div>
    );
  }

  if (result === 'fail') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="relative bg-white border-[3px] border-accent shadow-hard-lg p-8 text-center" style={{ borderRadius: RADIUS.wobbly }}>
          <XCircle size={64} strokeWidth={2} className="mx-auto text-accent mb-4" />
          <h2 className="font-heading text-3xl font-bold mb-2">Verification failed</h2>
          <p className="font-body text-lg text-pencil/70 mb-6">The answers did not match the finder is clues. If you believe this is an error, contact admin.</p>
          <Button variant="ghost" onClick={() => navigate('/student/matches')}>Back to matches</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">Verify Ownership<span className="text-accent">.</span></h1>
      <p className="font-body text-lg text-pencil/60 mb-6">Answer the questions below to prove this item is yours. You cannot see the found item - this is a blind verification.</p>

      <div className="bg-ink/5 border-2 border-ink p-4 flex items-start gap-3 mb-8" style={{ borderRadius: RADIUS.wobblySm }}>
        <Lock size={22} strokeWidth={2.5} className="text-ink flex-shrink-0 mt-0.5" />
        <p className="font-body text-base text-pencil/70">These questions were generated from details provided by the finder. Answer honestly and with as much detail as you can.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mockQuestions.map((q, i) => (
          <div
            key={q.id}
            className={`relative bg-white border-2 border-pencil p-5 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.3deg]' : '-rotate-[0.3deg]'}`}
            style={{ borderRadius: RADIUS.wobblyMd }}
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-8 h-8 bg-accent text-white border-2 border-pencil flex items-center justify-center font-heading text-sm font-bold" style={{ borderRadius: RADIUS.blob }}>
                {i + 1}
              </span>
              <p className="font-heading text-lg font-bold">{q.text}</p>
            </div>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              rows={3}
              placeholder="Your answer..."
              className="w-full p-3 border-2 border-muted bg-paper font-body text-lg placeholder:text-pencil/30 focus-hand resize-none"
              style={{ borderRadius: RADIUS.wobblySm }}
            />
          </div>
        ))}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2"><ShieldCheck size={20} className="animate-spin" /> Verifying answers...</span>
          ) : (
            <><Send size={20} strokeWidth={3} /> Submit verification</>
          )}
        </Button>
      </form>
    </div>
  );
}