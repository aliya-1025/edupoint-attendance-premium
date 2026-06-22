import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import AppShell from '../components/layout/AppShell'
import { Card, Badge, Button, Select, EmptyState, Skeleton } from '../components/ui/index'
import { formatTime, formatDateShort, MONTHS } from '../utils/dateTime'
import './AttendancePage.css'

const PAGE_SIZE = 10

function exportCSV(records) {
  const header = ['Teacher Name','Date','Check In','Check Out','Hours','GPS Verified','Status']
  const rows = records.map(r => [
    r.teacher_name, r.date,
    r.check_in_time ? formatTime(r.check_in_time) : '—',
    r.check_out_time ? formatTime(r.check_out_time) : '—',
    r.total_hours != null ? r.total_hours.toFixed(2) : '—',
    r.gps_verified ? 'Yes' : 'No',
    r.status
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function AttendancePage() {
  const { toast } = useToast()
  const now = new Date()
  const [view, setView] = useState('today') // 'today' | 'monthly' | 'search'
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let data
      if (view === 'today') data = await api.todayAll()
      else if (view === 'monthly') data = await api.monthly(year, month)
      else data = await api.search({ q: q || undefined, status: status || undefined })
      setRecords(data || [])
      setPage(1)
    } catch (err) {
      toast({ type: 'error', message: err.message || 'Failed to load attendance.' })
    } finally {
      setLoading(false)
    }
  }, [view, year, month, q, status, toast])

  useEffect(() => { load() }, [load])

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...records].sort((a, b) => {
    let av = a[sortKey] || '', bv = b[sortKey] || ''
    if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  const total = sorted.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const yearOptions = []
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) yearOptions.push(y)

  return (
    <AppShell title="Attendance" subtitle="Track and manage all teacher attendance records">
      <div className="attendance-page fade-up">
        {/* View tabs */}
        <div className="att-tabs">
          {['today', 'monthly', 'search'].map(v => (
            <button key={v} className={`att-tab ${view === v ? 'att-tab-active' : ''}`} onClick={() => setView(v)}>
              {v === 'today' ? "Today's Records" : v === 'monthly' ? 'Monthly View' : 'Search'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card className="att-filters">
          {view === 'monthly' && (
            <>
              <Select value={month} onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </Select>
              <Select value={year} onChange={e => setYear(Number(e.target.value))}>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </Select>
            </>
          )}
          {view === 'search' && (
            <div className="att-search-wrap">
              <Search size={16} className="att-search-icon" />
              <input
                className="att-search-input"
                placeholder="Search by teacher name or employee code…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && load()}
              />
            </div>
          )}
          {view !== 'today' && (
            <Select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Incomplete">Incomplete</option>
            </Select>
          )}
          <Button icon={RefreshCw} variant="secondary" onClick={load}>Refresh</Button>
          <Button icon={Download} variant="secondary" onClick={() => { exportCSV(records); toast({ type: 'success', message: 'CSV exported!' }) }}>
            Export CSV
          </Button>
        </Card>

        {/* Table */}
        <Card>
          <div className="att-table-header">
            <p className="att-table-count">{total} record{total !== 1 ? 's' : ''}</p>
          </div>

          {loading ? (
            <div style={{ padding: '20px' }}>{Array(5).fill(0).map((_,i) => <div key={i} style={{ marginBottom: 12 }}><Skeleton h={40} /></div>)}</div>
          ) : paginated.length === 0 ? (
            <EmptyState icon={Filter} title="No attendance records" description="No records match your current filters." />
          ) : (
            <div className="premium-table-wrap">
              <table className="premium-table">
                <thead>
                  <tr>
                    {[
                      { key: 'teacher_name', label: 'Teacher Name' },
                      { key: 'date', label: 'Date' },
                      { key: 'check_in_time', label: 'Check In' },
                      { key: 'check_out_time', label: 'Check Out' },
                      { key: 'total_hours', label: 'Hours' },
                      { key: 'gps_verified', label: 'GPS' },
                      { key: 'status', label: 'Status' },
                    ].map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)} className="sortable-th">
                        {col.label}
                        {sortKey === col.key && <span>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="table-teacher">
                          <div className="table-avatar">{r.teacher_name[0]}</div>
                          <span>{r.teacher_name}</span>
                        </div>
                      </td>
                      <td>{formatDateShort(r.date)}</td>
                      <td>{formatTime(r.check_in_time)}</td>
                      <td>{formatTime(r.check_out_time)}</td>
                      <td><strong>{r.total_hours != null ? `${r.total_hours.toFixed(2)}h` : '—'}</strong></td>
                      <td><Badge tone={r.gps_verified ? 'success' : 'error'}>{r.gps_verified ? 'Yes' : 'No'}</Badge></td>
                      <td><Badge tone={r.status === 'Present' ? 'success' : r.status === 'Incomplete' ? 'warn' : 'neutral'} dot>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="att-pagination">
              <span className="att-page-info">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, total)} of {total}</span>
              <div className="att-page-btns">
                <button className="att-page-btn" disabled={page === 1} onClick={() => setPage(p => p-1)}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`att-page-btn ${page === p ? 'att-page-btn-active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="att-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}
