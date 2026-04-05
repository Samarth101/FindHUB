import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/http';
import { toast } from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Updates app state and localStorage

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="tape-strip top-4 left-1/2 -ml-24 max-w-[140px] rotate-3" />
      
      <div 
        className="w-full max-w-md bg-white border-4 border-[#2d2d2d] p-8 relative"
        style={{ borderRadius: 'var(--radius-wobbly-md)', boxShadow: 'var(--shadow-hard-lg)' }}
      >
        <div className="pin-tack top-[-8px] right-8" />
        
        <div className="flex items-center gap-3 mb-8 border-b-4 border-[#2d2d2d] pb-4">
          <LogIn className="w-8 h-8 text-[#ff4d4d]" />
          <h2 className="text-3xl font-black text-[#2d2d2d] uppercase tracking-wide">
            Login
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-bold text-[#2d2d2d] mb-2">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 text-lg border-2 border-[#2d2d2d] focus-hand bg-[#fdfbf7]"
              style={{ borderRadius: 'var(--radius-wobbly)' }}
              placeholder="you@campus.edu"
            />
          </div>

          <div>
            <label className="block text-xl font-bold text-[#2d2d2d] mb-2">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 text-lg border-2 border-[#2d2d2d] focus-hand bg-[#fdfbf7]"
              style={{ borderRadius: 'var(--radius-wobbly-sm)' }}
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full btn-press bg-[#2d5da1] text-white p-4 font-bold text-xl uppercase tracking-wider disabled:opacity-50 mt-4"
            style={{ borderRadius: 'var(--radius-wobbly-md)', boxShadow: 'var(--shadow-hard)' }}
          >
            {loading ? 'Entering...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center font-medium text-gray-700">
          <span className="mr-2">Don't have an account?</span>
          <Link to="/register" className="text-[#ff4d4d] font-bold hover:underline underline-offset-4 decoration-2">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
