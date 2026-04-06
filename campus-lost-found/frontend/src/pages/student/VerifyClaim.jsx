import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Send, Loader2, Lock, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import api from '../../api/http';
import toast from 'react-hot-toast';

const mapContainerStyle = { width: '100%', height: '200px' };

export default function VerifyClaim() {
  const { id } = useParams(); // match ID
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    api.get(`/matches/${id}`)
      .then(res => {
        setMatch(res.data.match);
        setQuestions(res.data.questions || []);
      })
      .catch(err => {
        toast.error('Failed to load match details.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answerList = questions.map(q => ({
      questionId: q.id,
      question: q.text,
      answer: answers[q.id] || '',
    }));

    if (answerList.some(a => !a.answer.trim())) {
      return toast.error('Please answer all questions for better AI analysis.');
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-accent" /></div>;

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
        <div className={`border-2 p-8 text-center ${cfg.color} shadow-hard-sm`} style={{ borderRadius: RADIUS.wobbly }}>
          <Icon size={56} className="mx-auto mb-4" />
          <h2 className="font-heading text-3xl font-bold mb-2">{cfg.title}</h2>
          <p className="font-body text-lg mb-6">{cfg.desc}</p>
          <Button onClick={() => navigate('/student/matches')}>Back to matches</Button>
        </div>
      </div>
    );
  }

  const lostCoords = match?.lostReport?.locationCoords || { lat: 0, lng: 0 };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading text-4xl font-bold">Verify Ownership<span className="text-accent">.</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="font-body text-lg text-pencil/70">
            {match ? `Verifying match for: ${match.lostReport?.itemName}` : 'Loading...'}
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 p-4 flex items-start gap-3" style={{ borderRadius: RADIUS.wobblySm }}>
            <Lock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-blue-800">The AI generated these questions based on the finder's clues. Prove you are the owner by answering them accurately.</p>
          </div>
        </div>

        {isLoaded && lostCoords.lat !== 0 && (
          <div className="border-2 border-pencil overflow-hidden shadow-hard-xs" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="bg-pencil text-white text-[10px] px-2 py-1 flex items-center gap-1 font-bold">
              <MapPin size={10} /> YOUR LOST LOCATION
            </div>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={lostCoords}
              zoom={15}
              options={{ disableDefaultUI: true, draggable: false }}
            >
              <Marker position={lostCoords} />
            </GoogleMap>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white border-2 border-pencil p-5 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblySm }}>
            <p className="font-heading text-xl font-bold mb-2 pt-2">Q{i + 1}: {q.text} ?</p>
            <textarea
              value={answers[q.id] || ''}
              onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
              rows={3}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand resize-none"
              style={{ borderRadius: RADIUS.wobblySm }}
            />
          </div>
        ))}
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? <><Loader2 size={20} className="animate-spin" /> Analyzing...</> : <><ShieldCheck size={20} strokeWidth={3} /> Submit for AI Analysis</>}
        </Button>
      </form>
    </div>
  );
}