import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/RequireAuth'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AuditLogPage } from './pages/AuditLogPage'
import { CSRDPage } from './pages/CSRDPage'
import { DisclosurePage } from './pages/DisclosurePage'
import { EmissionsPage } from './pages/EmissionsPage'
import { FacilitiesPage } from './pages/FacilitiesPage'
import { LoginPage } from './pages/LoginPage'
import { OverviewPage } from './pages/OverviewPage'
import { SettingsPage } from './pages/SettingsPage'
import { TargetsPage } from './pages/TargetsPage'
import { ERPIntegrationPage } from './pages/ERPIntegrationPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="emisi" element={<EmissionsPage />} />
          <Route path="fasilitas" element={<FacilitiesPage />} />
          <Route path="target" element={<TargetsPage />} />
          <Route path="pengungkapan" element={<DisclosurePage />} />
          <Route path="csrd" element={<CSRDPage />} />
          <Route path="erp" element={<ERPIntegrationPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="pengaturan" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
