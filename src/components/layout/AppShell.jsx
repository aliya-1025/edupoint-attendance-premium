import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './AppShell.css'

export default function AppShell({ children, title, subtitle }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <Topbar title={title} subtitle={subtitle} />
        <main className="app-shell-content">
          {children}
        </main>
      </div>
    </div>
  )
}
