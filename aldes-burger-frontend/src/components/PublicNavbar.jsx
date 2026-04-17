import { Link } from 'react-router-dom'

function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-aldesRed/15 bg-aldesCream/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-black tracking-wide text-aldesRed transition hover:opacity-90">
          Aldes Burger
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/menus"
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-aldesYellow/25"
          >
            View Menus
          </Link>
          <Link
            to="/login"
            className="rounded-2xl border border-aldesRed/25 bg-white px-4 py-2 text-sm font-semibold text-aldesRed transition hover:bg-aldesRed/10"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-aldesRed px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default PublicNavbar
