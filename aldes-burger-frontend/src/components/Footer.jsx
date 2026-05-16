import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react'

function Footer() {
  // Logika untuk mengambil tahun saat ini secara otomatis
  const currentYear = new Date().getFullYear()

  return (
    <>
      <footer className="bg-aldesRed px-4 pb-8 pt-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 md:grid-cols-3 lg:gap-16">
          
          {/* Kolom 1: Brand & Sosial Media */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-black italic tracking-wide text-aldesYellow">ALDES BURGER</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Nikmati kelezatan burger autentik dengan bahan-bahan premium pilihan. Kepuasan Anda adalah prioritas utama kami.
              </p>
            </div>
            
            {/* Ikon Sosial Media dengan Efek Hover */}
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
            <h4 className="mb-5 text-lg font-bold uppercase tracking-wider text-aldesYellow">Quick Links</h4>
            <ul className="space-y-3 text-sm font-medium text-white/80">
              <li>
                <a href="/menu" className="transition-colors hover:text-white hover:underline underline-offset-4">
                  Order Now
                </a>
              </li>
              <li>
                <a href="/kitchen" className="transition-colors hover:text-white hover:underline underline-offset-4">
                  Build Your Burger
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white hover:underline underline-offset-4">
                  Promo & Offers
                </a>
              </li>
              <li>
                <a href="/profile" className="transition-colors hover:text-white hover:underline underline-offset-4">
                  My Account
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Informasi */}
          <div>
            <h4 className="mb-5 text-lg font-bold uppercase tracking-wider text-aldesYellow">Contact Us</h4>
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
                <span>hello@aldesburger.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Garis Pemisah & Copyright */}
        <div className="mx-auto mt-12 w-full max-w-7xl border-t border-white/20 pt-8 text-center text-sm font-medium text-white/60">
          <p>© {currentYear} Aldes Burger. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Aksen Checkerboard di paling bawah */}
      <div className="checkerboard-strip h-6" aria-hidden="true" />
    </>
  )
}

export default Footer