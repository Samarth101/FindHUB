import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch, Eye, ShieldCheck, MessageCircle, AlertTriangle, CheckCircle2, ArrowRight, TrendingUp, Package, Loader2 } from 'lucide-react'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { RADIUS } from '../../utils/constants'
import { timeAgo } from '../../utils/formatDate'
import api from '../../api/http'

const statusColor = { pending_verify: 'warning', pending: 'warning', verified: 'success', rejected: 'accent', manual_review: 'info' }

export default function Dashboard() {
  const [counts, setCounts] = useState({ lost: 0, found: 0, matches: 0, returned: 0 })
  const [recentMatches, setRecentMatches] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [resLost, resFound, resMatches] = await Promise.all([
          api.get('/lost/mine').catch(() => ({ data: { reports: [], total: 0 } })),
          api.get('/found').catch(() => ({ data: { items: [] } })),
          api.get('/matches/mine').catch(() => ({ data: { matches: [] } }))
        ])

        const lostReports = resLost.data?.reports || []
        const foundReports = resFound.data?.items || []
        const matches = resMatches.data?.matches || []

        const totalLost = resLost.data?.total || lostReports.length
        const totalFound = foundReports.length
        const pendingMatches = matches.filter(m => m.status === 'pending_verify' || m.status === 'pending').length
        const verifiedMatches = matches.filter(m => m.status === 'verified').length

        setCounts({
          lost: totalLost,
          found: totalFound,
          matches: pendingMatches,
          returned: verifiedMatches
        })

        setRecentMatches(matches.slice(0, 3).map(m => ({
          id: m._id,
          itemName: m.lostReport?.itemName || 'Unknown Item',
          score: m.score || 0,
          status: m.status || 'pending',
          time: m.createdAt
        })))

        const activity = [
          ...lostReports.map(r => ({
            id: r._id,
            text: `Lost: ${r.itemName}`,
            time: r.createdAt,
            icon: FileSearch
          })),
          ...foundReports.map(r => ({
            id: r._id,
            text: `Found: ${r.itemName}`,
            time: r.createdAt,
            icon: Eye
          }))
        ]

        activity.sort((a, b) => new Date(b.time) - new Date(a.time))

        setRecentActivity(activity.slice(0, 4))

      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const dynStats = [
    { label: 'Lost Reports', value: counts.lost, icon: FileSearch, color: 'bg-red-50 text-[#ff4d4d]', border: 'border-[#ff4d4d]' },
    { label: 'Found Reports', value: counts.found, icon: Eye, color: 'bg-blue-50 text-[#2d5da1]', border: 'border-[#2d5da1]' },
    { label: 'Pending Matches', value: counts.matches, icon: ShieldCheck, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-500' },
    { label: 'Items Returned', value: counts.returned, icon: CheckCircle2, color: 'bg-green-50 text-green-600', border: 'border-green-600' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#2d5da1]" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#2d2d2d]">Dashboard<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-xl text-gray-500 mt-1">Welcome back! Here is what is happening with your items.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/student/report-lost"><Button size="md"><FileSearch size={18} strokeWidth={2.5} /> Report lost item</Button></Link>
        <Link to="/student/report-found"><Button variant="secondary" size="md"><Eye size={18} strokeWidth={2.5} /> Report found item</Button></Link>
        <Link to="/student/community"><Button variant="ghost" size="md"><MessageCircle size={18} strokeWidth={2.5} /> Community</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dynStats.map(({ label, value, icon: Icon, color, border }, i) => (
          <div key={label} className={`relative bg-white border-2 ${border} p-5 shadow-[2px_2px_0px_#2d2d2d] hover:shadow-[4px_4px_0px_#2d2d2d] hover:-translate-y-1 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`} style={{ borderRadius: RADIUS.wobblyMd }}>
            <div className={`inline-flex p-2 mb-3 border-2 border-current ${color}`} style={{ borderRadius: RADIUS.blob }}><Icon size={22} strokeWidth={2.5} /></div>
            <p className="font-heading text-3xl font-bold text-[#2d2d2d]">{value}</p>
            <p className="font-body text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative bg-white border-2 border-[#2d2d2d] p-6 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2 text-[#2d2d2d]"><ShieldCheck size={22} strokeWidth={2.5} className="text-[#2d5da1]" /> Recent Matches</h2>
          <div className="space-y-3">
            {recentMatches.length === 0 ? (
              <p className="text-gray-400 font-body py-4 text-center">No matches yet. Report a lost item and our AI will scan for matches.</p>
            ) : (
              recentMatches.map(({ id, itemName, score, status, time }) => (
                <div key={id} className="flex items-center justify-between p-3 border-2 border-dashed border-gray-200 hover:border-[#2d2d2d] transition-colors" style={{ borderRadius: RADIUS.wobblySm }}>
                  <div className="flex items-center gap-3">
                    <Package size={20} strokeWidth={2.5} className="text-gray-400" />
                    <div>
                      <p className="font-body text-base font-bold text-[#2d2d2d]">{itemName}</p>
                      <p className="font-body text-sm text-gray-400">{Math.round(score * 100)}% match · {timeAgo(time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor[status] || 'default'}>{status?.replace('_', ' ')}</Badge>
                    {(status === 'pending' || status === 'pending_verify') && (
                      <Link to={`/student/verify/${id}`}><button className="text-[#2d5da1] hover:text-[#ff4d4d] transition-colors"><ArrowRight size={18} strokeWidth={3} /></button></Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <Link to="/student/matches" className="block mt-4"><Button variant="ghost" size="sm" className="w-full">View all matches</Button></Link>
        </div>

        <div className="relative bg-white border-2 border-[#2d2d2d] p-6 shadow-[2px_2px_0px_#2d2d2d]" style={{ borderRadius: RADIUS.wobblyMd }}>
          <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2 text-[#2d2d2d]"><TrendingUp size={22} strokeWidth={2.5} className="text-[#ff4d4d]" /> Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 font-body py-4 text-center">No recent activity. Start by reporting an item!</p>
            ) : (
              recentActivity.map(({ id, text, time, icon: Icon }) => (
                <div key={id} className="flex items-start gap-3 py-2 border-b border-dashed border-gray-200 last:border-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 border-2 border-gray-200 flex items-center justify-center mt-0.5" style={{ borderRadius: RADIUS.blob }}><Icon size={14} strokeWidth={2.5} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-base text-[#2d2d2d]">{text}</p>
                    <p className="font-body text-sm text-gray-400">{timeAgo(time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#fef3c7] border-2 border-[#2d2d2d] p-6 shadow-[2px_2px_0px_#2d2d2d] flex flex-col md:flex-row items-center justify-between gap-4 transform -rotate-[0.5deg]" style={{ borderRadius: RADIUS.wobbly }}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={28} strokeWidth={2.5} className="text-[#ff4d4d] flex-shrink-0" />
          <div>
            <p className="font-heading text-xl font-bold">No match for an item?</p>
            <p className="font-body text-base text-gray-600">Start a community thread — let the campus help you look!</p>
          </div>
        </div>
        <Link to="/student/community"><Button variant="accent" size="md"><MessageCircle size={18} strokeWidth={2.5} /> Start thread</Button></Link>
      </div>
    </div>
  )
}