import { useState, useEffect, useCallback } from 'react'
import { BarChart2 } from 'lucide-react'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import { Card, Badge, Select, EmptyState, Skeleton } from '../components/ui/index'
import { formatTime, formatDateMini, MONTHS } from '../utils/dateTime'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import './HistoryPage.css'

export default function HistoryPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setRecords(await api.monthly(year, month)) }
    catch (err) { toast({ type: 'error', message: err.message }) }
    finally { setLoading(false) }
  }, [year, month, toast])

  useEffect(() => { load() }, [load])

  const presentDays = records.filter(r => r.status === 'Present').length
  const totalHours = records.reduce((s, r) => s + (r.total_hours || 0), 0)

  const yearOptions = []
  for (let y = now.getFullYear(); y >= now.getFullYear() - 2; y--) yearOptions.push(y)

  return (
    <div className="history-screen">
      <header className="ci-header">
        <img src={logo} alt="EduPoint" className="ci-logo" />
        <button className="ci-logout" onClick={logout}>Sign out</button>
      </header>

      <div className="history-content">
        <div className="history-top fade-up">
          <div>
            <h1>My Attendance</h1>
            <p>Your attendance records for {MONTHS[month-1]} {year}</p>
          </div>
          <div className="history-filters">
            <Select value={month} onChange={e => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </Select>
            <Select value={year} onChange={e => setYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
        </div>

        {/* Summary */}
        <div className="history-stats fade-up stagger-1">
          <Card className="history-stat">
            <div className="history-stat-val grad-text">{presentDays}</div>
            <div className="history-stat-label">Days Present</div>
          </Card>
          <Card className="history-stat">
            <div className="history-stat-val grad-text">{totalHours.toFixed(1)}h</div>
            <div className="history-stat-label">Total Hours</div>
          </Card>
          <Card className="history-stat">
            <div className="history-stat-val grad-text">{records.length}</div>
            <div className="history-stat-label">Records</div>
          </Card>
        </div>

        {/* Records */}
        {loading ? (
          <div>{Array(4).fill(0).map((_,i) => <div key={i} style={{ marginBottom: 10 }}><Skeleton h={80} /></div>)}</div>
        ) : records.length === 0 ? (
          <Card><EmptyState icon={BarChart2} title="No records this month" description={`No attendance for ${MONTHS[month-1]} ${year}.`} /></Card>
        ) : (
          <div className="history-list fade-up stagger-2">
            {records.map(r => (
              <Card key={r.id} className="history-row-card">
                <div className="history-row-top">
                  <span className="history-row-date">{formatDateMini(r.date)}</span>
                  <Badge tone={r.status === 'Present' ? 'success' : r.status === 'Incomplete' ? 'warn' : 'neutral'} dot>{r.status}</Badge>
                </div>
                <div className="history-row-times">
                  <div className="history-row-time"><span>In</span><strong>{formatTime(r.check_in_time)}</strong></div>
                  <div className="history-row-time"><span>Out</span><strong>{formatTime(r.check_out_time)}</strong></div>
                  <div className="history-row-time"><span>Hours</span><strong>{r.total_hours != null ? `${r.total_hours.toFixed(2)}h` : '—'}</strong></div>
                  <div className="history-row-time"><span>GPS</span><Badge tone={r.gps_verified ? 'success' : 'error'}>{r.gps_verified ? '✓' : '✗'}</Badge></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
