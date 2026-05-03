import { MapPin, Save, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { reverseGeocode, searchAddressSuggestions } from './addressbook/geocoding'
import { applyCurrentLocationToForm, applySuggestionToForm, canSubmitAddress, hasValidPin } from './addressbook/formLogic'
import { getCities, getDistricts, getPostalCodes, getProvinces } from './addressbook/regions'

const defaultCenter = { lat: -6.2, lng: 106.816666 }
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

const loadLeaflet = async () => {
  if (window.L) return window.L
  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = LEAFLET_CSS; document.head.appendChild(css)
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = LEAFLET_JS; script.async = true; script.onload = resolve; script.onerror = reject; document.body.appendChild(script)
  })
  return window.L
}

function AddressBook() {
  const navigate = useNavigate(); const [searchParams] = useSearchParams(); const addressId = searchParams.get('addressId'); const isEditMode = useMemo(() => Boolean(addressId), [addressId])
  const [form, setForm] = useState({ recipient_name: '', phone_number: '', province: '', city: '', district: '', postal_code: '', street_address: '', detail_address: '', label: 'Home', is_default: false, latitude: null, longitude: null, pin_source: 'default', pin_confirmed: false })
  const [suggestions, setSuggestions] = useState([]); const [error, setError] = useState(''); const [isSaving, setIsSaving] = useState(false)
  const [isSearching, setIsSearching] = useState(false); const [suggestionError, setSuggestionError] = useState('')
  const mapRef = useRef(null); const mapElRef = useRef(null); const markerRef = useRef(null)

  const [provinceOptions, setProvinceOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [postalCodeOptions, setPostalCodeOptions] = useState([])

  const hasValidPinValue = hasValidPin(form)
  const canSubmit = canSubmitAddress(form)
  const hasStreetAddress = form.street_address.trim().length >= 3

  useEffect(() => { if (!isEditMode) return; api.get('/addresses').then(({ data }) => { const item = data.find((it) => String(it.id) === String(addressId)); if (!item) return setError('Address not found.'); setForm((prev) => ({ ...prev, ...item, latitude: item.latitude ?? null, longitude: item.longitude ?? null, pin_source: item.pin_source ?? 'default', pin_confirmed: !!item.pin_confirmed })) }).catch(() => setError('Unable to load selected address.')) }, [addressId, isEditMode])
  useEffect(() => { getProvinces().then(setProvinceOptions).catch(() => setProvinceOptions([])) }, [])

  useEffect(() => {
    const selected = provinceOptions.find((x) => x.name === form.province)
    if (!selected) { setCityOptions([]); return }
    getCities(selected.id).then(setCityOptions).catch(() => setCityOptions([]))
  }, [form.province, provinceOptions])

  useEffect(() => {
    const selected = cityOptions.find((x) => x.name === form.city)
    if (!selected) { setDistrictOptions([]); return }
    getDistricts(selected.id).then(setDistrictOptions).catch(() => setDistrictOptions([]))
  }, [form.city, cityOptions])

  useEffect(() => {
    const selected = districtOptions.find((x) => x.name === form.district)
    if (!selected) { setPostalCodeOptions([]); return }
    getPostalCodes(selected.id, { district: form.district, city: form.city, province: form.province }).then(setPostalCodeOptions).catch(() => setPostalCodeOptions([]))
  }, [form.district, districtOptions, form.city, form.province])


  useEffect(() => {
    const q = form.street_address?.trim()
    if (!form.postal_code) { setSuggestions([]); setSuggestionError('Select postal code first to get better street suggestions.'); return }
    if (!q || q.length < 3) { setSuggestions([]); setSuggestionError(''); return }
    const t = setTimeout(async () => {
      try {
        setIsSearching(true); setSuggestionError('')
        const result = await searchAddressSuggestions(q, { province: form.province, city: form.city, district: form.district, postalCode: form.postal_code })
        setSuggestions(result)
      } catch {
        setSuggestions([])
        setSuggestionError('Unable to fetch suggestions right now. Try moving the map pin manually.')
      } finally { setIsSearching(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [form.street_address, form.province, form.city, form.district, form.postal_code])

  useEffect(() => { if (!hasStreetAddress) return; let mounted = true; loadLeaflet().then((L) => { if (!mounted || mapRef.current || !mapElRef.current) return; mapRef.current = L.map(mapElRef.current).setView([form.latitude ?? defaultCenter.lat, form.longitude ?? defaultCenter.lng], 13); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(mapRef.current); markerRef.current = L.marker([form.latitude ?? defaultCenter.lat, form.longitude ?? defaultCenter.lng]).addTo(mapRef.current); mapRef.current.on('click', (event) => { setForm((prev) => ({ ...prev, latitude: Number(event.latlng.lat.toFixed(8)), longitude: Number(event.latlng.lng.toFixed(8)), pin_source: 'manual_adjusted', pin_confirmed: true })) }) }).catch(() => setError('Unable to load map.')); return () => { mounted = false; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null } } }, [hasStreetAddress, form.latitude, form.longitude])

  useEffect(() => { if (!mapRef.current || !markerRef.current || form.latitude === null || form.longitude === null) return; markerRef.current.setLatLng([form.latitude, form.longitude]); mapRef.current.panTo([form.latitude, form.longitude]) }, [form.latitude, form.longitude])

  const submit = async (e) => { e.preventDefault(); setError(''); if (!hasValidPinValue) return setError('Choose a location from the suggestions or set a map pin so the courier can find your address.'); setIsSaving(true); try { if (isEditMode) await api.put(`/addresses/${addressId}`, form); else await api.post('/addresses', form); navigate('/profile', { state: { refreshAddressesAt: Date.now() } }) } catch (err) { setError(err?.response?.data?.message ?? 'Unable to save address.') } finally { setIsSaving(false) } }

  return <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-8"><section className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-md sm:p-8"><div className="mb-6 flex items-start justify-between"><h1 className="text-2xl font-black">{isEditMode ? 'Edit Delivery Address' : 'Add Delivery Address'}</h1><MapPin className="h-6 w-6" /></div><form onSubmit={submit} className="space-y-3"><input value={form.recipient_name} onChange={(e)=>setForm((p)=>({ ...p, recipient_name: e.target.value }))} placeholder="recipient name" className="w-full rounded-2xl border px-4 py-3" required/><input value={form.phone_number} onChange={(e)=>setForm((p)=>({ ...p, phone_number: e.target.value }))} placeholder="phone number" className="w-full rounded-2xl border px-4 py-3" required/><select value={form.province} onChange={(e)=>setForm((p)=>({ ...p, province: e.target.value, city: '', district: '', postal_code: '' }))} className="w-full rounded-2xl border px-4 py-3" required><option value="">Select Province</option>{provinceOptions.map((x)=><option key={x.id} value={x.name}>{x.name}</option>)}</select><select value={form.city} onChange={(e)=>setForm((p)=>({ ...p, city: e.target.value, district: '', postal_code: '' }))} className="w-full rounded-2xl border px-4 py-3" required disabled={!form.province}><option value="">Select City/Regency</option>{cityOptions.map((x)=><option key={x.id} value={x.name}>{x.name}</option>)}</select><select value={form.district} onChange={(e)=>setForm((p)=>({ ...p, district: e.target.value, postal_code: '' }))} className="w-full rounded-2xl border px-4 py-3" required disabled={!form.city}><option value="">Select District</option>{districtOptions.map((x)=><option key={x.id} value={x.name}>{x.name}</option>)}</select><select value={form.postal_code} onChange={(e)=>setForm((p)=>({ ...p, postal_code: e.target.value }))} className="w-full rounded-2xl border px-4 py-3" required disabled={!form.district}><option value="">Select Postal Code</option>{postalCodeOptions.map((x)=><option key={x.postalCode} value={x.postalCode}>{x.postalCode}</option>)}</select><input value={form.street_address} onChange={(e)=>setForm((p)=>({ ...p, street_address: e.target.value, pin_source:'default', pin_confirmed:false }))} placeholder="street address" className="w-full rounded-2xl border px-4 py-3" required/><input value={form.detail_address} onChange={(e)=>setForm((p)=>({ ...p, detail_address: e.target.value }))} placeholder="detail address" className="w-full rounded-2xl border px-4 py-3" />
  {!form.postal_code && <p className="text-sm text-gray-500">Pilih postal code dulu supaya saran street address muncul.</p>}
  {isSearching && <p className="text-sm text-gray-500">Searching address suggestions…</p>}
  {!isSearching && form.street_address.trim().length >= 3 && suggestions.length === 0 && !suggestionError && <p className="text-sm text-gray-500">No suggestions found.</p>}
  {suggestionError && <p className="text-sm text-aldesRed">{suggestionError}</p>}
  {suggestions.length>0 && <div className="rounded-xl border p-2">{suggestions.map((s)=><button type="button" key={s.id} className="block w-full text-left p-2 hover:bg-gray-50" onClick={()=>setForm((p)=>applySuggestionToForm(p, s))}><div className="font-semibold">{s.title}</div><div className="text-sm text-gray-500">{s.formattedAddress}</div></button>)}</div>}
  <div className="text-sm rounded-xl bg-gray-50 px-3 py-2">{[form.province, form.city, form.district, form.postal_code].filter(Boolean).join(', ')}</div>
  <div className="grid grid-cols-3 gap-2"><button type="button" onClick={async()=>{navigator.geolocation.getCurrentPosition(async (pos)=>{const latitude = Number(pos.coords.latitude.toFixed(8)); const longitude = Number(pos.coords.longitude.toFixed(8)); setForm((p)=>applyCurrentLocationToForm(p, latitude, longitude)); try { const r = await reverseGeocode(latitude, longitude); if (r.formattedAddress) setForm((p)=>({ ...p, street_address: p.street_address || r.formattedAddress })) } catch { /* noop */ } })}} className="rounded-xl border p-2">Use Current Location</button><select value={form.label ?? 'Home'} onChange={(e)=>setForm((p)=>({...p,label:e.target.value}))} className="rounded-xl border p-2"><option>Home</option><option>Work</option><option>Other</option></select><label className="flex items-center gap-2"><input type="checkbox" checked={!!form.is_default} onChange={(e)=>setForm((p)=>({...p,is_default:e.target.checked}))}/>Set as default</label></div><div className="text-sm">{hasValidPinValue ? `Pin: ${form.latitude}, ${form.longitude}` : 'No location pin selected'}</div>{hasStreetAddress ? <div ref={mapElRef} className="h-72 w-full overflow-hidden rounded-3xl border" /> : <div className="h-72 w-full rounded-3xl border bg-gray-50 text-sm text-gray-500 grid place-items-center">Isi street address dulu untuk menampilkan map.</div>}{!hasValidPinValue && <p className="text-sm text-aldesRed">Choose a location from the suggestions or set a map pin so the courier can find your address.</p>}{error && <p className="text-sm text-aldesRed">{error}</p>}<div className="flex justify-end gap-3"><button type="button" onClick={() => navigate('/profile')} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold"><X className="h-4 w-4" /> Cancel</button><button type="submit" disabled={!canSubmit || isSaving} className="inline-flex items-center gap-2 rounded-2xl bg-aldesRed px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> Save Address</button></div></form></section></main>
}

export default AddressBook
