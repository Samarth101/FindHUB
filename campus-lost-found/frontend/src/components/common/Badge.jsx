import React from 'react';

const variants = {
  default: 'bg-gray-100 text-gray-700 border-gray-300',
  success: 'bg-green-100 text-green-800 border-green-300',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  accent:  'bg-red-100 text-red-700 border-red-300',
  info:    'bg-blue-100 text-blue-700 border-blue-300',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider
        border rounded-full whitespace-nowrap
        ${variants[variant] || variants.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
