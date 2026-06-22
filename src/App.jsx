import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute } from './components/ProtectedRoute'

import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import AttendancePage from './pages/AttendancePage'
import TeachersPage   from './pages/TeachersPage'
import ReportsPage    from './pages/ReportsPage'
import SettingsPage   from './pages/SettingsPage'
import CheckInPage    from './pages/CheckInPage'
import HistoryPage    from './pages/HistoryPage'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/checkin'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requireRole="admin"><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute requireRole="admin"><AttendancePage /></ProtectedRoute>} />
            <Route path="/admin/teachers"   element={<ProtectedRoute requireRole="admin"><TeachersPage /></ProtectedRoute>} />
            <Route path="/admin/reports"    element={<ProtectedRoute requireRole="admin"><ReportsPage /></ProtectedRoute>} />
            <Route path="/admin/settings"   element={<ProtectedRoute requireRole="admin"><SettingsPage /></ProtectedRoute>} />

            {/* Teacher routes */}
            <Route path="/checkin" element={<ProtectedRoute requireRole="teacher"><CheckInPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute requireRole="teacher"><HistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute requireRole="teacher"><SettingsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
