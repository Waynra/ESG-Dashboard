import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DashboardStateProvider } from './context/DashboardStateContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DashboardStateProvider>
        <App />
      </DashboardStateProvider>
    </BrowserRouter>
  </StrictMode>,
)
