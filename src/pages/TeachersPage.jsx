import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Search, Pencil, Trash2, Users } from 'lucide-react'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import AppShell from '../components/layout/AppShell'
import { Card, Badge, Button, Modal, Input, Select, Alert, EmptyState, Skeleton } from '../components/ui/index'
import './TeachersPage.css'

function TeacherForm({ teacher, onSubmit, onCancel }) {
  const isEdit = Boolean(teacher)
  const [form, setForm] = useState({
    full_name: teacher?.full_name || '',
    email: teacher?.email || '',
    password: '',
    phone: teacher?.phone || '',
    subject: teacher?.subject || '',
    employee_code: teacher?.employee_code || '',
    is_active: teacher?.is_active ?? true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        const payload = { full_name: form.full_name, phone: form.phone || null, subject: form.subject || null, employee_code: form.employee_code || null, is_active: form.is_active }
        if (form.password) payload.new_password = form.password
        await onSubmit(payload)
      } else {
        await onSubmit({ full_name: form.full_name, email: form.email, password: form.password, phone: form.phone || null, subject: form.subject || null, employee_code: form.employee_code || null })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <Alert tone="error">{error}</Alert>}
      <Input label="Full Name" value={form.full_name} onChange={set('full_name')} placeholder="e.g. Priya Sharma" required />
      <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="priya@edupoint.com" required disabled={isEdit} hint={isEdit ? 'Email cannot be changed.' : undefined} />
      <Input label={isEdit ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required={!isEdit} hint={isEdit ? 'Leave blank to keep current password.' : 'Minimum 6 characters.'} />
      <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
      <Input label="Subject (optional)" value={form.subject} onChange={set('subject')} placeholder="Mathematics" />
      <Input label="Employee Code (optional)" value={form.employee_code} onChange={set('employee_code')} placeholder="T001" />
      {isEdit && (
        <Select label="Account Status" value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}>
          <option value="active">Active — can log in and check in</option>
          <option value="inactive">Inactive — login disabled</option>
        </Select>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
        <Button type="submit" fullWidth loading={loading}>{isEdit ? 'Save changes' : 'Add teacher'}</Button>
      </div>
    </form>
  )
}

export default function TeachersPage() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null) // null | 'add' | teacher object
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setTeachers(await api.listTeachers()) }
    catch (err) { toast({ type: 'error', message: err.message }) }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  const filtered = teachers.filter(t =>
    t.full_name.toLowerCase().includes(q.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(q.toLowerCase()) ||
    (t.subject || '').toLowerCase().includes(q.toLowerCase())
  )

  async function handleCreate(payload) {
    await api.createTeacher(payload)
    toast({ type: 'success', message: 'Teacher added successfully!' })
    setModal(null); load()
  }

  async function handleUpdate(payload) {
    await api.updateTeacher(modal.id, payload)
    toast({ type: 'success', message: 'Teacher updated successfully!' })
    setModal(null); load()
  }

  async function handleDelete() {
    try {
      await api.deleteTeacher(deleteTarget.id)
      toast({ type: 'success', message: `${deleteTarget.full_name} has been removed.` })
      setDeleteTarget(null); load()
    } catch (err) {
      toast({ type: 'error', message: err.message })
      setDeleteTarget(null)
    }
  }

  return (
    <AppShell title="Teachers" subtitle={`${teachers.filter(t => t.is_active).length} active teachers`}>
      <div className="teachers-page fade-up">
        {/* Header */}
        <div className="teachers-header">
          <div className="teachers-search-wrap">
            <Search size={16} className="teachers-search-icon" />
            <input className="teachers-search" placeholder="Search teachers…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Button icon={UserPlus} onClick={() => setModal('add')}>Add Teacher</Button>
        </div>

        {/* Teacher cards grid */}
        {loading ? (
          <div className="teachers-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="ep-card" style={{ padding: 20 }}>
                <Skeleton h={48} w={48} r={999} mb={12} />
                <Skeleton h={14} w="70%" mb={8} />
                <Skeleton h={12} w="90%" mb={6} />
                <Skeleton h={12} w="50%" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState icon={Users} title={q ? 'No teachers found' : 'No teachers yet'} description={q ? 'Try a different search term.' : 'Add your first teacher to start tracking attendance.'} action={!q && <Button icon={UserPlus} onClick={() => setModal('add')}>Add Teacher</Button>} />
          </Card>
        ) : (
          <div className="teachers-grid">
            {filtered.map((t, i) => (
              <Card key={t.id} className={`teacher-card ep-card-hover fade-up stagger-${Math.min(i+1, 5)}`}>
                <div className="teacher-card-top">
                  <div className="teacher-avatar-lg">{t.full_name[0]}</div>
                  <Badge tone={t.is_active ? 'success' : 'neutral'}>{t.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <h3 className="teacher-card-name">{t.full_name}</h3>
                <p className="teacher-card-email">{t.email}</p>
                <div className="teacher-card-meta">
                  {t.subject && <span className="teacher-chip">{t.subject}</span>}
                  {t.employee_code && <span className="teacher-chip">{t.employee_code}</span>}
                </div>
                <div className="teacher-card-actions">
                  <Button size="sm" variant="secondary" icon={Pencil} fullWidth onClick={() => setModal(t)}>Edit</Button>
                  <Button size="sm" variant="danger" icon={Trash2} fullWidth onClick={() => setDeleteTarget(t)}>Remove</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Teacher' : `Edit ${modal?.full_name || ''}`}>
        {modal && <TeacherForm teacher={modal === 'add' ? null : modal} onSubmit={modal === 'add' ? handleCreate : handleUpdate} onCancel={() => setModal(null)} />}
      </Modal>

      {/* Delete confirmation */}
      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Remove Teacher" width={380}>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>
          Permanently delete <strong>{deleteTarget?.full_name}</strong> and all their attendance records? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={handleDelete}>Remove Teacher</Button>
        </div>
      </Modal>
    </AppShell>
  )
}
