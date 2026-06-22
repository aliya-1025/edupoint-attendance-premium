import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, Users, BarChart3,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import './Sidebar.css'

const ADMIN_NAV = [
  { to: '/admin',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/attendance',label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/teachers',  label: 'Teachers',   icon: Users },
  { to: '/admin/reports',   label: 'Reports',    icon: BarChart3 },
  { to: '/admin/settings',  label: 'Settings',   icon: Settings },
]

const TEACHER_NAV = [
  { to: '/',          label: 'Check In',   icon: CalendarCheck, end: true },
  { to: '/history',   label: 'My History', icon: BarChart3 },
  { to: '/profile',   label: 'Profile',    icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = user?.role === 'admin' ? ADMIN_NAV : TEACHER_NAV

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const sidebarContent = (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logo} alt="EduPoint" className="sidebar-logo-img" />
        {!collapsed && <span className="sidebar-logo-text">Attendance</span>}
      </div>

      {/* Collapse toggle (desktop) */}
      <button className="sidebar-collapse-btn" onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={20} className="sidebar-item-icon" />
            {!collapsed && <span className="sidebar-item-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">{(user?.fullName || 'U')[0].toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
              <div className="sidebar-user-role">{user?.role === 'admin' ? 'Administrator' : 'Teacher'}</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout} title="Sign out">
          <LogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen((o) => !o)}>
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar (desktop always, mobile when open) */}
      <div className={`sidebar-wrapper ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {sidebarContent}
      </div>
    </>
  )
}
