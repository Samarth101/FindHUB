import { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, Camera, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { RADIUS } from '../../utils/constants';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/http';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ lost: 0, found: 0, returned: 0 });

  // Populate form from real user context
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setStats({
        lost: user.lostCount || 0,
        found: user.foundCount || 0,
        returned: user.returnedCount || 0,
      });
    }
  }, [user]);

  // Also fetch live counts from backend
  useEffect(() => {
    api.get('/lost/mine', { params: { limit: 0 } })
      .then(res => setStats(prev => ({ ...prev, lost: res.data.total || 0 })))
      .catch(() => {});
  }, []);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
      });
      // Update global auth context with the fresh user data
      if (res.data.user) {
        setUser(res.data.user);
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full pl-10 pr-4 py-3 border-2 border-[#2d2d2d] bg-white dark:bg-[#333] dark:text-white font-body text-lg placeholder:text-gray-300';

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h1 className="font-heading text-4xl md:text-5xl font-bold dark:text-white">Profile<span className="text-[#ff4d4d]">.</span></h1>

      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className="w-24 h-24 bg-[#fef3c7] border-[3px] border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] flex items-center justify-center font-heading text-4xl font-bold text-[#2d2d2d]"
            style={{ borderRadius: RADIUS.blob }}
          >
            {form.name?.[0]?.toUpperCase() || '?'}
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#ff4d4d] text-white border-2 border-[#2d2d2d] rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Change avatar"
          >
            <Camera size={14} strokeWidth={3} />
          </button>
        </div>
        <p className="font-heading text-2xl font-bold mt-3 dark:text-white">{form.name || 'No name set'}</p>
        <p className="font-body text-base text-gray-500 capitalize">{user?.role || 'student'}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-6 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold mb-4 pt-3 dark:text-white">Personal Info</h2>

          <div className="space-y-4">
            <div>
              <label className="font-body text-base text-gray-500 mb-1 block">Full Name</label>
              <div className="relative">
                <User size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="name" value={form.name} onChange={set} className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} />
              </div>
            </div>
            <div>
              <label className="font-body text-base text-gray-500 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={set} className={`${inputCls} opacity-60 cursor-not-allowed`} style={{ borderRadius: RADIUS.wobblySm }} disabled />
              </div>
              <p className="font-body text-sm text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="font-body text-base text-gray-500 mb-1 block">Phone</label>
              <div className="relative">
                <Phone size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" name="phone" value={form.phone} onChange={set} className={inputCls} style={{ borderRadius: RADIUS.wobblySm }} placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><Save size={20} strokeWidth={3} /> Save changes</>}
        </Button>
      </form>

      {/* Activity stats - from real data */}
      <div className="relative bg-gray-50 dark:bg-[#222] border-2 border-dashed border-gray-300 dark:border-gray-600 p-6" style={{ borderRadius: RADIUS.wobblyMd }}>
        <h3 className="font-heading text-xl font-bold mb-3 dark:text-white">Your Activity</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-heading text-2xl font-bold dark:text-white">{stats.lost}</p>
            <p className="font-body text-sm text-gray-500">Lost Reports</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold dark:text-white">{stats.found}</p>
            <p className="font-body text-sm text-gray-500">Found Reports</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold dark:text-white">{stats.returned}</p>
            <p className="font-body text-sm text-gray-500">Items Returned</p>
          </div>
        </div>
      </div>
    </div>
  );
}