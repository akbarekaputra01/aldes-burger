import { MapPin, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'

function AddressBook() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addressId = searchParams.get('addressId')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const isEditMode = useMemo(() => Boolean(addressId), [addressId])

  useEffect(() => {
    if (!isEditMode) return

    const loadAddress = async () => {
      const { data } = await api.get('/addresses')
      const selectedAddress = data.find((item) => String(item.id) === String(addressId))
      if (!selectedAddress) {
        setError('Address not found.')
        return
      }

      setAddress(selectedAddress.address)
    }

    loadAddress().catch(() => setError('Unable to load selected address.'))
  }, [addressId, isEditMode])

  const saveAddress = async (event) => {
    event.preventDefault()
    setError('')

    try {
      if (isEditMode) {
        await api.put(`/addresses/${addressId}`, { address })
      } else {
        await api.post('/addresses', { address })
      }

      navigate('/profile')
    } catch {
      setError('Unable to save address. Please try again.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-8">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Address Details</p>
            <h1 className="mt-1 text-2xl font-black text-gray-900">{isEditMode ? 'Edit Delivery Address' : 'Add Delivery Address'}</h1>
            <p className="mt-1 text-sm text-gray-500">Save your address here so it is ready for checkout.</p>
          </div>
          <div className="rounded-2xl bg-yellow-100 p-3 text-red-600"><MapPin className="h-6 w-6" /></div>
        </div>

        <form onSubmit={saveAddress} className="space-y-4">
          <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={4} placeholder="Full address" required className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate('/profile')} className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="submit" className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">Save Address</button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default AddressBook
