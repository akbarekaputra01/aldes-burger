import { useEffect, useMemo, useState } from 'react'
import { 
  Mail, Phone, MapPin, Edit, Trash2,
  Plus, LogOut, Loader2, AlertCircle, Key,
  Lock, Eye, EyeOff, Save, X, Globe 
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AddressBookModal from '../components/AddressBookModal'
import api from '../lib/api'
import { clearAuthSession } from '../utils/auth'
import { useTranslation, useLanguage } from '../context/LanguageContext'

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { language, changeLanguage } = useLanguage()
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingId, setIsDeletingId] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

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
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return 0;
    });
  }, [addresses]);

  useEffect(() => {
    let isMounted = true
    
    // SWR Cache Layer
    const cachedUser = sessionStorage.getItem('aldes_user_cache')
    const cachedAddresses = sessionStorage.getItem('aldes_addresses_cache')
    
    if (cachedUser && cachedAddresses) {
      setUser(JSON.parse(cachedUser))
      setAddresses(JSON.parse(cachedAddresses))
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
    setError('')
    
    Promise.all([api.get('/user'), api.get('/addresses')])
      .then(([userResponse, addressesResponse]) => {
        if (!isMounted) return
        setUser(userResponse.data)
        setAddresses(addressesResponse.data)
        
        // Simpan versi terbaru ke cache
        sessionStorage.setItem('aldes_user_cache', JSON.stringify(userResponse.data))
        sessionStorage.setItem('aldes_addresses_cache', JSON.stringify(addressesResponse.data))
      })
      .catch(() => {
        if (!isMounted) return
        if (!cachedUser || !cachedAddresses) {
          setError('Failed to load profile data. Please refresh the page.')
        }
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

  const getLocalizedLabel = (label) => {
    if (!label) return '';
    const key = `addressForm.${label.toLowerCase()}`;
    const translated = t(key);
    return translated === key ? label : translated;
  }

  const handleDeleteAddress = async (addressId) => {
    setIsDeletingId(addressId)
    try {
      await api.delete(`/addresses/${addressId}`)
      const nextAddresses = addresses.filter((address) => address.id !== addressId)
      setAddresses(nextAddresses)
      sessionStorage.setItem('aldes_addresses_cache', JSON.stringify(nextAddresses))
    } catch {
      setError('Failed to delete address. Please try again.')
    } finally {
      setIsDeletingId(null)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwdStatus({ loading: true, error: '', success: '' })
    
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPwdStatus({ loading: false, error: 'New password confirmation does not match!', success: '' })
      return
    }
    
    try {
      await api.put('/user/password', passwordForm)
      
      setPwdStatus({ loading: false, error: '', success: 'Password updated successfully!' })
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      
      setTimeout(() => {
        setIsChangingPassword(false)
        setPwdStatus({ loading: false, error: '', success: '' })
        setShowPassword(false)
      }, 2000)
    } catch (err) {
      setPwdStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to change password. Please ensure your current password is correct.',
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
      sessionStorage.clear() // Bersihkan semua render cache
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
      
      {/* Custom Scrollbar bergaya Brutalism */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: #fef3c7; border-left: 2px solid black; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #ef4444; border: 2px solid black; border-radius: 0px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #dc2626; }
      `}</style>

      <div className="mx-auto w-full max-w-6xl flex flex-col gap-8">
        
        {/* HEADER SECTION */}
        <div className="mb-2 flex flex-col items-start gap-2">
          <p className="inline-flex items-center rounded-xl bg-aldesYellow px-4 py-1.5 text-sm font-black uppercase tracking-widest text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {t('profile.myProfile')}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-aldesRed tracking-tight uppercase" style={{ WebkitTextStroke: '1.5px black' }}>
            {t('profile.hello', user?.name?.split(' ')[0] ?? t('profile.guest'))}
          </h1>
        </div>

        {error && (
          <div className="rounded-2xl bg-aldesCream p-4 text-black flex items-center gap-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-aldesRed" />
            <p className="text-base font-black uppercase">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: PROFIL & KEAMANAN */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* CARD: USER INFO */}
            <article className="rounded-3xl bg-white p-6 lg:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col items-center text-center pb-6 border-b-4 border-black">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-aldesYellow border-4 border-black text-4xl font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {initials}
                </div>
                <h2 className="text-2xl font-black text-black w-full truncate uppercase">{user?.name ?? t('profile.guest')}</h2>
                <p className="mt-1 text-sm font-bold text-aldesRed uppercase tracking-wider bg-aldesCream px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{t('profile.member')}</p>
              </div>

              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-4 rounded-2xl border-4 border-black p-3 bg-aldesCream shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-widest text-aldesRed">{t('profile.email')}</p>
                    <p className="truncate text-base font-bold text-black mt-0.5">{user?.email ?? '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border-4 border-black p-3 bg-aldesCream shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-widest text-aldesRed">{t('profile.phone')}</p>
                    <p className="truncate text-base font-bold text-black mt-0.5">
                      {user?.phone?.trim() ? user.phone : <span className="italic text-gray-500 font-bold">{t('profile.unset')}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* CARD: KEAMANAN AKUN */}
            <article className="rounded-3xl bg-white p-6 lg:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6 flex items-center gap-3 border-b-4 border-black pb-4">
                <div className="p-2 bg-aldesYellow rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                  <Key className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-black uppercase">{t('profile.security')}</h2>
              </div>

              {!isChangingPassword ? (
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-black bg-aldesYellow py-4 text-sm font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none uppercase"
                >
                  <Lock className="h-5 w-5" />
                  {t('profile.changePassword')}
                </button>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {pwdStatus.error && (
                    <div className="flex items-start gap-2 rounded-xl bg-white border-4 border-black p-3 text-sm font-black text-aldesRed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                      <span>{pwdStatus.error}</span>
                    </div>
                  )}
                  {pwdStatus.success && (
                    <div className="flex items-start gap-2 rounded-xl bg-aldesYellow border-4 border-black p-3 text-sm font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Key className="mt-0.5 h-5 w-5 shrink-0" />
                      <span>{pwdStatus.success}</span>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t('profile.currentPassword')}
                        required
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(p => ({...p, current_password: e.target.value}))}
                        className="w-full rounded-2xl border-4 border-black bg-aldesCream px-4 py-3.5 pr-12 text-sm font-bold text-black outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t('profile.newPassword')}
                        required
                        value={passwordForm.password}
                        onChange={(e) => setPasswordForm(p => ({...p, password: e.target.value}))}
                        className="w-full rounded-2xl border-4 border-black bg-aldesCream px-4 py-3.5 pr-12 text-sm font-bold text-black outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t('profile.confirmNewPassword')}
                        required
                        value={passwordForm.password_confirmation}
                        onChange={(e) => setPasswordForm(p => ({...p, password_confirmation: e.target.value}))}
                        className="w-full rounded-2xl border-4 border-black bg-aldesCream px-4 py-3.5 pr-12 text-sm font-bold text-black outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border-2 border-transparent p-1 transition-colors hover:bg-aldesYellow hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={pwdStatus.loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-4 border-black bg-aldesRed py-3.5 text-base font-black tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
                    >
                      {pwdStatus.loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-5 w-5" />}
                      {t('profile.savePassword')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPwdStatus({ loading: false, error: '', success: '' })
                        setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
                        setShowPassword(false)
                      }}
                      className="flex items-center justify-center rounded-2xl border-4 border-black bg-white px-5 py-3.5 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none"
                      title="Cancel"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </form>
              )}
            </article>

            {/* CARD: LANGUAGE */}
            <article className="rounded-3xl bg-white p-6 lg:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6 flex items-center gap-3 border-b-4 border-black pb-4">
                <div className="p-2 bg-aldesYellow rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                  <Globe className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-black uppercase">{t('profile.language')}</h2>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`flex-1 rounded-2xl border-4 border-black py-3 font-black uppercase transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-none ${language === 'en' ? 'bg-aldesRed text-white shadow-[4px_4px_0_0_#000]' : 'bg-white text-black shadow-[4px_4px_0_0_#000]'}`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('id')}
                  className={`flex-1 rounded-2xl border-4 border-black py-3 font-black uppercase transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-none ${language === 'id' ? 'bg-aldesRed text-white shadow-[4px_4px_0_0_#000]' : 'bg-white text-black shadow-[4px_4px_0_0_#000]'}`}
                >
                  Indonesia
                </button>
              </div>
            </article>

            {/* BUTTON: LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-3xl border-4 border-black bg-white py-4 text-base font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:bg-red-50 hover:text-aldesRed hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-70"
            >
              {isLoggingOut ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-6 w-6" />
                  {t('profile.logOut')}
                </>
              )}
            </button>
          </div>

          {/* KOLOM KANAN: ALAMAT TERSIMPAN */}
          <div className="lg:col-span-7">
            <article className="flex flex-col rounded-3xl bg-white p-6 lg:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full min-h-[600px]">
              
              <div className="mb-6 flex items-center justify-between border-b-4 border-black pb-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-aldesRed rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-black text-black uppercase">{t('profile.addressBook')}</h2>
                </div>
                <span className="rounded-xl bg-aldesYellow border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-1.5 text-xs font-black text-black uppercase">
                  {t('profile.saved', addresses.length)}
                </span>
              </div>

              {/* Area List Alamat dengan Scroll */}
              <div className="flex-1 overflow-y-auto custom-scroll pr-3 space-y-5 max-h-[400px]">
                {sortedAddresses.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border-4 border-dashed border-black bg-aldesCream p-6 text-center">
                    <MapPin className="mb-4 h-14 w-14 text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                    <p className="text-xl font-black text-black uppercase">{t('profile.noAddressYet')}</p>
                    <p className="mt-2 text-sm font-bold text-gray-700">{t('profile.addAddressDesc')}</p>
                  </div>
                ) : (
                  sortedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`group relative flex flex-col justify-between gap-4 rounded-2xl border-4 border-black p-5 transition-all sm:flex-row sm:items-start ${
                        address.is_default ? 'bg-aldesYellow' : 'bg-aldesCream'
                      } shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                    >
                      <div className="flex flex-1 w-full min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-black text-black truncate uppercase">{address.recipient_name || t('profile.recipient')}</span>
                          {address.label && (
                            <span className="rounded-lg bg-white border-2 border-black px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {getLocalizedLabel(address.label)}
                            </span>
                          )}
                          {address.is_default && (
                            <span className="rounded-lg bg-aldesRed border-2 border-black px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {t('profile.default')}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-aldesRed bg-white self-start px-2 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{address.phone_number || '-'}</span>
                        
                        <p className="mt-2 w-full text-sm font-bold text-black leading-relaxed bg-white p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {formatAddress(address)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto mt-2 sm:mt-0">
                        {!address.is_default && (
                          <button 
                             type="button"
                             onClick={async () => {
                               await api.put(`/addresses/${address.id}`, { ...address, is_default: true });
                               const next = addresses.map((it)=>({ ...it, is_default: it.id===address.id }))
                               setAddresses(next)
                               sessionStorage.setItem('aldes_addresses_cache', JSON.stringify(next))
                             }}
                             className="rounded-xl p-3 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none"
                             title="Set as Default"
                          >
                            <MapPin className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setEditingAddress(address); setIsAddressModalOpen(true) }}
                          className="rounded-xl p-3 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none"
                          title="Edit Address"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={isDeletingId === address.id}
                          className="rounded-xl p-3 border-2 border-black bg-aldesRed text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
                          title="Delete Address"
                        >
                          {isDeletingId === address.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true) }}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border-4 border-black bg-aldesYellow py-4 text-base font-black tracking-widest text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none uppercase"
              >
                <Plus className="h-6 w-6 stroke-[3px]" />
                {t('profile.addNewAddress')}
              </button>
            </article>
          </div>
        </div>
      </div>

      <AddressBookModal 
         open={isAddressModalOpen} 
         initialAddress={editingAddress} 
         userPhone={user?.phone} 
         onClose={() => setIsAddressModalOpen(false)} 
         onSaved={async () => {
           const { data } = await api.get('/addresses');
           setAddresses(data)
           sessionStorage.setItem('aldes_addresses_cache', JSON.stringify(data))
         }} 
       />
    </main>
  )
}

export default Profile
