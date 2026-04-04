import { useState } from 'react';
import { Package, MapPin, Calendar, Search, Eye, Trash2, Tag } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

const mockFound = [
  { id: 'f1', itemName: 'MacBook Charger', category: 'Electronics', color: 'White', location: 'Room 204', date: '2026-04-02', status: 'unmatched', clueCount: 3, submittedBy: 'Priya M.' },
  { id: 'f2', itemName: 'Blue JBL Earbuds', category: 'Electronics', color: 'Blue', location: 'Library', date: '2026-03-28', status: 'matched', clueCount: 2, submittedBy: 'Walk-in' },
  { id: 'f3', itemName: 'Red Notebook', category: 'Books & Notes', color: 'Red', location: 'Lab 10', date: '2026-04-01', status: 'unmatched', clueCount: 1, submittedBy: 'Amit K.' },
  { id: 'f4', itemName: 'Student ID Card', category: 'ID / Documents', color: '', location: 'Canteen', date: '2026-03-20', status: 'returned', clueCount: 2, submittedBy: 'Anonymous' },
  { id: 'f5', itemName: 'Black Backpack', category: 'Bags & Backpacks', color: 'Black', location: 'Parking B', date: '2026-03-25', status: 'matched', clueCount: 4, submittedBy: 'Walk-in' },
];

const statusCfg = {
  unmatched: { variant: 'warning', label: 'Unmatched' },
  matched:   { variant: 'info',    label: 'Matched' },
  claimed:   { variant: 'accent',  label: 'Claimed' },
  returned:  { variant: 'success', label: 'Returned' },
};

export default function FoundItems() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = mockFound.filter(f => {
    const matchesSearch = f.itemName.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || f.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Found Items<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Hidden database - only visible to admins. {mockFound.length} total items.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-pencil/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="w-full pl-12 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand" style={{ borderRadius: RADIUS.wobblySm }} />
        </div>
        <div className="flex gap-2">
          {['all', 'unmatched', 'matched', 'returned'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 border-2 font-body text-base capitalize transition-all ${filter === f ? 'bg-ink text-white border-pencil shadow-hard-hover' : 'bg-white text-pencil border-pencil hover:bg-muted'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table-style cards */}
      <div className="space-y-3">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 font-body text-sm text-pencil/50 uppercase tracking-wider">
          <span className="col-span-3">Item</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-2">Location</span>
          <span className="col-span-2">Date</span>
          <span className="col-span-1">Clues</span>
          <span className="col-span-2">Status</span>
        </div>
        <div className="dashed-sep" />

        {filtered.map((item, i) => {
          const cfg = statusCfg[item.status] || statusCfg.unmatched;
          return (
            <div key={item.id} className={`bg-white border-2 border-pencil p-4 md:p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.15deg]' : '-rotate-[0.15deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-2">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/50 border-2 border-muted flex items-center justify-center flex-shrink-0" style={{ borderRadius: RADIUS.blob }}>
                    <Package size={18} strokeWidth={2.5} className="text-pencil/50" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold">{item.itemName}</p>
                    <p className="font-body text-xs text-pencil/40">by {item.submittedBy}</p>
                  </div>
                </div>
                <span className="col-span-2 font-body text-base text-pencil/70 flex items-center gap-1"><Tag size={14} /> {item.category}</span>
                <span className="col-span-2 font-body text-base text-pencil/60 flex items-center gap-1"><MapPin size={14} /> {item.location}</span>
                <span className="col-span-2 font-body text-base text-pencil/60 flex items-center gap-1"><Calendar size={14} /> {formatDate(item.date)}</span>
                <span className="col-span-1 font-body text-base"><Badge variant="default">{item.clueCount} clues</Badge></span>
                <div className="col-span-2 flex items-center gap-2">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  <button className="p-1 text-pencil/30 hover:text-ink transition-colors" title="View details"><Eye size={16} strokeWidth={2.5} /></button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} strokeWidth={2} className="mx-auto text-pencil/15 mb-4" />
            <p className="font-body text-xl text-pencil/40">No items match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}