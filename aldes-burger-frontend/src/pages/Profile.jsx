import { useEffect, useMemo, useState } from 'react'
import { User, Mail, Phone, MapPin, Edit, Trash2, Plus, LogOut, Loader2, AlertCircle } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { clearAuthSession } from '../utils/auth'

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [error, setError] = useState('')
  
  // State baru untuk UX yang lebih halus
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingId, setIsDeletingId] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const initials = useMemo(() => {
    const name = user?.name?.trim() ?? ''
    if (!name) return 'AB'

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }, [user?.name])

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')

    Promise.all([api.get('/user'), api.get('/addresses')])
      .then(([userResponse, addressesResponse]) => {
        if (!isMounted) return
        setUser(userResponse.data)
        setAddresses(addressesResponse.data)
      })
      .catch(() => {
        if (!isMounted) return
        setError('Gagal memuat data profil. Silakan muat ulang halaman.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [location.state?.refreshAddressesAt])

  const formatAddress = (rawAddress = '') => {
    const [mainAddress = '', detail = '', coords = ''] = rawAddress.split('||')
    const details = [mainAddress, detail].filter(Boolean).join(' • ')
    return coords ? `${details} (${coords})` : details || rawAddress
  }

  const handleDeleteAddress = async (addressId) => {
    setIsDeletingId(addressId)
    try {
      await api.delete(`/addresses/${addressId}`)
      setAddresses((prev) => prev.filter((address) => address.id !== addressId))
    } catch {
      setError('Gagal menghapus alamat. Silakan coba lagi.')
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await api.post('/logout')
    } catch {
      // Abaikan error network, paksa hapus sesi lokal
    } finally {
      clearAuthSession()
      navigate('/login')
    }
  }

  // Tampilan Loading Utama
  if (isLoading) {
    return (
      <div className="bg-aldesCream min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-aldesRed animate-spin" />
          <p className="text-sm font-semibold text-aldesRed">Memuat Profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-aldesCream min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        
        {/* Pesan Error Global */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* --- SECTION: USER INFO --- */}
        <section className="bg-white rounded-3xl shadow-sm border border-aldesCream/50 p-6 md:p-8 w-full relative overflow-hidden">
          {/* Aksen Dekoratif */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-aldesYellow/20 to-transparent pointer-events-none" />

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-5 border-4 border-aldesCream shadow-md shadow-aldesYellow/10 text-aldesRed font-black text-3xl tracking-wider">
              {initials}
            </div>
            
            <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center justify-center gap-2">
              {user?.name ?? 'Pengguna Aldes'}
            </h1>

            <div className="w-full max-w-md space-y-4 bg-aldesCream/30 p-5 rounded-2xl border border-aldesCream">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-gray-500 font-medium">
                  <Mail className="w-4 h-4 text-aldesRed" />
                  <span>Email</span>
                </div>
                <span className="font-bold text-gray-800">{user?.email ?? '-'}</span>
              </div>
              
              <div className="h-px w-full bg-aldesCream" />
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-gray-500 font-medium">
                  <Phone className="w-4 h-4 text-aldesRed" />
                  <span>Telepon</span>
                </div>
                <span className="font-bold text-gray-800">
                  {user?.phone?.trim() ? user.phone : <span className="italic text-gray-400">Belum diatur</span>}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION: ADDRESSES --- */}
        <section className="bg-white rounded-3xl shadow-sm border border-aldesCream/50 p-6 md:p-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-aldesRed" />
              Alamat Tersimpan
            </h2>
            <span className="bg-aldesCream text-aldesRed font-bold text-xs px-3 py-1 rounded-full">
              {addresses.length} Alamat
            </span>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8 px-4 bg-aldesCream/30 rounded-2xl border-2 border-dashed border-aldesCream">
              <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium mb-1">Belum ada alamat tersimpan</p>
              <p className="text-xs text-gray-400">Tambahkan alamat untuk mempermudah pesanan Anda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-white border-2 border-aldesCream p-4 rounded-2xl flex items-start sm:items-center justify-between gap-4 transition-all hover:border-aldesRed/30 hover:shadow-md group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-gray-800 leading-snug">
                      {formatAddress(address.address)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => navigate(`/address-book?addressId=${address.id}`)}
                      className="p-2.5 text-gray-400 hover:text-aldesYellow hover:bg-aldesCream rounded-xl transition-colors"
                      title="Edit Alamat"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isDeletingId === address.id}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Hapus Alamat"
                    >
                      {isDeletingId === address.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/address-book')}
            className="w-full border-2 border-dashed border-aldesRed/30 text-aldesRed py-3.5 rounded-2xl mt-6 font-bold flex items-center justify-center gap-2 hover:bg-aldesRed hover:text-white hover:border-aldesRed transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Tambah Alamat Baru
          </button>
        </section>

        {/* --- LOGOUT BUTTON --- */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-all py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-sm disabled:opacity-70 active:scale-[0.98] mt-2"
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Keluar Akun
            </>
          )}
        </button>

      </div>
    </div>
  )
}

export default Profile