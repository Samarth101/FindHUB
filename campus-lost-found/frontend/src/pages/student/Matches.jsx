import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Package, AlertCircle, Clock, Loader2 } from 'lucide-react'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { RADIUS } from '../../utils/constants'
import { timeAgo } from '../../utils/formatDate'
import api from '../../api/http'

const statusConfig = {
  pending_verify: { variant: 'warning', label: 'Awaiting verification', icon: Clock },
  pending: { variant: 'warning', label: 'Awaiting verification', icon: Clock },
  verified: { variant: 'success', label: 'Verified', icon: ShieldCheck },
  rejected: { variant: 'accent', label: 'Not a match', icon: AlertCircle }
}

function ScoreBar({ score }) {
  const pct = Math.round(score * 100)
  const color = score >= 0.85 ? 'bg-green-500' : score >= 0.6 ? 'bg-yellow-500' : 'bg-[#ff4d4d]'
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-3 bg-gray-200 border border-gray-300 overflow-hidden" style={{ borderRadius: '999px' }}>
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-body text-sm font-bold text-gray-400">{pct}%</span>
    </div>
  )
}

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/matches/mine')
      .then(res => setMatches(res.data.matches || []))
      .catch(err => console.error('Failed to load matches:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#2d5da1]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold">My Matches<span className="text-[#ff4d4d]">.</span></h1>
        <p className="font-body text-lg text-gray-500 mt-1">Potential matches for your lost items. No found item details are shown — verify ownership to proceed.</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-[#2d5da1] p-4 flex items-start gap-3" style={{ borderRadius: RADIUS.wobblySm }}>
        <ShieldCheck size={24} strokeWidth={2.5} className="text-[#2d5da1] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-body text-base font-bold text-[#2d5da1]">Privacy notice</p>
          <p className="font-body text-sm text-gray-600 dark:text-gray-300">You cannot see any found item details. The AI detected similarities between your report and a found submission. Answer the verification questions to prove ownership.</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16">
          <Package size={56} strokeWidth={2} className="mx-auto text-gray-200 mb-4" />
          <p className="font-heading text-2xl text-gray-400">No matches yet</p>
          <p className="font-body text-lg text-gray-300">Our AI is continuously scanning. You will be notified when a match is found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, i) => {
            const cfg = statusConfig[match.status] || statusConfig.pending
            const StatusIcon = cfg.icon
            const itemName = match.lostReport?.itemName || 'Unknown Item'
            const category = match.lostReport?.category || ''
            return (
              <div
                key={match._id}
                className={`relative bg-white dark:bg-[#222] border-2 border-[#2d2d2d] p-5 shadow-[2px_2px_0px_#2d2d2d] hover:shadow-[4px_4px_0px_#2d2d2d] hover:-translate-y-0.5 transition-all duration-100 ${i % 2 === 0 ? 'rotate-[0.3deg]' : '-rotate-[0.3deg]'}`}
                style={{ borderRadius: RADIUS.wobblyMd }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-[#fef3c7] border-2 border-[#2d2d2d] flex items-center justify-center" style={{ borderRadius: RADIUS.blob }}>
                      <Package size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold dark:text-white">{itemName}</h3>
                      <p className="font-body text-sm text-gray-400 mb-2">{category} · {timeAgo(match.createdAt)}</p>
                      <ScoreBar score={match.score || 0} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={cfg.variant}>
                      <StatusIcon size={14} className="inline mr-1" />
                      {cfg.label}
                    </Badge>
                    {(match.status === 'pending' || match.status === 'pending_verify') && (
                      <Link to={`/student/verify/${match._id}`}>
                        <Button size="sm" variant="accent">
                          Verify now <ArrowRight size={14} strokeWidth={3} />
                        </Button>
                      </Link>
                    )}
                    {match.status === 'verified' && (
                      <Link to="/student/chat">
                        <Button size="sm">Open chat</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}