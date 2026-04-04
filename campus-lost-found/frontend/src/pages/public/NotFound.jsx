import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4">
      <div 
        className="max-w-lg w-full bg-white border-4 border-[#2d2d2d] p-10 text-center relative"
        style={{ borderRadius: 'var(--radius-blob)', boxShadow: 'var(--shadow-hard-lg)' }}
      >
        <div className="tape-strip top-[-10px] left-1/2 -ml-10 rotate-3 max-w-[80px]" />
        
        <Ghost className="w-24 h-24 text-[#ff4d4d] mx-auto mb-6 drop-shadow-md" />
        
        <h1 className="text-6xl font-black text-[#2d2d2d] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 uppercase">
          Page <span className="wavy-underline text-[#2d5da1]">Not Found</span>
        </h2>
        
        <p className="text-lg text-gray-600 font-medium mb-8">
          It seems this page has been lost to the campus void. 
          Maybe someone found it? (Probably not).
        </p>

        <Link 
          to="/"
          className="inline-block btn-press bg-[#2d2d2d] text-white px-8 py-3 font-bold text-xl uppercase tracking-wider"
          style={{ borderRadius: 'var(--radius-wobbly-sm)', boxShadow: 'var(--shadow-hard-hover)' }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
