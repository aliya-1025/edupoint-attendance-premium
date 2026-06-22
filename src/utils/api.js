/**
 * API client — connects to the existing FastAPI backend.
 * Set VITE_API_URL in .env to point at your deployed backend.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'ep_token'
const USER_KEY  = 'ep_user'

export const getToken  = () => localStorage.getItem(TOKEN_KEY)
export const setToken  = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)
export const getUser   = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } }
export const setUser   = (u) => u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY)
export const clearAuth = () => { setToken(null); setUser(null) }

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}` }

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. Check your internet connection.', 0)
  }

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = null }

  if (!res.ok) {
    const msg = data?.detail
      ? typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
      : `Request failed (${res.status})`
    throw new ApiError(msg, res.status)
  }
  return data
}

export const api = {
  // Auth
  login:          (email, password, remember_me = true) =>
    request('/api/auth/login', { method: 'POST', body: { email, password, remember_me }, auth: false }),
  me:             () => request('/api/auth/me'),
  changePassword: (current_password, new_password) =>
    request('/api/auth/change-password', { method: 'POST', body: { current_password, new_password } }),

  // Teachers (admin)
  listTeachers:   () => request('/api/teachers'),
  createTeacher:  (p) => request('/api/teachers', { method: 'POST', body: p }),
  updateTeacher:  (id, p) => request(`/api/teachers/${id}`, { method: 'PUT', body: p }),
  deleteTeacher:  (id) => request(`/api/teachers/${id}`, { method: 'DELETE' }),

  // Attendance
  todayStatus:    () => request('/api/attendance/today'),
  checkIn:        (lat, lng, acc) => request('/api/attendance/check-in',  { method: 'POST', body: { latitude: lat, longitude: lng, accuracy: acc } }),
  checkOut:       (lat, lng, acc) => request('/api/attendance/check-out', { method: 'POST', body: { latitude: lat, longitude: lng, accuracy: acc } }),
  todayAll:       () => request('/api/attendance/today-all'),
  monthly:        (year, month, teacherId) =>
    request(`/api/attendance/monthly?year=${year}&month=${month}${teacherId ? `&teacher_id=${teacherId}` : ''}`),
  search:         ({ q, start_date, end_date, status }) => {
    const p = new URLSearchParams()
    if (q)          p.set('q', q)
    if (start_date) p.set('start_date', start_date)
    if (end_date)   p.set('end_date', end_date)
    if (status)     p.set('status', status)
    return request(`/api/attendance/search?${p}`)
  },
  centerLocation: () => request('/api/config/center', { auth: false }),
}
