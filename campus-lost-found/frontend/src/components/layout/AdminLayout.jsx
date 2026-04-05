import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
