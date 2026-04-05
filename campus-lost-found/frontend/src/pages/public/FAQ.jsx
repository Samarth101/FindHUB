import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      q: "How does FindHUB protect my lost item?",
      a: "Found items are hidden from public view. To claim an item, you submit a lost report. Our AI matches your report to the hidden found items, and you must answer secret questions to prove ownership."
    },
    {
      q: "What if the AI doesn't find a match?",
      a: "Your lost report stays active. If someone finds and reports your item days later, the AI will instantly notify you of the new match."
    },
    {
      q: "Where do I drop off an item I found?",
      a: "You hang onto it! Once the owner's claim is verified, you will both be placed in a secure chat room to schedule a handover location on campus."
    }
  ];

  return (
    <div className="min-h-[85vh] flex flex-col items-center pt-12 px-4 relative">
      <div className="max-w-3xl w-full">
        <div className="flex items-center gap-4 mb-10">
          <HelpCircle className="w-10 h-10 text-[#4caf50]" />
          <h1 className="text-4xl md:text-5xl font-black text-[#2d2d2d] uppercase">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white border-4 border-[#2d2d2d] p-6 relative hover:-translate-y-1 transition-transform"
              style={{ 
                borderRadius: idx % 2 === 0 ? 'var(--radius-wobbly)' : 'var(--radius-wobbly-sm)',
                boxShadow: 'var(--shadow-hard-sm)'
              }}
            >
              <div className="pin-tack top-[-8px] left-8" />
              <h3 className="text-2xl font-bold text-[#2d5da1] mb-2">{faq.q}</h3>
              <p className="text-lg text-gray-700 font-medium">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
