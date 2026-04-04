import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Tag, Palette, Type, ImagePlus, Send, Key, Lock, PackagePlus, Info } from 'lucide-react';
import Button from '../../components/common/Button';
import { RADIUS, CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const inputCls = 'w-full pl-10 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand';

export default function FoundIntake() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: '', itemName: '', brand: '', color: '', description: '',
    location: '', date: '', images: [],
    secretClues: [''],
    submittedBy: '', submitterAnonymous: false,
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const addClue = () => setForm({ ...form, secretClues: [...form.secretClues, ''] });
  const updateClue = (i, val) => {
    const c = [...form.secretClues]; c[i] = val;
    setForm({ ...form, secretClues: c });
  };
  const removeClue = (i) => {
    const c = form.secretClues.filter((_, idx) => idx !== i);
    setForm({ ...form, secretClues: c.length ? c : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.itemName || !form.location || !form.date) {
      return toast.error('Fill in required fields');
    }
    const validClues = form.secretClues.filter(c => c.trim());
    if (validClues.length === 0) return toast.error('Add at least one secret clue');

    setLoading(true);
    try {
      // await foundApi.create({ ...form, secretClues: validClues });
      toast.success('Found item recorded! AI matching has begun.');
      navigate('/admin/found-items');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
        <PackagePlus size={36} className="inline text-ink mr-2" />
        Found Item Intake<span className="text-accent">.</span>
      </h1>
      <p className="font-body text-lg text-pencil/60 mb-8">Admin-only intake form. This item goes into the hidden found database.</p>

      <div className="bg-ink/5 border-2 border-ink p-4 flex items-start gap-3 mb-6" style={{ borderRadius: RADIUS.wobblySm }}>
        <Info size={20} strokeWidth={2.5} className="text-ink flex-shrink-0 mt-0.5" />
        <p className="font-body text-sm text-pencil/70">This item will NOT be publicly visible. It enters the hidden database and is matched against lost reports using AI.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Submitter info */}
        <div className="relative bg-muted/30 border-2 border-dashed border-muted p-6" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold mb-4">Submitter Info</h2>
          <div className="space-y-4">
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Submitted by (student name or walk-in)</label>
              <div className="relative">
                <Type size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="text" name="submittedBy" value={form.submittedBy} onChange={set} placeholder="e.g. Priya M. / Walk-in" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 border-2 border-pencil flex items-center justify-center ${form.submitterAnonymous ? 'bg-ink' : 'bg-white'}`} style={{ borderRadius: '3px' }} onClick={() => setForm({ ...form, submitterAnonymous: !form.submitterAnonymous })}>
                {form.submitterAnonymous && <span className="text-white text-xs font-bold">Y</span>}
              </div>
              <span className="font-body text-base">Finder wants to stay anonymous</span>
            </label>
          </div>
        </div>

        {/* Item details */}
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
                <input type="text" name="itemName" value={form.itemName} onChange={set} placeholder="e.g. MacBook Charger" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
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
                  <input type="text" name="color" value={form.color} onChange={set} placeholder="e.g. White" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
                </div>
              </div>
            </div>
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Description</label>
              <textarea name="description" value={form.description} onChange={set} rows={3} placeholder="Physical condition, any visible details..." className="w-full p-4 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand resize-none" style={{ borderRadius: RADIUS.wobblySm }} />
            </div>
          </div>
        </div>

        {/* Secret clues */}
        <div className="relative bg-accent/5 border-2 border-accent p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="pin-tack" />
          <h2 className="font-heading text-2xl font-bold mb-2 pt-2 flex items-center gap-2"><Key size={22} strokeWidth={2.5} className="text-accent" /> Secret Clues</h2>
          <p className="font-body text-base text-pencil/60 mb-4">Details only the owner would know. Used for AI verification questions.</p>
          <div className="space-y-3">
            {form.secretClues.map((clue, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <Lock size={16} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/40" />
                  <input type="text" value={clue} onChange={(e) => updateClue(i, e.target.value)} placeholder={`Clue ${i + 1}: e.g. "Scratched bottom-left corner"`} className="w-full pl-10 pr-4 py-3 border-2 border-accent/50 bg-white font-body text-lg placeholder:text-pencil/30 focus-hand" style={{ borderRadius: RADIUS.wobblySm }} />
                </div>
                {form.secretClues.length > 1 && (
                  <button type="button" onClick={() => removeClue(i)} className="px-3 text-accent hover:text-red-700 font-bold text-xl">x</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addClue} className="mt-3 font-body text-base text-ink hover:text-accent transition-colors">+ Add another clue</button>
        </div>

        {/* Location / Date */}
        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold mb-4">Where and When</h2>
          <div className="space-y-4">
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Found at *</label>
              <div className="relative">
                <MapPin size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="text" name="location" value={form.location} onChange={set} placeholder="e.g. Room 204, Building A" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
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

        {/* Images */}
        <div className="relative bg-white border-2 border-dashed border-muted p-6" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2"><ImagePlus size={22} strokeWidth={2.5} /> Images</h2>
          <div className="border-2 border-dashed border-pencil/30 p-8 text-center hover:border-pencil transition-colors cursor-pointer" style={{ borderRadius: RADIUS.wobblySm }}>
            <ImagePlus size={40} strokeWidth={2} className="mx-auto text-pencil/30 mb-2" />
            <p className="font-body text-base text-pencil/50">Click or drag images</p>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Recording...' : <><Send size={20} strokeWidth={3} /> Record Found Item</>}
        </Button>
      </form>
    </div>
  );
}