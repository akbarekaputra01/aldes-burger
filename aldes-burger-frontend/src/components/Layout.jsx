import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { getToken } from '../utils/auth'

function Layout() {
  // TEMP: Bypass login — uncomment baris bawah & hapus baris ini untuk restore
  // const isLoggedIn = Boolean(getToken())
  const isLoggedIn = true

  return (
    <div className="flex min-h-screen flex-col bg-aldesCream">
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="checkerboard-strip h-2" aria-hidden="true" />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout