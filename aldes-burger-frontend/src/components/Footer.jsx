import React, { useRef, useEffect } from 'react'
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import mascotSprite from '../assets/1.jpg'
import { useTranslation } from '../context/LanguageContext'
function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const canvasRef = useRef(null)

  // Logika Animasi Canvas Maskot
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const W = 1200
    const H = 120
    canvas.width = W
    canvas.height = H

    const COLS = 4
    const ROWS = 2
    const N = 8
    const GROUND = H - 15
    const LEFT_B = 60
    const RIGHT_B = W - 60

    // Konfigurasi Kecepatan Animasi
    const fps = 8
    const walkSpeed = 90
    
    let x = RIGHT_B 
    let dir = -1 
    let frame = 0
    let frameT = 0
    let lastTs = null
    let requestRef

    let ofc = null
    let fw = 0
    let fh = 0
    let loaded = false

    const processSprite = (img) => {
      fw = Math.floor(img.naturalWidth / COLS)
      fh = Math.floor(img.naturalHeight / ROWS)
      ofc = document.createElement('canvas')
      ofc.width = img.naturalWidth
      ofc.height = img.naturalHeight
      const oc = ofc.getContext('2d')
      oc.drawImage(img, 0, 0)
      
      const id = oc.getImageData(0, 0, ofc.width, ofc.height)
      const d = id.data
      for (let p = 0; p < d.length; p += 4) {
        const r = d[p], g = d[p + 1], b = d[p + 2]
        if (r > 225 && g > 225 && b > 225) {
          d[p + 3] = 0
        } else if (r > 200 && g > 200 && b > 200) {
          const bright = (r + g + b) / 3
          d[p + 3] = Math.max(0, Math.floor((255 - bright) * 2.5))
        }
      }
      oc.putImageData(id, 0, 0)
      loaded = true
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => processSprite(img)
    img.src = mascotSprite 

    const drawShadow = (cx) => {
      ctx.save()
      ctx.globalAlpha = 0.25
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(cx, GROUND + 8, 35, 7, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const drawSprite = (fi, cx, bottom, flip) => {
      if (!loaded) return
      const col = fi % COLS
      const row = Math.floor(fi / COLS)
      const sx = col * fw
      const sy = row * fh
      const dh = 120
      const dw = Math.round((dh * fw) / fh)
      const dx = cx - dw / 2
      const dy = bottom - dh
      ctx.save()
      if (flip) {
        ctx.translate(cx, dy)
        ctx.scale(-1, 1)
        ctx.drawImage(ofc, sx, sy, fw, fh, -dw / 2, 0, dw, dh)
      } else {
        ctx.drawImage(ofc, sx, sy, fw, fh, dx, dy, dw, dh)
      }
      ctx.restore()
    }

    const loop = (ts) => {
      if (!lastTs) lastTs = ts
      const dt = Math.min((ts - lastTs) / 1000, 0.05)
      lastTs = ts

      ctx.clearRect(0, 0, W, H)

      x += dir * walkSpeed * dt
      if (x >= RIGHT_B) { x = RIGHT_B; dir = -1; }
      if (x <= LEFT_B)  { x = LEFT_B;  dir =  1; }
      
      frameT += dt
      if (frameT >= 1 / fps) { 
        frame = (frame + 1) % N
        frameT = 0 
      }

      drawShadow(x)

      if (loaded) {
        drawSprite(frame, x, GROUND, dir === -1)
      }

      requestRef = requestAnimationFrame(loop)
    }

    requestRef = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(requestRef)
  }, [])

  return (
    <>
      <footer className="bg-aldesRed px-4 py-4 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 md:grid-cols-3 lg:gap-16">
          
          {/* Kolom 1: Brand & Sosial Media */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-black italic tracking-wide text-aldesYellow">ALDES BURGER</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                {t('footer.tagline')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-aldesYellow hover:text-aldesRed hover:shadow-lg">
                <Instagram size={20} strokeWidth={2.5} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-aldesYellow hover:text-aldesRed hover:shadow-lg">
                <Facebook size={20} strokeWidth={2.5} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-aldesYellow hover:text-aldesRed hover:shadow-lg">
                <Twitter size={20} strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* Kolom 2: Quick Links */}
          <div>
            <h4 className="mb-5 text-lg font-bold uppercase tracking-wider text-aldesYellow">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3 text-sm font-medium text-white/80">
              <li>
                <a href="/menu" className="transition-colors hover:text-white hover:underline underline-offset-4">{t('footer.orderNow')}</a>
              </li>
              <li>
                <a href="/kitchen" className="transition-colors hover:text-white hover:underline underline-offset-4">{t('footer.buildBurger')}</a>
              </li>
              <li>
                <a href="/transactions" className="transition-colors hover:text-white hover:underline underline-offset-4">{t('footer.checkTransaction')}</a>
              </li>
              <li>
                <a href="/profile" className="transition-colors hover:text-white hover:underline underline-offset-4">{t('footer.myAccount')}</a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Informasi */}
          <div>
            <h4 className="mb-5 text-lg font-bold uppercase tracking-wider text-aldesYellow">{t('footer.contactUs')}</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3 transition-colors hover:text-white">
                <MapPin size={18} className="shrink-0 text-aldesYellow" />
                <span className="leading-relaxed">Jl. Raya Serpong, Tangerang, Banten, Indonesia</span>
              </li>
              <li className="flex items-center gap-3 transition-colors hover:text-white">
                <Phone size={18} className="shrink-0 text-aldesYellow" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3 transition-colors hover:text-white">
                <Mail size={18} className="shrink-0 text-aldesYellow" />
                <span>aldesburger@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* AREA MASKOT BERJALAN MENGGUNAKAN CANVAS */}
        {/* ------------------------------------------------------------- */}
        <div className="mx-auto w-full max-w-7xl pointer-events-none">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ display: 'block' }}
          />
        </div>

        {/* Garis Pemisah & Copyright */}
        <div className="mx-auto w-full max-w-7xl border-t border-white/20 pt-8 text-center text-sm font-medium text-white/60">
          <p>© {currentYear} Aldes Burger. {t('footer.copyright')}</p>
        </div>
      </footer>

      {/* Aksen Checkerboard di paling bawah */}
      <div className="checkerboard-strip h-6" aria-hidden="true" />
    </>
  )
}

export default Footer