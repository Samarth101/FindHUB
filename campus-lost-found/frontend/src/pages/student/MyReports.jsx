import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, Eye, Package, MapPin, Calendar, Trash2, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

const mockLost = [
  { id: 'l1', itemName: 'Blue JBL Earbuds', category: 'Electronics', color: 'Blue', location: 'Library 2nd floor', date: '2026-03-28', status: 'searching', hasMatch: true },
  { id: 'l2', itemName: 'Black Water Bottle', category: 'Water Bottles', color: 'Black', location: 'Canteen', date: '2026-04-01', status: 'searching', hasMatch: false },
  { id: 'l3', itemName: 'Student ID Card', category: 'ID / Documents', color: '', location: 'Parking Lot B', date: '2026-03-15', status: 'returned', hasMatch: true },
];

const mockFound = [
  { id: 'f1', itemName: 'Red Notebook', category: 'Books & Notes', location: 'Lab 10', date: '2026-04-02', status: 'submitted' },
];

const statusBadge = {
  searching: { variant: 'warning', label: 'Searching' },
  matched:   { variant: 'info',    label: 'Match found' },
  returned:  { variant: 'success', label: 'Returned' },
  submitted: { variant: 'default', label: 'Submitted' },
};

export default function MyReports() {
  const [tab, setTab] = useState('lost');

  const reports = tab === 'lost' ? mockLost : mockFound;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">My Reports<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Track all your lost and found submissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('lost')}
          className={`flex items-center gap-2 px-5 py-2.5 font-body text-lg border-2 transition-all duration-100 ${
            tab === 'lost'
              ? 'bg-accent text-white border-pencil shadow-hard-hover translate-x-[1px] translate-y-[1px]'
              : 'bg-white text-pencil border-pencil hover:bg-muted'
          }`}
          style={{ borderRadius: RADIUS.wobblySm }}
        >
          <FileSearch size={18} strokeWidth={2.5} /> Lost ({mockLost.length})
        </button>
        <button
          onClick={() => setTab('found')}
          className={`flex items-center gap-2 px-5 py-2.5 font-body text-lg border-2 transition-all duration-100 ${
            tab === 'found'
              ? 'bg-ink text-white border-pencil shadow-hard-hover translate-x-[1px] translate-y-[1px]'
              : 'bg-white text-pencil border-pencil hover:bg-muted'
          }`}
          style={{ borderRadius: RADIUS.wobblySm }}
        >
          <Eye size={18} strokeWidth={2.5} /> Found ({mockFound.length})
        </button>
      </div>

      {/* Report Cards */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} strokeWidth={2} className="mx-auto text-pencil/20 mb-4" />
            <p className="font-body text-xl text-pencil/50">No {tab} reports yet.</p>
            <Link to={`/student/report-${tab}`} className="inline-block mt-4">
              <Button>Report {tab} item</Button>
            </Link>
          </div>
        ) : (
          reports.map((report, i) => {
            const badge = statusBadge[report.status] || statusBadge.searching;
            return (
              <div
                key={report.id}
                className={`relative bg-white border-2 border-pencil p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`}
                style={{ borderRadius: RADIUS.wobblyMd }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-muted/50 border-2 border-muted flex items-center justify-center" style={{ borderRadius: RADIUS.blob }}>
                      <Package size={22} strokeWidth={2.5} className="text-pencil/50" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold">{report.itemName}</h3>
                      <p className="font-body text-sm text-pencil/50">{report.category}</p>
                      <div className="flex flex-wrap gap-3 mt-2 font-body text-sm text-pencil/60">
                        {report.location && <span className="flex items-center gap-1"><MapPin size={14} /> {report.location}</span>}
                        <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(report.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {report.hasMatch && tab === 'lost' && (
                      <Link to={`/student/verify/${report.id}`}>
                        <Button size="sm" variant="accent">
                          Verify <ArrowRight size={14} strokeWidth={3} />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}