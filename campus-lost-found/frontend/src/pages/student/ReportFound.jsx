import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Tag, Palette, Type, ImagePlus, Send, EyeOff, Lock, Key } from 'lucide-react';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';
import { RADIUS, CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import api from '../../api/http';

const inputCls = 'w-full pl-10 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand';

export default function ReportFound() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [form, setForm] = useState({
    category: '', itemName: '', brand: '', color: '', description: '',
    location: '', date: '', images: [],
    secretClues: [''],
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addClue = () => setForm({ ...form, secretClues: [...form.secretClues, ''] });
  const updateClue = (i, val) => {
    const clues = [...form.secretClues];
    clues[i] = val;
    setForm({ ...form, secretClues: clues });
  };
  const removeClue = (i) => {
    const clues = form.secretClues.filter((_, idx) => idx !== i);
    setForm({ ...form, secretClues: clues.length ? clues : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.category || !form.itemName || !form.location || !form.date) {
      return toast.error('Please fill in all required fields!');
    }
    const validClues = form.secretClues.filter(c => c.trim());
    if (validClues.length === 0) {
      return toast.error('Add at least one secret clue for verification!');
    }
    setLoading(true);
    try {
      await api.post('/found', {
        ...form,
        submitterAnonymous: anonymous,
        secretClues: validClues.map(text => ({ text })),
      });
      toast.success('Found item reported! Thank you for helping.');
      navigate('/student/my-reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">Report Found Item<span className="text-accent">.</span></h1>
      <p className="font-body text-lg text-pencil/60 mb-8">Found something on campus? Submit it here. You will not be able to see this report again - it goes into the private found database for matching.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="tape-strip" />
          <h2 className="font-heading text-2xl font-bold mb-4 pt-3">Item Details</h2>
          <div className="space-y-4">
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Category *</label>
              <div className="relative">
                <Tag size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <select name="category" value={form.category} onChange={set} className={inputCls} style={{ borderRadius: RADIUS.wobblySm }}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Item Name *</label>
              <div className="relative">
                <Type size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="text" name="itemName" value={form.itemName} onChange={set} placeholder="e.g. iPhone 15" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body text-base text-pencil/70 mb-1 block">Brand</label>
                <div className="relative">
                  <Tag size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                  <input type="text" name="brand" value={form.brand} onChange={set} placeholder="e.g. Apple" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
                </div>
              </div>
              <div>
                <label className="font-body text-base text-pencil/70 mb-1 block">Color</label>
                <div className="relative">
                  <Palette size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                  <input type="text" name="color" value={form.color} onChange={set} placeholder="e.g. Space Gray" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
                </div>
              </div>
            </div>
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Description</label>
              <textarea name="description" value={form.description} onChange={set} rows={3} placeholder="Physical condition, packaging, any visible details..." className="w-full p-4 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand resize-none" style={{ borderRadius: RADIUS.wobblySm }} />
            </div>
          </div>
        </div>

        <div className="relative bg-accent/5 border-2 border-accent p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="pin-tack" />
          <h2 className="font-heading text-2xl font-bold mb-2 pt-2 flex items-center gap-2">
            <Key size={22} strokeWidth={2.5} className="text-accent" /> Secret Clues
          </h2>
          <p className="font-body text-base text-pencil/60 mb-4">
            Add details only the true owner would know. These are used to generate verification questions.
          </p>

          <div className="space-y-3">
            {form.secretClues.map((clue, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <Lock size={16} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/40" />
                  <input
                    type="text" value={clue}
                    onChange={(e) => updateClue(i, e.target.value)}
                    placeholder={`Clue ${i + 1}: e.g. "Red sticker on the back"`}
                    className="w-full pl-10 pr-4 py-3 border-2 border-accent/50 bg-white font-body text-lg placeholder:text-pencil/30 focus-hand"
                    style={{ borderRadius: RADIUS.wobblySm }}
                  />
                </div>
                {form.secretClues.length > 1 && (
                  <button type="button" onClick={() => removeClue(i)} className="px-3 text-accent hover:text-red-700 font-bold text-xl">x</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addClue} className="mt-3 font-body text-base text-ink hover:text-accent transition-colors">
            + Add another clue
          </button>
        </div>

        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold mb-4">Where and When</h2>
          <div className="space-y-4">
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Found at *</label>
              <div className="relative">
                <MapPin size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="text" name="location" value={form.location} onChange={set} placeholder="e.g. Canteen counter" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Date found *</label>
              <div className="relative">
                <Calendar size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="date" name="date" value={form.date} onChange={set} className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-white border-2 border-dashed border-muted p-6" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2"><ImagePlus size={22} strokeWidth={2.5} /> Images (optional)</h2>
          <ImageUpload images={form.images} onChange={(imgs) => setForm({ ...form, images: imgs })} max={3} />
        </div>

        <div
          className="flex items-center gap-3 p-4 border-2 border-pencil bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
          style={{ borderRadius: RADIUS.wobblySm }}
          onClick={() => setAnonymous(!anonymous)}
        >
          <div className={`w-6 h-6 border-2 border-pencil flex items-center justify-center ${anonymous ? 'bg-ink' : 'bg-white'}`} style={{ borderRadius: '4px' }}>
            {anonymous && <span className="text-white text-sm font-bold">Y</span>}
          </div>
          <EyeOff size={20} strokeWidth={2.5} className="text-pencil/60" />
          <div>
            <p className="font-body text-base font-bold">Stay anonymous</p>
            <p className="font-body text-sm text-pencil/50">Your identity will be hidden from the owner. Handover via admin.</p>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Submitting...' : <><Send size={20} strokeWidth={3} /> Submit Found Report</>}
        </Button>
      </form>
    </div>
  );
}