import { useState } from 'react';
import { User, Mail, Phone, Save, Camera } from 'lucide-react';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { useAuth } from '../../auth/useAuth';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || 'Rahul Sharma',
    email: user?.email || 'rahul@college.edu',
    phone: user?.phone || '+91 98765 43210',
  });
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Profile updated!');
    setLoading(false);
  };

  const inputCls = 'w-full pl-10 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand';

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h1 className="font-heading text-4xl md:text-5xl font-bold">Profile<span className="text-accent">.</span></h1>

      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className="w-24 h-24 bg-postit border-[3px] border-pencil shadow-hard flex items-center justify-center font-heading text-4xl font-bold"
            style={{ borderRadius: RADIUS.blob }}
          >
            {form.name[0]?.toUpperCase()}
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent text-white border-2 border-pencil rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Change avatar"
          >
            <Camera size={14} strokeWidth={3} />
          </button>
        </div>
        <p className="font-heading text-2xl font-bold mt-3">{form.name}</p>
        <p className="font-body text-base text-pencil/50">Student</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="tape-strip" />
          <h2 className="font-heading text-2xl font-bold mb-4 pt-3">Personal Info</h2>

          <div className="space-y-4">
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Full Name</label>
              <div className="relative">
                <User size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="text" name="name" value={form.name} onChange={set} className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="email" name="email" value={form.email} onChange={set} className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} disabled />
              </div>
              <p className="font-body text-sm text-pencil/40 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="font-body text-base text-pencil/70 mb-1 block">Phone</label>
              <div className="relative">
                <Phone size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil/40" />
                <input type="tel" name="phone" value={form.phone} onChange={set} className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Saving...' : <><Save size={20} strokeWidth={3} /> Save changes</>}
        </Button>
      </form>

      {/* Stats summary */}
      <div className="relative bg-muted/30 border-2 border-dashed border-muted p-6" style={{ borderRadius: RADIUS.wobblyMd }}>
        <h3 className="font-heading text-xl font-bold mb-3">Your Activity</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-heading text-2xl font-bold">3</p>
            <p className="font-body text-sm text-pencil/50">Lost Reports</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold">1</p>
            <p className="font-body text-sm text-pencil/50">Found Reports</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold">1</p>
            <p className="font-body text-sm text-pencil/50">Items Returned</p>
          </div>
        </div>
      </div>
    </div>
  );
}