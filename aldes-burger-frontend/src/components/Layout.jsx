import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { getToken } from '../utils/auth'

function Layout() {
  const isLoggedIn = Boolean(getToken())

  return (
    <div className="flex min-h-screen flex-col bg-aldesCream">
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="checkerboard-strip h-2" aria-hidden="true" />

      {/* Hapus flex-1 agar tidak memaksa sisa ruang menjadi krem */}
      <main>
        <Outlet />
      </main>

      {/* Hapus mt-12 agar footer menempel langsung dengan bar checkout putih */}
      <footer className="bg-aldesRed p-8 text-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <h4 className="mb-3 text-lg font-bold">Menu Links</h4>
            <ul className="space-y-2 text-sm">
              <li>Order Now</li>
              <li>Build Your Burger</li>
              <li>My Account</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-bold">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>Contact</li>
              <li>Terms &amp; Conditions</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-bold">Social Media</h4>
            <ul className="space-y-2 text-sm">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 w-full max-w-7xl text-center text-sm">© 2026 Aldes Burger. All Rights Reserved.</p>
      </footer>

      <div className="checkerboard-strip h-6" aria-hidden="true" />
    </div>
  )
}

export default Layout