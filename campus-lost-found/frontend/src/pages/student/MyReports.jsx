import { useState, useEffect } from 'react'
import { FileSearch, Eye, Trash2, Loader2 } from 'lucide-react'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { RADIUS } from '../../utils/constants'
import { formatDate } from '../../utils/formatDate'
import api from '../../api/http'
import toast from 'react-hot-toast'

const statusVariant = { searching: 'warning', matched: 'info', returned: 'success', closed: 'default', unmatched: 'warning', claimed: 'info' }

export default function MyReports() {
  const [tab, setTab] = useState('lost')
  const [lostReports, setLostReports] = useState([])
  const [foundReports, setFoundReports] = useState([])
  const [lostTotal, setLostTotal] = useState(0)
  const [foundTotal, setFoundTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/lost/mine', { params: { limit: 50 } }).catch(() => ({ data: { reports: [], total: 0 } })),
      api.get('/found').catch(() => ({ data: { items: [] } }))
    ])
      .then(([resLost, resFound]) => {
        setLostReports(resLost.data.reports || [])
        setLostTotal(resLost.data.total || 0)
        setFoundReports(resFound.data.items || [])
        setFoundTotal((resFound.data.items || []).length)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteLost = async (id) => {
    if (!confirm('Delete this report?')) return
    try {
      await api.delete(`/lost/${id}`)
      toast.success('Report deleted')
      setLostReports(prev => prev.filter(r => r._id !== id))
    } catch {
      toast.error('Failed to delete')
    }
  }

  const reports = tab === 'lost' ? lostReports : foundReports

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-4xl font-bold">My Reports<span className="text-[#ff4d4d]">.</span></h1>

      <div className="flex gap-2">
        <Button variant={tab === 'lost' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('lost')}>
          <FileSearch size={18} strokeWidth={2.5} /> Lost ({lostTotal})
        </Button>
        <Button variant={tab === 'found' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('found')}>
          <Eye size={18} strokeWidth={2.5} /> Found ({foundTotal})
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#2d5da1]" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No reports yet.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <div key={r._id} className={`bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-between gap-4 ${i % 2 === 0 ? 'rotate-[0.1deg]' : '-rotate-[0.1deg]'}`} style={{ borderRadius: RADIUS.wobblySm }}>
              <div className="flex items-center gap-3 min-w-0">
                {tab === 'lost' ? (
                  <FileSearch size={20} className="text-[#ff4d4d] flex-shrink-0" />
                ) : (
                  <Eye size={20} className="text-[#2d5da1] flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-bold dark:text-white truncate">{r.itemName}</p>
                  <p className="text-sm text-gray-400">
                    {r.category} · {r.location} · {formatDate(tab === 'lost' ? r.dateLost : r.dateFound)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={statusVariant[r.status] || 'default'}>{r.status}</Badge>
                {tab === 'lost' && (
                  <button onClick={() => handleDeleteLost(r._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}