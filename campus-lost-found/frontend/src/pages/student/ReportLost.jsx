import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Tag, Palette, Type, FileText, ImagePlus, Send, Info } from 'lucide-react';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';
import { RADIUS, CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import api from '../../api/http';

const inputCls = 'w-full pl-10 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand';

export default function ReportLost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showThreadPrompt, setShowThreadPrompt] = useState(false);
  const [form, setForm] = useState({
    category: '', itemName: '', brand: '', color: '', description: '',
    distinguishingFeatures: '', location: '', date: '', images: [],
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.itemName || !form.location || !form.date) {
      return toast.error('Please fill in all required fields!');
    }
    setLoading(true);
    try {
      await api.post('/lost', form);
      toast.success('Lost item reported!');
      setShowThreadPrompt(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (showThreadPrompt) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="relative bg-postit border-[3px] border-pencil shadow-hard-lg p-8 text-center transform rotate-[0.5deg]" style={{ borderRadius: RADIUS.wobbly }}>
          <div className="tape-strip" />
          <h2 className="font-heading text-3xl font-bold mt-4 mb-3">Report submitted!</h2>
          <p className="font-body text-lg text-pencil/70 mb-6">
            Our AI is already searching for matches. Want to also start a public community thread so other students can help?
          </p>
          <p className="font-body text-sm text-pencil/50 mb-6 bg-white/50 p-3 border-2 border-dashed border-muted" style={{ borderRadius: RADIUS.wobblySm }}>
            <Info size={14} className="inline mr-1" />
            Only vague, non-identifying details will be shared publicly. No brand, model, or images.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="accent" onClick={() => navigate('/student/community')}>Yes, start thread</Button>
            <Button variant="ghost" onClick={() => navigate('/student/my-reports')}>No, skip</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">Report Lost Item<span className="text-accent">.</span></h1>
      <p className="font-body text-lg text-pencil/60 mb-8">Fill in as many details as you can. The more you share, the better our AI can match.</p>

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
                <input type="text" name="itemName" value={form.itemName} onChange={set} placeholder="e.g. Wireless Earbuds" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body text-base text-pencil/70 mb-1 block">Brand</label>
                <div className="relative">
                  <Tag size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                  <input type="text" name="brand" value={form.brand} onChange={set} placeholder="e.g. JBL" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
                </div>
              </div>
              <div>
                <label className="font-body text-base text-pencil/70 mb-1 block">Color</label>
                <div className="relative">
                  <Palette size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                  <input type="text" name="color" value={form.color} onChange={set} placeholder="e.g. Black, Blue" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
                </div>
              </div>
            </div>

            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Description</label>
              <textarea name="description" value={form.description} onChange={set} rows={3} placeholder="Any other details about the item..." className="w-full p-4 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand resize-none" style={{ borderRadius: RADIUS.wobblySm }} />
            </div>

            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Distinguishing Features (private - helps with verification)</label>
              <textarea name="distinguishingFeatures" value={form.distinguishingFeatures} onChange={set} rows={3} placeholder="Scratches, stickers, engravings, wallpaper... things only you would know" className="w-full p-4 border-2 border-ink bg-ink/5 font-body text-lg placeholder:text-pencil/30 focus-hand resize-none" style={{ borderRadius: RADIUS.wobblySm }} />
              <p className="font-body text-sm text-ink mt-1">This stays private and helps prove ownership.</p>
            </div>
          </div>
        </div>

        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="pin-tack" />
          <h2 className="font-heading text-2xl font-bold mb-4 pt-2">Where and When</h2>

          <div className="space-y-4">
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Last seen location *</label>
              <div className="relative">
                <MapPin size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="text" name="location" value={form.location} onChange={set} placeholder="e.g. Library 2nd floor, Lab 10" className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Date lost *</label>
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

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Submitting...' : <><Send size={20} strokeWidth={3} /> Submit Report</>}
        </Button>
      </form>
    </div>
  );
}