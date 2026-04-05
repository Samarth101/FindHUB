import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 pb-12 px-4">
      {/* Tape decorations */}
      <div className="tape-strip top-4 left-1/4 max-w-[120px]" />
      <div className="tape-strip top-12 right-1/4 max-w-[90px] rotate-6" />
      
      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center mb-20 relative">
        <h1 className="text-6xl md:text-8xl font-black text-[#2d2d2d] mb-6 tracking-tight leading-none">
          Lost it? <br className="md:hidden" />
          <span className="wavy-underline text-[#2d5da1]">FindHUB</span> it.
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-2xl mx-auto mb-10">
          The smart campus lost and found. We use AI to confidentially match lost items to found items, keeping thieves out and your stuff safe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/register" 
            className="btn-press bg-[#ff4d4d] text-white px-8 py-4 text-xl font-bold uppercase tracking-wider relative"
            style={{ borderRadius: 'var(--radius-wobbly)' }}
          >
            <div className="pin-tack top-[-8px] right-4" />
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="btn-press bg-white text-[#2d2d2d] border-4 border-[#2d2d2d] px-8 py-4 text-xl font-bold uppercase tracking-wider bg-postit"
            style={{ borderRadius: 'var(--radius-wobbly-md)' }}
          >
            Log In
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {/* Card 1 */}
        <div 
          className="bg-white border-4 border-[#2d2d2d] p-8 relative hover:-translate-y-2 transition-transform duration-300"
          style={{ borderRadius: 'var(--radius-wobbly-sm)', boxShadow: 'var(--shadow-hard-lg)' }}
        >
          <div className="pin-tack top-[-8px] left-1/2" />
          <ShieldAlert className="w-12 h-12 text-[#ff4d4d] mb-4" />
          <h3 className="text-2xl font-bold mb-3 text-[#2d2d2d]">Anti-Theft Privacy</h3>
          <p className="text-gray-700 font-medium">
            Found items are NEVER listed publicly. You have to prove ownership through secret clues to claim your stuff.
          </p>
        </div>

        {/* Card 2 */}
        <div 
          className="bg-postit border-4 border-[#2d2d2d] p-8 relative hover:-translate-y-2 transition-transform duration-300"
          style={{ borderRadius: 'var(--radius-wobbly)', boxShadow: 'var(--shadow-hard-lg)' }}
        >
          <Sparkles className="w-12 h-12 text-[#2d5da1] mb-4" />
          <h3 className="text-2xl font-bold mb-3 text-[#2d2d2d]">AI Matching</h3>
          <p className="text-gray-700 font-medium">
            Just describe what you lost. Our smart AI instantly scans the hidden database and alerts you if there's a match.
          </p>
        </div>

        {/* Card 3 */}
        <div 
          className="bg-white border-4 border-[#2d2d2d] p-8 relative hover:-translate-y-2 transition-transform duration-300"
          style={{ borderRadius: 'var(--radius-wobbly-md)', boxShadow: 'var(--shadow-hard-lg)' }}
        >
          <div className="tape-strip top-[-12px] right-8 rotate-12" />
          <MapPin className="w-12 h-12 text-[#4caf50] mb-4" />
          <h3 className="text-2xl font-bold mb-3 text-[#2d2d2d]">Campus Hotspots</h3>
          <p className="text-gray-700 font-medium">
            Find out where items are most frequently lost on campus through our live interactive community maps.
          </p>
        </div>
      </div>
    </div>
  );
}
