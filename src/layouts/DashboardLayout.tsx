import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-dvh bg-[var(--color-surface)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <Outlet />
      </div>
    </div>
  )
}
