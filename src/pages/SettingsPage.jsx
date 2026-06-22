import { useState, useEffect } from 'react'
import { Settings, Lock, MapPin } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { Card, Input, Button, Alert } from '../components/ui/index'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import './SettingsPage.css'

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [centerInfo, setCenterInfo] = useState(null)
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    api.centerLocation().then(setCenterInfo).catch(() => {})
  }, [])

  async function handlePwdChange(e) {
    e.preventDefault()
    setPwdError('')
    if (pwdForm.next !== pwdForm.confirm) { setPwdError('New passwords do not match.'); return }
    if (pwdForm.next.length < 6) { setPwdError('Password must be at least 6 characters.'); return }
    setPwdLoading(true)
    try {
      await api.changePassword(pwdForm.current, pwdForm.next)
      toast({ type: 'success', message: 'Password changed successfully!' })
      setPwdForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwdError(err.message)
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <AppShell title="Settings" subtitle="Application configuration">
      <div className="settings-page fade-up">
        {/* GPS Center info (read-only) */}
        <Card className="settings-card">
          <div className="settings-section-header">
            <div className="settings-section-icon blue"><MapPin size={18} /></div>
            <div>
              <h3>GPS Center Location</h3>
              <p>The coaching center's GPS coordinates used for attendance verification</p>
            </div>
          </div>
          {centerInfo ? (
            <div className="settings-info-grid">
              <div className="settings-info-item">
                <span>Latitude</span>
                <strong>{centerInfo.latitude}</strong>
              </div>
              <div className="settings-info-item">
                <span>Longitude</span>
                <strong>{centerInfo.longitude}</strong>
              </div>
              <div className="settings-info-item">
                <span>Allowed Radius</span>
                <strong>{centerInfo.allowed_radius_meters}m</strong>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading center information…</p>
          )}
          <p className="settings-tip">
            To change the center location, update <code>CENTER_LATITUDE</code>, <code>CENTER_LONGITUDE</code>, and <code>ALLOWED_RADIUS_METERS</code> in your backend environment variables on Render, then redeploy.
          </p>
        </Card>

        {/* Change password */}
        <Card className="settings-card">
          <div className="settings-section-header">
            <div className="settings-section-icon green"><Lock size={18} /></div>
            <div>
              <h3>Change Password</h3>
              <p>Update your login password</p>
            </div>
          </div>
          <form onSubmit={handlePwdChange} className="settings-form">
            {pwdError && <Alert tone="error">{pwdError}</Alert>}
            <Input label="Current Password" type="password" value={pwdForm.current} onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))} required />
            <Input label="New Password" type="password" value={pwdForm.next} onChange={e => setPwdForm(f => ({ ...f, next: e.target.value }))} hint="Minimum 6 characters." required />
            <Input label="Confirm New Password" type="password" value={pwdForm.confirm} onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} required />
            <Button type="submit" loading={pwdLoading}>Update Password</Button>
          </form>
        </Card>

        {/* App info */}
        <Card className="settings-card">
          <div className="settings-section-header">
            <div className="settings-section-icon orange"><Settings size={18} /></div>
            <div>
              <h3>About</h3>
              <p>Application information</p>
            </div>
          </div>
          <div className="settings-info-grid">
            <div className="settings-info-item"><span>Application</span><strong>EduPoint Attendance</strong></div>
            <div className="settings-info-item"><span>Version</span><strong>2.0.0</strong></div>
            <div className="settings-info-item"><span>Role</span><strong>{user?.role === 'admin' ? 'Administrator' : 'Teacher'}</strong></div>
            <div className="settings-info-item"><span>Logged in as</span><strong>{user?.email}</strong></div>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
