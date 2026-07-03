import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
  // Cek apakah user sudah login. 
  // (Sesuaikan ini dengan cara Anda menyimpan sesi login, misalnya dari localStorage atau Context)
  const isAuthenticated = localStorage.getItem('aldes_token') 

  // Jika tidak ada token (belum login), arahkan paksa ke halaman /login
  // 'replace' digunakan agar user tidak bisa menekan tombol "Back" di browser untuk kembali ke rute terlarang
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Jika sudah login, biarkan mereka lewat dan render halaman yang dituju
  return <Outlet />
}

export default ProtectedRoute