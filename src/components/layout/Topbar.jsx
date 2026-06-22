import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLiveClock } from '../../hooks/useLiveClock'
import './Topbar.css'

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth()
  const { timeStr, greeting, emoji } = useLiveClock()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title-wrap">
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div className="topbar-search">
          <Search size={15} className="topbar-search-icon" />
          <input className="topbar-search-input" placeholder="Search..." />
        </div>

        {/* Live clock */}
        <div className="topbar-clock">
          <span className="topbar-clock-time">{timeStr}</span>
        </div>

        {/* Notification bell */}
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={19} />
        </button>

        {/* Profile avatar */}
        <div className="topbar-avatar" title={user?.fullName}>
          <span>{(user?.fullName || 'U')[0].toUpperCase()}</span>
        </div>
      </div>
    </header>
  )
}
