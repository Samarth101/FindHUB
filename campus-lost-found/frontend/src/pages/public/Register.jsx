import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/http';
import { toast } from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Log them in automatically after registration

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="tape-strip top-4 left-1/2 ml-20 max-w-[100px] -rotate-6" />
      
      <div 
        className="w-full max-w-md bg-postit border-4 border-[#2d2d2d] p-8 relative"
        style={{ borderRadius: 'var(--radius-wobbly)', boxShadow: 'var(--shadow-hard-lg)' }}
      >
        <div className="pin-tack top-[-8px] left-1/2" />
        
        <div className="flex items-center gap-3 mb-8 border-b-4 border-[#2d2d2d] pb-4 border-dashed">
          <UserPlus className="w-8 h-8 text-[#2d5da1]" />
          <h2 className="text-3xl font-black text-[#2d2d2d] uppercase tracking-wide">
            Sign Up
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xl font-bold text-[#2d2d2d] mb-1">Full Name</label>
            <input 
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 text-lg border-2 border-[#2d2d2d] focus-hand bg-white"
              style={{ borderRadius: 'var(--radius-wobbly-sm)' }}
              placeholder="Alex Student"
            />
          </div>

          <div>
            <label className="block text-xl font-bold text-[#2d2d2d] mb-1">Email Address</label>
            <input 
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 text-lg border-2 border-[#2d2d2d] focus-hand bg-white"
              style={{ borderRadius: 'var(--radius-wobbly)' }}
              placeholder="alex@campus.edu"
            />
          </div>

          <div>
            <label className="block text-xl font-bold text-[#2d2d2d] mb-1">Password</label>
            <input 
              type="password"
              name="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 text-lg border-2 border-[#2d2d2d] focus-hand bg-white"
              style={{ borderRadius: 'var(--radius-wobbly-md)' }}
              placeholder="Min. 8 characters"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full btn-press bg-[#ff4d4d] text-white p-4 font-bold text-xl uppercase tracking-wider disabled:opacity-50 mt-6"
            style={{ borderRadius: 'var(--radius-wobbly)', boxShadow: 'var(--shadow-hard)' }}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center font-medium text-gray-800">
          <span className="mr-2">Already have an account?</span>
          <Link to="/login" className="text-[#2d5da1] font-bold hover:underline underline-offset-4 decoration-2">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
