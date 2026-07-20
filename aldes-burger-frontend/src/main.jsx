import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Clarity from 'react-clarity' // 1. Import Clarity
import './index.css'
import App from './App.jsx'

// 2. Inisialisasi Clarity di luar komponen (sebelum render)
const CLARITY_ID = "xp9psgojzf";

// Opsional: jalankan hanya di lingkungan production
if (import.meta.env.PROD) {
  Clarity.init(CLARITY_ID);
} else {
  // Jika ingin tetap jalan saat local testing, langsung panggil:
  // Clarity.init(CLARITY_ID);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)