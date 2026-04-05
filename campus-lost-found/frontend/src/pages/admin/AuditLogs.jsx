import { useState, useEffect } from 'react';
import { ScrollText, Loader2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { RADIUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';
import api from '../../api/http';

const severityVariant = { low: 'default', medium: 'warning', high: 'accent' };

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs', { params: { limit: 100 } })
      .then(res => { setLogs(res.data.logs || []); setTotal(res.data.total || 0); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2d5da1]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold dark:text-white">Audit Logs<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">{total} total entries. Every admin action is recorded.</p>
      </div>
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-body text-xl">No audit log entries yet.</p>
          </div>
        ) : logs.map(entry => (
          <div key={entry._id} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between gap-3" style={{ borderRadius: RADIUS.wobblySm }}>
            <div className="flex items-center gap-3 min-w-0">
              <ScrollText size={16} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-body text-sm dark:text-white"><span className="font-bold">{entry.actor?.name || 'System'}</span> — {entry.action}</p>
                <p className="font-body text-xs text-gray-400">{entry.target} · {formatDateTime(entry.createdAt)}</p>
              </div>
            </div>
            <Badge variant={severityVariant[entry.severity] || 'default'}>{entry.severity || 'low'}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}