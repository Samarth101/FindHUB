import { BarChart3, TrendingUp, Package, Clock, CheckCircle2, FileText } from 'lucide-react';
import { RADIUS } from '../../utils/constants';

const weeklyData = [
  { day: 'Mon', lost: 5, found: 3, returned: 1 },
  { day: 'Tue', lost: 8, found: 6, returned: 3 },
  { day: 'Wed', lost: 4, found: 7, returned: 2 },
  { day: 'Thu', lost: 12, found: 5, returned: 4 },
  { day: 'Fri', lost: 9, found: 8, returned: 5 },
  { day: 'Sat', lost: 3, found: 2, returned: 1 },
  { day: 'Sun', lost: 2, found: 1, returned: 0 },
];

const topCategories = [
  { name: 'Electronics', count: 45, pct: 35 },
  { name: 'Water Bottles', count: 28, pct: 22 },
  { name: 'ID / Documents', count: 22, pct: 17 },
  { name: 'Keys', count: 18, pct: 14 },
  { name: 'Books & Notes', count: 14, pct: 11 },
];

const topLocations = [
  { name: 'Library', count: 32 },
  { name: 'Canteen', count: 28 },
  { name: 'Lab 10', count: 15 },
  { name: 'Parking Lot B', count: 12 },
  { name: 'Auditorium', count: 8 },
];

const kpis = [
  { label: 'Avg Return Time', value: '1.8 days', icon: Clock, change: '-0.3d from last month' },
  { label: 'Return Rate', value: '73%', icon: CheckCircle2, change: '+5% from last month' },
  { label: 'AI Match Accuracy', value: '91%', icon: TrendingUp, change: 'Stable' },
  { label: 'Active Reports', value: '34', icon: FileText, change: '12 new this week' },
];

export default function Analytics() {
  const maxLost = Math.max(...weeklyData.map(d => d.lost));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Analytics<span className="text-accent">.</span></h1>
        <p className="font-body text-lg text-pencil/60 mt-1">Platform performance and trends.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, change }, i) => (
          <div key={label} className={`bg-white border-2 border-pencil p-5 shadow-hard-sm ${i % 2 === 0 ? 'rotate-[0.3deg]' : '-rotate-[0.3deg]'}`} style={{ borderRadius: RADIUS.wobblyMd }}>
            <Icon size={20} strokeWidth={2.5} className="text-ink mb-2" />
            <p className="font-heading text-3xl font-bold">{value}</p>
            <p className="font-body text-sm text-pencil/60">{label}</p>
            <p className="font-body text-xs text-pencil/40 mt-1">{change}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Weekly chart */}
        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="tape-strip" />
          <h2 className="font-heading text-2xl font-bold mb-6 pt-2">Weekly Breakdown</h2>
          <div className="flex items-end gap-2 h-44">
            {weeklyData.map(({ day, lost, found, returned }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-[2px] items-end w-full justify-center">
                  <div className="w-3 bg-accent border border-pencil/50" style={{ height: `${(lost / maxLost) * 120}px`, borderRadius: '3px 3px 0 0' }} />
                  <div className="w-3 bg-ink border border-pencil/50" style={{ height: `${(found / maxLost) * 120}px`, borderRadius: '3px 3px 0 0' }} />
                  <div className="w-3 bg-green-500 border border-pencil/50" style={{ height: `${(returned / maxLost) * 120}px`, borderRadius: '3px 3px 0 0' }} />
                </div>
                <span className="font-body text-xs text-pencil/50">{day}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 font-body text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-accent border border-pencil/50" /> Lost</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-ink border border-pencil/50" /> Found</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-500 border border-pencil/50" /> Returned</span>
          </div>
        </div>

        {/* Top Categories */}
        <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
          <div className="pin-tack" />
          <h2 className="font-heading text-2xl font-bold mb-6 pt-2">Top Categories</h2>
          <div className="space-y-4">
            {topCategories.map(({ name, count, pct }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-base">{name}</span>
                  <span className="font-body text-sm text-pencil/50">{count} items ({pct}%)</span>
                </div>
                <div className="w-full h-4 bg-muted border border-pencil/20 overflow-hidden" style={{ borderRadius: '999px' }}>
                  <div className="h-full bg-ink" style={{ width: `${pct}%`, borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Locations */}
      <div className="relative bg-white border-2 border-pencil p-6 shadow-hard-sm" style={{ borderRadius: RADIUS.wobblyMd }}>
        <h2 className="font-heading text-2xl font-bold mb-6">Hotspot Locations</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topLocations.map(({ name, count }, i) => (
            <div key={name} className={`text-center p-4 border-2 border-pencil bg-postit/50 ${i % 2 === 0 ? 'rotate-[1deg]' : '-rotate-[1deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              <p className="font-heading text-2xl font-bold">{count}</p>
              <p className="font-body text-sm text-pencil/60">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}