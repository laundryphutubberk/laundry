import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getAuthSession } from './features/auth/authSession'
import { refreshSession } from './features/auth/authApi'

async function bootstrap() {
  if (!getAuthSession()) await refreshSession()
  createRoot(document.getElementById('root')).render(
    <StrictMode><App /></StrictMode>,
  )
}

void bootstrap()
