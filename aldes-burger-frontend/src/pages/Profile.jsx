import { useEffect, useMemo, useState } from 'react'
import { User, Mail, Phone, MapPin, Edit, Trash2, Plus, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { clearAuthSession } from '../utils/auth'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [error, setError] = useState('')

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

    Promise.all([api.get('/user'), api.get('/addresses')])
      .then(([userResponse, addressesResponse]) => {
        if (!isMounted) return
        setUser(userResponse.data)
        setAddresses(addressesResponse.data)
      })
      .catch(() => {
        if (!isMounted) return
        setError('Unable to load profile data. Please refresh this page.')
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleDeleteAddress = async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`)
      setAddresses((prev) => prev.filter((address) => address.id !== addressId))
    } catch {
      setError('Unable to delete address. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch {
      // ignore network/API logout errors and clear local session anyway
    }

    clearAuthSession()
    navigate('/login')
  }

  return (
    <div className="bg-aldesCream min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-aldesYellow flex items-center justify-center mb-4 border-2 border-aldesRed">
              <span className="text-black font-bold text-2xl">{initials}</span>
            </div>
            <h1 className="text-2xl font-bold text-aldesRed mb-4 flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              {user?.name ?? 'Loading...'}
            </h1>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-center gap-2 text-aldesRed">
                <Mail className="w-4 h-4 text-aldesRed" />
                <span>{user?.email ?? '-'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-aldesRed">
                <Phone className="w-4 h-4 text-aldesRed" />
                <span>{user?.phone?.trim() ? user.phone : 'Phone number not set'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 w-full">
          <h2 className="text-xl font-bold text-aldesRed mb-4">Saved Addresses</h2>

          {addresses.length === 0 && <p className="text-sm text-gray-600">No saved addresses yet.</p>}

          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-aldesCream p-4 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2 text-aldesRed">
                  <MapPin className="w-4 h-4 text-aldesRed mt-0.5" />
                  <span>{address.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/address-book?addressId=${address.id}`)}
                    className="cursor-pointer text-aldesRed hover:opacity-70 transition-opacity"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="cursor-pointer text-aldesRed hover:opacity-70 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/address-book')}
            className="cursor-pointer w-full border-2 border-aldesRed text-aldesRed py-2 rounded-xl mt-4 font-semibold flex items-center justify-center gap-2 hover:bg-aldesRed hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        </section>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer w-full border-2 border-aldesRed text-aldesRed hover:bg-aldesRed hover:text-white transition-colors py-3 rounded-xl font-bold flex justify-center items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Profile
