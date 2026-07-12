import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { refreshSession } from './features/auth/authApi'

async function bootstrap() {
  const session = await refreshSession()
  if (!session && window.location.pathname.startsWith('/workspace/')) return
  createRoot(document.getElementById('root')).render(
    <StrictMode><App /></StrictMode>,
  )
}

void bootstrap()
