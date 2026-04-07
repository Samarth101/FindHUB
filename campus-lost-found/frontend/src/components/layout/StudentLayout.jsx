import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function StudentLayout({ children }) {
  return (
    <div className="sm:h-screen bg-[#fdfbf7] flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
