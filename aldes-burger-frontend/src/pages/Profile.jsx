import { useEffect, useMemo, useState } from 'react'
import {
  Mail, Phone, MapPin, Edit, Trash2,
  Plus, LogOut, Loader2, AlertCircle, Key,
  Lock, Eye, EyeOff, Save, X
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { clearAuthSession } from '../utils/auth'

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingId, setIsDeletingId] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // State untuk Ubah Password
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })
  const [pwdStatus, setPwdStatus] = useState({ loading: false, error: '', success: '' })

  const initials = useMemo(() => {
    const name = user?.name?.trim() ?? ''
    if (!name) return 'AB'
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }, [user?.name])

  // LOGIKA SORTING: Memastikan alamat default selalu di atas
  const sortedAddresses = useMemo(() => {
    if (!addresses || addresses.length === 0) return [];
    return [...addresses].sort((a, b) => {
      // Jika a adalah default dan b bukan, a naik ke atas (-1)
      if (a.is_default && !b.is_default) return -1;
      // Jika b adalah default dan a bukan, b naik ke atas (1)
      if (!a.is_default && b.is_default) return 1;
      // Jika sama, pertahankan urutan
      return 0;
    });
  }, [addresses]);

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

  const formatAddress = (address) => {
    if (address?.street_address) {
      return [address.street_address, address.detail_address, address.district, address.city, address.province, address.postal_code].filter(Boolean).join(', ')
    }
    return address?.address || '-'
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwdStatus({ loading: true, error: '', success: '' })
    
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPwdStatus({ loading: false, error: 'Konfirmasi password baru tidak cocok!', success: '' })
      return
    }
    
    try {
      await api.put('/user/password', passwordForm)
      
      setPwdStatus({ loading: false, error: '', success: 'Password berhasil diperbarui!' })
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      
      setTimeout(() => {
        setIsChangingPassword(false)
        setPwdStatus({ loading: false, error: '', success: '' })
        setShowPassword(false)
      }, 2000)
    } catch (err) {
      setPwdStatus({
        loading: false,
        error: err.response?.data?.message || 'Gagal mengubah password. Pastikan password lama Anda benar.',
        success: ''
      })
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
      window.location.reload()
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-aldesCream flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-aldesRed animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
      
      {/* Custom Scrollbar untuk area Address Book */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #fca5a5; border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #ef4444; }
      `}</style>

      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-8 text-3xl font-black text-gray-900 tracking-tight">
          Hello, <span className="text-aldesRed">{user?.name?.split(' ')[0] ?? 'Guest'}!</span>
        </h1>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-600 flex items-center gap-3 border border-red-100 shadow-sm animate-in fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================= */}
          {/* KOLOM KIRI: PROFIL & KEAMANAN */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* SECTION: USER INFO (Lebih Jelas & Terstruktur) */}
            <article className="rounded-3xl bg-white p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-aldesCream text-3xl font-black text-aldesRed shadow-sm">
                  {initials}
                </div>
                <h2 className="text-2xl font-black text-gray-900 w-full truncate">{user?.name ?? 'Guest User'}</h2>
                <p className="mt-1 text-sm font-medium text-gray-500">Aldes Burger Member</p>
              </div>

              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-aldesCream group-hover:text-aldesRed">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</p>
                    <p className="truncate text-base font-semibold text-gray-900 mt-0.5">{user?.email ?? '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-aldesCream group-hover:text-aldesRed">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</p>
                    <p className="truncate text-base font-semibold text-gray-900 mt-0.5">
                      {user?.phone?.trim() ? user.phone : <span className="italic text-gray-400 font-medium">Belum diatur</span>}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION: KEAMANAN AKUN */}
            <article className="rounded-3xl bg-white p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="mb-5 flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
                  <Key className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Security</h2>
              </div>

              {!isChangingPassword ? (
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-50 py-3.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-aldesCream hover:text-aldesRed"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-in fade-in">
                  {pwdStatus.error && (
                    <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{pwdStatus.error}</span>
                    </div>
                  )}
                  {pwdStatus.success && (
                    <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600">
                      <Key className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{pwdStatus.success}</span>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Current Password"
                        required
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(p => ({...p, current_password: e.target.value}))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-sm font-medium text-gray-900 outline-none transition-all focus:border-aldesRed focus:bg-white"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        required
                        value={passwordForm.password}
                        onChange={(e) => setPasswordForm(p => ({...p, password: e.target.value}))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-sm font-medium text-gray-900 outline-none transition-all focus:border-aldesRed focus:bg-white"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        required
                        value={passwordForm.password_confirmation}
                        onChange={(e) => setPasswordForm(p => ({...p, password_confirmation: e.target.value}))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-sm font-medium text-gray-900 outline-none transition-all focus:border-aldesRed focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-aldesRed"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={pwdStatus.loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-aldesRed py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
                    >
                      {pwdStatus.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPwdStatus({ loading: false, error: '', success: '' })
                        setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
                        setShowPassword(false)
                      }}
                      className="rounded-2xl bg-gray-50 px-4 py-3.5 font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      title="Cancel"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              )}
            </article>

            {/* SECTION: LOGOUT BUTTON */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-white py-4 text-sm font-bold text-gray-500 shadow-sm border border-gray-100 transition-colors hover:bg-red-50 hover:text-aldesRed hover:border-red-100 disabled:opacity-70"
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Log Out Account
                </>
              )}
            </button>
          </div>

          {/* ========================================================= */}
          {/* KOLOM KANAN: ALAMAT TERSIMPAN */}
          {/* ========================================================= */}
          <div className="lg:col-span-7">
            <article className="flex flex-col rounded-3xl bg-white p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-aldesCream/50 rounded-xl text-aldesRed">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Address Book</h2>
                </div>
                <span className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500">
                  {addresses.length} Saved
                </span>
              </div>

              {/* Area List Alamat dengan Max-Height dan Scroll */}
              <div className="max-h-[460px] overflow-y-auto custom-scroll pr-2 space-y-3">
                {sortedAddresses.length === 0 ? (
                  <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-6 text-center mr-2">
                    <MapPin className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-base font-bold text-gray-700">No Address Yet</p>
                    <p className="mt-1 text-sm text-gray-500">Add a delivery address to make ordering faster.</p>
                  </div>
                ) : (
                  sortedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl p-5 transition-all hover:bg-gray-50 sm:flex-row sm:items-start ${
                        address.is_default ? 'bg-red-50/30 border border-red-100' : 'bg-white border border-gray-100'
                      }`}
                    >
                      {/* Highlight border untuk alamat default */}
                      <div className={`absolute left-0 top-0 h-full w-1.5 ${address.is_default ? 'bg-aldesRed' : 'bg-transparent'}`}></div>
                      
                      <div className="flex min-w-0 flex-col gap-1.5 pl-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-gray-900 truncate">{address.recipient_name || 'Recipient'}</span>
                          {address.label && (
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border border-gray-200">
                              {address.label}
                            </span>
                          )}
                          {address.is_default && (
                            <span className="rounded-md bg-aldesRed px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">{address.phone_number || '-'}</span>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{formatAddress(address)}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 shrink-0">
                        {!address.is_default && (
                          <button 
                            type="button" 
                            onClick={async () => { 
                              await api.put(`/addresses/${address.id}`, { ...address, is_default: true }); 
                              setAddresses((prev)=>prev.map((it)=>({ ...it, is_default: it.id===address.id }))) 
                            }} 
                            className="rounded-xl p-2.5 text-gray-400 bg-white shadow-sm border border-gray-100 transition-colors hover:text-aldesRed" 
                            title="Set as Default"
                          >
                            <MapPin className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/address-book?addressId=${address.id}`)}
                          className="rounded-xl p-2.5 text-gray-400 bg-white shadow-sm border border-gray-100 transition-colors hover:text-blue-500"
                          title="Edit Address"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={isDeletingId === address.id}
                          className="rounded-xl p-2.5 text-gray-400 bg-white shadow-sm border border-gray-100 transition-colors hover:text-red-500 disabled:opacity-50"
                          title="Delete Address"
                        >
                          {isDeletingId === address.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate('/address-book')}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-500 transition-all hover:border-aldesRed hover:text-aldesRed hover:bg-aldesCream/30 active:scale-[0.98]"
              >
                <Plus className="h-5 w-5" />
                Add New Address
              </button>
            </article>
          </div>

        </div>
      </div>
    </main>
  )
}

export default Profile