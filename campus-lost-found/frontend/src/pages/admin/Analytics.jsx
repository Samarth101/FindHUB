import { useState, useEffect } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { RADIUS } from '../../utils/constants';
import api from '../../api/http';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  const metrics = [
    { label: 'Total Lost Reports', value: stats?.lost || 0 },
    { label: 'Total Found Items', value: stats?.found || 0 },
    { label: 'AI Matches Generated', value: stats?.matches || 0 },
    { label: 'Pending Claims', value: stats?.pendingClaims || 0 },
    { label: 'Completed Handovers', value: stats?.completedHandovers || 0 },
    { label: 'Registered Users', value: stats?.users || 0 },
  ];

  const returnRate = stats?.lost > 0 ? Math.round((stats.completedHandovers / stats.lost) * 100) : 0;
  const matchRate = stats?.lost > 0 ? Math.round((stats.matches / stats.lost) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Analytics<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">Platform performance metrics from live database.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-5 shadow-[2px_2px_0px_#2d2d2d] text-center" style={{ borderRadius: RADIUS.wobblyMd }}>
            <p className="font-heading text-3xl font-bold text-[#2d5da1] dark:text-white">{value}</p>
            <p className="font-body text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-6 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h3 className="font-heading text-xl font-bold mb-4 dark:text-white">Return Rate</h3>
          <div className="flex items-center gap-4">
            <div className="w-full h-6 bg-gray-200 border border-gray-300 overflow-hidden" style={{ borderRadius: '999px' }}>
              <div className="h-full bg-green-500 transition-all" style={{ width: `${returnRate}%` }} />
            </div>
            <span className="font-heading text-2xl font-bold text-green-600">{returnRate}%</span>
          </div>
          <p className="font-body text-sm text-gray-400 mt-2">{stats?.completedHandovers || 0} items returned out of {stats?.lost || 0} lost reports.</p>
        </div>

        <div className="bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-6 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h3 className="font-heading text-xl font-bold mb-4 dark:text-white">AI Match Rate</h3>
          <div className="flex items-center gap-4">
            <div className="w-full h-6 bg-gray-200 border border-gray-300 overflow-hidden" style={{ borderRadius: '999px' }}>
              <div className="h-full bg-[#2d5da1] transition-all" style={{ width: `${Math.min(matchRate, 100)}%` }} />
            </div>
            <span className="font-heading text-2xl font-bold text-[#2d5da1]">{matchRate}%</span>
          </div>
          <p className="font-body text-sm text-gray-400 mt-2">{stats?.matches || 0} matches from {stats?.lost || 0} reports.</p>
        </div>
      </div>
    </div>
  );
}