/* ============================================================
   Premium UI Components — EduPoint Design System
   ============================================================ */

import { X, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import './ui.css'

/* ── Button ── */
export function Button({ children, variant = 'primary', size = 'md', fullWidth, disabled, loading, icon: Icon, ...props }) {
  const cls = ['ep-btn', `ep-btn-${variant}`, `ep-btn-${size}`, fullWidth ? 'ep-btn-full' : ''].filter(Boolean).join(' ')
  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading ? <span className="spinner" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  )
}

/* ── Card ── */
export function Card({ children, className = '', hover = false, ...props }) {
  return <div className={`ep-card ${hover ? 'ep-card-hover' : ''} ${className}`} {...props}>{children}</div>
}

/* ── Badge ── */
export function Badge({ children, tone = 'neutral', dot = false }) {
  return (
    <span className={`ep-badge ep-badge-${tone}`}>
      {dot && <span className="ep-badge-dot" />}
      {children}
    </span>
  )
}

/* ── Input ── */
export function Input({ label, icon: Icon, error, hint, type = 'text', ...props }) {
  const [showPwd, setShowPwd] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPwd ? 'text' : 'password') : type

  return (
    <div className="ep-field">
      {label && <label className="ep-label">{label}</label>}
      <div className="ep-input-wrap">
        {Icon && <Icon size={17} className="ep-input-icon" />}
        <input
          type={inputType}
          className={`ep-input ${Icon ? 'has-icon' : ''} ${isPassword ? 'has-suffix' : ''} ${error ? 'ep-input-error' : ''}`}
          {...props}
        />
        {isPassword && (
          <button type="button" className="ep-input-eye" onClick={() => setShowPwd((v) => !v)} tabIndex={-1}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="ep-field-error">{error}</span>}
      {hint && !error && <span className="ep-field-hint">{hint}</span>}
    </div>
  )
}

/* ── Select ── */
export function Select({ label, error, children, ...props }) {
  return (
    <div className="ep-field">
      {label && <label className="ep-label">{label}</label>}
      <select className={`ep-select ${error ? 'ep-input-error' : ''}`} {...props}>{children}</select>
      {error && <span className="ep-field-error">{error}</span>}
    </div>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div className="ep-modal-backdrop" onClick={onClose}>
      <div className="ep-modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="ep-modal-header">
          <h2 className="ep-modal-title">{title}</h2>
          <button className="ep-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ep-modal-body">{children}</div>
      </div>
    </div>
  )
}

/* ── Alert ── */
export function Alert({ tone = 'info', children }) {
  return <div className={`ep-alert ep-alert-${tone}`}>{children}</div>
}

/* ── Stat Card ── */
export function StatCard({ title, value, icon: Icon, color = 'blue', change, subtitle }) {
  return (
    <div className={`stat-card stat-card-${color} ep-card ep-card-hover fade-up`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon stat-icon-${color}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <span className={`stat-card-change ${change >= 0 ? 'change-up' : 'change-down'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-title">{title}</div>
      {subtitle && <div className="stat-card-sub">{subtitle}</div>}
    </div>
  )
}

/* ── Empty State ── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="ep-empty">
      {Icon && <div className="ep-empty-icon"><Icon size={40} strokeWidth={1.2} /></div>}
      <h3 className="ep-empty-title">{title}</h3>
      {description && <p className="ep-empty-desc">{description}</p>}
      {action}
    </div>
  )
}

/* ── Skeleton ── */
export function Skeleton({ h = 20, w = '100%', r = 8, mb = 0 }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r, marginBottom: mb }} />
}

export function SkeletonCard() {
  return (
    <div className="ep-card" style={{ padding: 20 }}>
      <Skeleton h={12} w={80} mb={12} />
      <Skeleton h={32} w={60} mb={8} />
      <Skeleton h={10} w={120} />
    </div>
  )
}

/* ── Divider ── */
export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '0 -20px' }} />
}
