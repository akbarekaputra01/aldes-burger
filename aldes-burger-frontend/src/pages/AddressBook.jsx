import { LocateFixed, MapPin, Save, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'

const MAP_BOUNDS = {
  north: -6.1,
  south: -6.3,
  west: 106.72,
  east: 106.92,
}

const defaultCenter = { lat: -6.2, lng: 106.816666 }

const parseAddressData = (rawAddress = '') => {
  const [main = '', detail = '', coords = ''] = rawAddress.split('||')
  const [latRaw, lngRaw] = coords.split(',')
  const lat = Number(latRaw)
  const lng = Number(lngRaw)

  return {
    mainAddress: main,
    detail,
    location: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
  }
}

const buildAddressPayload = ({ mainAddress, detail, location }) => {
  const coordinates = location ? `${location.lat},${location.lng}` : ''
  return [mainAddress.trim(), detail.trim(), coordinates].join('||')
}

const locationToPercent = ({ lat, lng }) => ({
  x: ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100,
  y: ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100,
})

function AddressBook() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addressId = searchParams.get('addressId')

  const [mainAddress, setMainAddress] = useState('')
  const [detail, setDetail] = useState('')
  const [pickedLocation, setPickedLocation] = useState(defaultCenter)
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

      const parsed = parseAddressData(selectedAddress.address)
      setMainAddress(parsed.mainAddress)
      setDetail(parsed.detail)
      setPickedLocation(parsed.location ?? defaultCenter)
    }

    loadAddress().catch(() => setError('Unable to load selected address.'))
  }, [addressId, isEditMode])

  const saveAddress = async (event) => {
    event.preventDefault()
    setError('')

    const address = buildAddressPayload({ mainAddress, detail, location: pickedLocation })

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

  const handleMapClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const xPercent = (event.clientX - bounds.left) / bounds.width
    const yPercent = (event.clientY - bounds.top) / bounds.height

    const lng = MAP_BOUNDS.west + (MAP_BOUNDS.east - MAP_BOUNDS.west) * xPercent
    const lat = MAP_BOUNDS.north - (MAP_BOUNDS.north - MAP_BOUNDS.south) * yPercent

    setPickedLocation({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) })
  }

  const pinPosition = locationToPercent(pickedLocation)

  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-8">
      <section className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-aldesRed">Address Details</p>
            <h1 className="mt-1 text-2xl font-black text-gray-900">{isEditMode ? 'Edit Delivery Address' : 'Add Delivery Address'}</h1>
            <p className="mt-1 text-sm text-gray-500">Click on map to place a delivery pin and complete detail notes.</p>
          </div>
          <div className="rounded-2xl bg-aldesYellow/25 p-3 text-aldesRed"><MapPin className="h-6 w-6" /></div>
        </div>

        <form onSubmit={saveAddress} className="space-y-4">
          <textarea
            value={mainAddress}
            onChange={(event) => setMainAddress(event.target.value)}
            rows={3}
            placeholder="Street, district, city"
            required
            className="w-full rounded-2xl border border-aldesRed/20 bg-aldesCream/20 px-4 py-3 outline-none transition focus:border-aldesRed/40 focus:ring-2 focus:ring-aldesYellow/35"
          />

          <input
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="Detail / Notes (House number, landmark, etc.)"
            className="w-full rounded-2xl border border-aldesRed/20 bg-white px-4 py-3 outline-none transition focus:border-aldesRed/40 focus:ring-2 focus:ring-aldesYellow/35"
          />

          <button
            type="button"
            onClick={handleMapClick}
            className="relative block h-72 w-full cursor-pointer overflow-hidden rounded-3xl border border-aldesRed/20 bg-aldesCream"
            title="Click anywhere to pin your location"
          >
            <img
              src="https://staticmap.openstreetmap.de/staticmap.php?center=-6.2,106.82&zoom=12&size=1000x500"
              alt="OpenStreetMap area"
              className="h-full w-full object-cover"
            />
            <span
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
            >
              <span className="block h-5 w-5 rounded-full border-4 border-aldesYellow bg-aldesRed" />
            </span>
          </button>

          <p className="inline-flex items-center gap-2 rounded-2xl bg-aldesCream px-3 py-2 text-xs font-semibold text-aldesRed">
            <LocateFixed className="h-4 w-4" />
            Pin: {pickedLocation.lat.toFixed(6)}, {pickedLocation.lng.toFixed(6)}
          </p>

          {error && <p className="text-sm text-aldesRed">{error}</p>}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate('/profile')} className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="submit" className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-aldesRed px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
              <Save className="h-4 w-4" /> Save Address
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default AddressBook
