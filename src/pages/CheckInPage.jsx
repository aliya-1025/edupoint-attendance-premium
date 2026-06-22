import { useState, useEffect, useCallback } from 'react'
import { MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { api } from '../utils/api'
import { getCurrentPosition } from '../utils/geolocation'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useLiveClock } from '../hooks/useLiveClock'
import { Badge, Card } from '../components/ui/index'
import { formatTime } from '../utils/dateTime'
import logo from '../assets/logo.png'
import './CheckInPage.css'

export default function CheckInPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const { timeStr, dateStr, greeting, emoji } = useLiveClock()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const loadStatus = useCallback(async () => {
    try { setStatus(await api.todayStatus()) }
    catch (err) { toast({ type: 'error', message: err.message }) }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { loadStatus() }, [loadStatus])

  async function handleAction(action) {
    setBusy(true)
    try {
      const pos = await getCurrentPosition()
      const result = action === 'in'
        ? await api.checkIn(pos.latitude, pos.longitude, pos.accuracy)
        : await api.checkOut(pos.latitude, pos.longitude, pos.accuracy)

      if (result.success) {
        toast({ type: 'success', message: result.message })
        await loadStatus()
      } else {
        toast({ type: 'error', message: result.message })
      }
    } catch (err) {
      toast({ type: 'error', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  const att = status?.attendance
  const hasIn = status?.has_checked_in
  const hasOut = status?.has_checked_out

  let punchState = hasIn && hasOut ? 'done' : hasIn ? 'out' : 'in'
  const btnLabel = { in: 'Check In', out: 'Check Out', done: 'See you tomorrow!' }[punchState]

  return (
    <div className="checkin-screen">
      {/* Header */}
      <header className="ci-header">
        <img src={logo} alt="EduPoint" className="ci-logo" />
        <button className="ci-logout" onClick={logout}>Sign out</button>
      </header>

      <main className="ci-main">
        {/* Greeting */}
        <div className="ci-greeting fade-up">
          <p className="ci-greeting-text">{emoji} {greeting}, {user?.fullName?.split(' ')[0] || 'Teacher'}!</p>
          <p className="ci-date">{dateStr}</p>
        </div>

        {/* Live clock */}
        <div className="ci-clock fade-up stagger-1">
          <span className="ci-clock-time">{timeStr}</span>
        </div>

        {/* Punch button */}
        <div className="ci-punch-wrap fade-up stagger-2">
          <button
            className={`ci-punch ci-punch-${punchState}`}
            onClick={() => punchState !== 'done' && handleAction(punchState)}
            disabled={busy || punchState === 'done' || loading}
          >
            {busy ? (
              <><span className="spinner" /><span>Locating you…</span></>
            ) : punchState === 'done' ? (
              <><CheckCircle size={36} strokeWidth={1.5} /><span>{btnLabel}</span></>
            ) : (
              <><Clock size={36} strokeWidth={1.5} /><span>{btnLabel}</span></>
            )}
          </button>
          <p className="ci-punch-hint">
            {punchState === 'in' && <><MapPin size={13} /> Must be within 100m of the center</>}
            {punchState === 'out' && <><MapPin size={13} /> Tap when leaving for the day</>}
            {punchState === 'done' && <><CheckCircle size={13} /> Great work today!</>}
          </p>
        </div>

        {/* Today's summary card */}
        <Card className="ci-summary fade-up stagger-3">
          <div className="ci-summary-title">Today's Summary</div>
          <div className="ci-summary-grid">
            <div className="ci-summary-item">
              <span className="ci-summary-label">Check In</span>
              <span className="ci-summary-val">{formatTime(att?.check_in_time)}</span>
            </div>
            <div className="ci-summary-item">
              <span className="ci-summary-label">Check Out</span>
              <span className="ci-summary-val">{formatTime(att?.check_out_time)}</span>
            </div>
            <div className="ci-summary-item">
              <span className="ci-summary-label">Status</span>
              {att ? <Badge tone={att.status === 'Present' ? 'success' : 'neutral'} dot>{att.status}</Badge> : <Badge tone="neutral">Not recorded</Badge>}
            </div>
            <div className="ci-summary-item">
              <span className="ci-summary-label">Hours Worked</span>
              <span className="ci-summary-val">{att?.total_hours != null ? `${att.total_hours.toFixed(2)}h` : '—'}</span>
            </div>
          </div>
        </Card>

        {/* GPS note */}
        <div className="ci-gps-note fade-up stagger-4">
          <AlertCircle size={14} />
          <span>GPS verification is required for all check-ins. You must be within 100m of the coaching center.</span>
        </div>
      </main>
    </div>
  )
}
