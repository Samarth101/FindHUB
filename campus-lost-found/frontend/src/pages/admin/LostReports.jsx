import { useState } from 'react';
import { FileText, MapPin, Calendar, Search, User, Eye, Tag } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

const mockLost = [
  { id: 'l1', itemName: 'Blue JBL Earbuds', category: 'Electronics', color: 'Blue', location: 'Library 2nd floor', date: '2026-03-28', status: 'matched', student: 'Rahul S.' },
  { id: 'l2', itemName: 'Black Water Bottle', category: 'Water Bottles', color: 'Black', location: 'Canteen', date: '2026-04-01', status: 'searching', student: 'Amit K.' },
  { id: 'l3', itemName: 'Student ID Card', category: 'ID / Documents', color: '', location: 'Parking Lot B', date: '2026-03-15', status: 'returned', student: 'Priya M.' },
  { id: 'l4', itemName: 'Scientific Calculator', category: 'Electronics', color: 'Gray', location: 'Lab 10', date: '2026-04-03', status: 'searching', student: 'Neha R.' },
  { id: 'l5', itemName: 'Red Keychain', category: 'Keys', color: 'Red', location: 'Main Gate', date: '2026-03-30', status: 'matched', student: 'Vikram D.' },
];

const statusCfg = {
  searching: { variant: 'warning', label: 'Searching' },
  matched:   { variant: 'info',    label: 'Matched' },
  returned:  { variant: 'success', label: 'Returned' },
};

export default function LostReports() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = mockLost.filter(l => {
    const matchesSearch = l.itemName.toLowerCase().includes(search.toLowerCase()) || l.student.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || l.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Lost Reports<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">All student-submitted lost item reports.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-pencil/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item or student..." className="w-full pl-12 pr-4 py-3 border-2 border-pencil bg-white font-body text-lg placeholder:text-pencil/30 focus-hand" style={{ borderRadius: RADIUS.wobblySm }} />
        </div>
        <div className="flex gap-2">
          {['all', 'searching', 'matched', 'returned'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 border-2 font-body text-base capitalize transition-all ${filter === f ? 'bg-accent text-white border-pencil shadow-hard-hover' : 'bg-white text-pencil border-pencil hover:bg-muted'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((report, i) => {
          const cfg = statusCfg[report.status] || statusCfg.searching;
          return (
            <div key={report.id} className={`bg-white border-2 border-pencil p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.15deg]' : '-rotate-[0.15deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 border-2 border-accent flex items-center justify-center flex-shrink-0" style={{ borderRadius: RADIUS.blob }}>
                    <FileText size={18} strokeWidth={2.5} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold">{report.itemName}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 font-body text-sm text-pencil/50">
                      <span className="flex items-center gap-1"><Tag size={12} /> {report.category}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {report.location}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(report.date)}</span>
                      <span className="flex items-center gap-1"><User size={12} /> {report.student}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  <button className="p-1 text-pencil/30 hover:text-ink transition-colors"><Eye size={16} strokeWidth={2.5} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} strokeWidth={2} className="mx-auto text-pencil/15 mb-4" />
            <p className="font-body text-xl text-pencil/40">No reports match.</p>
          </div>
        )}
      </div>
    </div>
  );
}