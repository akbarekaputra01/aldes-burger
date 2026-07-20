import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Clarity from '@microsoft/clarity' // Gunakan package resmi saja
import './index.css'
import App from './App.jsx'

const CLARITY_ID = "xp9psgojzf";

if (import.meta.env.PROD) {
  Clarity.init(CLARITY_ID);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)