import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, PieChart, Download } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import AppShell from '../components/layout/AppShell'
import { Card, Select, Button, Skeleton } from '../components/ui/index'
import { MONTHS } from '../utils/dateTime'
import './ReportsPage.css'

const COLORS = ['#3BA7E3','#8BC34A','#F59E0B','#EF4444','#8B5CF6','#EC4899']

export default function ReportsPage() {
  const { toast } = useToast()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState([])
  const [teachers, setTeachers] = useState([])
  const [teacherStats, setTeacherStats] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const teacherList = await api.listTeachers()
        setTeachers(teacherList)

        const months = []
        for (let m = 1; m <= 12; m++) {
          const records = await api.monthly(year, m)
          const present = records.filter(r => r.status === 'Present').length
          const hours = records.reduce((s, r) => s + (r.total_hours || 0), 0)
          months.push({ month: MONTHS[m-1].slice(0,3), present, hours: Math.round(hours * 10) / 10, absent: Math.max(0, (teacherList.length * 22) - present) })
        }
        setMonthlyData(months)

        const stats = teacherList.slice(0, 8).map(t => ({ name: t.full_name.split(' ')[0], subject: t.subject || '—', code: t.employee_code || '—' }))
        setTeacherStats(stats)
      } catch (err) {
        toast({ type: 'error', message: 'Could not load report data.' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [year, toast])

  const yearOptions = []
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) yearOptions.push(y)

  const totalPresent = monthlyData.reduce((s, m) => s + m.present, 0)
  const totalHours = monthlyData.reduce((s, m) => s + m.hours, 0)

  const pieData = monthlyData.slice(-3).map((m, i) => ({ name: m.month, value: m.present, color: COLORS[i] }))

  return (
    <AppShell title="Reports" subtitle="Attendance analytics and insights">
      <div className="reports-page fade-up">
        {/* Controls */}
        <div className="reports-controls">
          <Select value={year} onChange={e => setYear(Number(e.target.value))} label="Year">
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Button icon={Download} variant="secondary" onClick={() => toast({ type: 'info', message: 'PDF export coming soon!' })}>
            Export PDF
          </Button>
        </div>

        {/* Summary stats */}
        <div className="reports-summary">
          <Card className="reports-stat-card">
            <div className="reports-stat-icon blue"><BarChart2 size={20} /></div>
            <div className="reports-stat-value grad-text">{totalPresent}</div>
            <div className="reports-stat-label">Total Check-ins This Year</div>
          </Card>
          <Card className="reports-stat-card">
            <div className="reports-stat-icon green"><TrendingUp size={20} /></div>
            <div className="reports-stat-value grad-text">{totalHours.toFixed(0)}h</div>
            <div className="reports-stat-label">Total Working Hours</div>
          </Card>
          <Card className="reports-stat-card">
            <div className="reports-stat-icon orange"><PieChart size={20} /></div>
            <div className="reports-stat-value grad-text">{teachers.filter(t => t.is_active).length}</div>
            <div className="reports-stat-label">Active Teachers</div>
          </Card>
        </div>

        {/* Bar chart — monthly attendance */}
        <Card className="reports-chart-card">
          <div className="reports-chart-header">
            <h3>Monthly Attendance Overview</h3>
            <p>Number of check-ins per month in {year}</p>
          </div>
          {loading ? <Skeleton h={280} /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barSize={24} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-3)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-3)' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} cursor={{ fill: 'rgba(59,167,227,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
                <Bar dataKey="present" name="Present Days" fill="url(#grad1)" radius={[5,5,0,0]} />
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3BA7E3" /><stop offset="100%" stopColor="#8BC34A" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Line chart — hours trend */}
        <Card className="reports-chart-card">
          <div className="reports-chart-header">
            <h3>Working Hours Trend</h3>
            <p>Total working hours recorded per month</p>
          </div>
          {loading ? <Skeleton h={240} /> : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-3)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-3)' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} />
                <Line type="monotone" dataKey="hours" name="Total Hours" stroke="#3BA7E3" strokeWidth={2.5} dot={{ fill: '#3BA7E3', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie chart — last 3 months */}
        <div className="reports-bottom-row">
          <Card className="reports-chart-card">
            <div className="reports-chart-header">
              <h3>Last 3 Months Distribution</h3>
              <p>Attendance share by month</p>
            </div>
            {loading ? <Skeleton h={220} /> : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <ResponsiveContainer width={200} height={200}>
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="pie-legend-item">
                      <span className="pie-dot" style={{ background: COLORS[i] }} />
                      <span>{d.name}: <strong>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
