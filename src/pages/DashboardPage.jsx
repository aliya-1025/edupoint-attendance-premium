import { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, Clock, TrendingUp, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useLiveClock } from '../hooks/useLiveClock'
import AppShell from '../components/layout/AppShell'
import { StatCard, Card, Badge, SkeletonCard, EmptyState } from '../components/ui/index'
import { formatTime, MONTHS_SHORT } from '../utils/dateTime'
import './DashboardPage.css'

const PIE_COLORS = ['#3BA7E3', '#8BC34A', '#F59E0B']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardPage() {
  const { user } = useAuth()
  const { greeting, emoji, dateStr } = useLiveClock()
  const [todayRecords, setTodayRecords] = useState([])
  const [teachers, setTeachers] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [today, teacherList] = await Promise.all([api.todayAll(), api.listTeachers()])
        setTodayRecords(today)
        setTeachers(teacherList)

        // Build last 6 months data
        const now = new Date()
        const months = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const records = await api.monthly(d.getFullYear(), d.getMonth() + 1)
          const present = records.filter(r => r.status === 'Present').length
          const hours = records.reduce((s, r) => s + (r.total_hours || 0), 0)
          months.push({ month: MONTHS[d.getMonth()], present, hours: Math.round(hours) })
        }
        setMonthlyData(months)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const present = todayRecords.filter(r => r.status === 'Present').length
  const checkedOut = todayRecords.filter(r => r.check_out_time).length
  const totalTeachers = teachers.filter(t => t.is_active).length
  const absent = totalTeachers - present

  const pieData = [
    { name: 'Present', value: present },
    { name: 'Absent',  value: Math.max(0, absent) },
    { name: 'Pending', value: Math.max(0, present - checkedOut) },
  ]

  return (
    <AppShell title="Dashboard" subtitle={dateStr}>
      <div className="dashboard">
        {/* Greeting banner */}
        <div className="dashboard-banner fade-up">
          <div>
            <h2 className="dashboard-greeting">{emoji} {greeting}, {user?.fullName?.split(' ')[0] || 'Admin'}!</h2>
            <p className="dashboard-greeting-sub">Here's what's happening at your center today.</p>
          </div>
          <div className="dashboard-date-badge">
            <Calendar size={15} />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="dashboard-stats">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard title="Active Teachers" value={totalTeachers} icon={Users} color="blue" subtitle="Total registered" />
              <StatCard title="Present Today" value={present} icon={UserCheck} color="green" subtitle={`${totalTeachers ? Math.round(present/totalTeachers*100) : 0}% attendance rate`} />
              <StatCard title="Absent Today" value={Math.max(0, absent)} icon={UserX} color="orange" subtitle="Not checked in" />
              <StatCard title="Checked Out" value={checkedOut} icon={Clock} color="purple" subtitle="Completed today" />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="dashboard-charts">
          {/* Monthly attendance bar chart */}
          <Card className="chart-card fade-up stagger-2">
            <div className="chart-header">
              <h3>Monthly Attendance</h3>
              <p>Attendance days over the last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={28}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                  cursor={{ fill: 'rgba(59,167,227,0.06)' }}
                />
                <Bar dataKey="present" fill="url(#barGrad)" radius={[6,6,0,0]} name="Days Present" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3BA7E3" />
                    <stop offset="100%" stopColor="#8BC34A" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie chart */}
          <Card className="chart-card chart-card-sm fade-up stagger-3">
            <div className="chart-header">
              <h3>Today's Status</h3>
              <p>Attendance breakdown</p>
            </div>
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.map((item, i) => (
                  <div key={item.name} className="pie-legend-item">
                    <span className="pie-dot" style={{ background: PIE_COLORS[i] }} />
                    <span>{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Today's attendance table */}
        <Card className="fade-up stagger-4">
          <div className="table-card-header">
            <div>
              <h3>Today's Attendance</h3>
              <p>{todayRecords.length} records</p>
            </div>
            <Badge tone={present > 0 ? 'success' : 'neutral'} dot>{present} Present</Badge>
          </div>
          {loading ? (
            <div style={{ padding: '20px' }}>
              {Array(3).fill(0).map((_, i) => <div key={i} style={{ marginBottom: 12 }}><SkeletonCard /></div>)}
            </div>
          ) : todayRecords.length === 0 ? (
            <EmptyState icon={Calendar} title="No check-ins yet today" description="Teachers who check in will appear here." />
          ) : (
            <div className="premium-table-wrap">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>GPS</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRecords.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="table-teacher">
                          <div className="table-avatar">{r.teacher_name[0]}</div>
                          <span>{r.teacher_name}</span>
                        </div>
                      </td>
                      <td>{formatTime(r.check_in_time)}</td>
                      <td>{formatTime(r.check_out_time)}</td>
                      <td>{r.total_hours != null ? `${r.total_hours.toFixed(2)}h` : '—'}</td>
                      <td><Badge tone={r.gps_verified ? 'success' : 'error'}>{r.gps_verified ? 'Yes' : 'No'}</Badge></td>
                      <td><Badge tone={r.status === 'Present' ? 'success' : r.status === 'Incomplete' ? 'warn' : 'neutral'} dot>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}
