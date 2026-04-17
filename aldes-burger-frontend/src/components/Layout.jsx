import { Outlet, useLocation } from 'react-router-dom'
import AppNavbar from './AppNavbar'
import PublicNavbar from './PublicNavbar'

function Layout() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  return (
    <div className="flex min-h-screen flex-col bg-aldesCream">
      {isLandingPage ? <PublicNavbar /> : <AppNavbar />}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-12 bg-aldesRed p-8 text-white">
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
    </div>
  )
}

export default Layout
