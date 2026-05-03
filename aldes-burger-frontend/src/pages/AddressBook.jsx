import { LocateFixed, MapPin, Save, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { reverseGeocode, searchAddressSuggestions } from './addressbook/geocoding'

const defaultCenter = { lat: -6.2, lng: 106.816666 }
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const pinValidSources = ['suggestion', 'current_location', 'manual_map', 'manual_adjusted']

const loadLeaflet = async () => {
  if (window.L) return window.L
  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = LEAFLET_CSS; document.head.appendChild(css)
  }
  await new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${LEAFLET_JS}"]`)
    if (existingScript) { existingScript.addEventListener('load', resolve, { once: true }); existingScript.addEventListener('error', reject, { once: true }); if (window.L) resolve(); return }
    const script = document.createElement('script'); script.src = LEAFLET_JS; script.async = true; script.onload = resolve; script.onerror = reject; document.body.appendChild(script)
  })
  return window.L
}

function AddressBook() {
  const navigate = useNavigate(); const [searchParams] = useSearchParams(); const addressId = searchParams.get('addressId'); const isEditMode = useMemo(() => Boolean(addressId), [addressId])
  const [form, setForm] = useState({ recipient_name: '', phone_number: '', province: '', city: '', district: '', postal_code: '', street_address: '', detail_address: '', label: 'Home', is_default: false, latitude: null, longitude: null, pin_source: 'default', pin_confirmed: false })
  const [suggestions, setSuggestions] = useState([]); const [error, setError] = useState(''); const [isSaving, setIsSaving] = useState(false)
  const mapRef = useRef(null); const mapElRef = useRef(null); const markerRef = useRef(null)

  const hasValidPin = form.latitude !== null && form.longitude !== null && form.pin_confirmed && pinValidSources.includes(form.pin_source)
  const canSubmit = hasValidPin && form.recipient_name && form.phone_number && form.province && form.city && form.district && form.postal_code && form.street_address

  useEffect(() => { if (!isEditMode) return; api.get('/addresses').then(({ data }) => { const item = data.find((it) => String(it.id) === String(addressId)); if (!item) return setError('Address not found.'); setForm((prev) => ({ ...prev, ...item, latitude: item.latitude ?? null, longitude: item.longitude ?? null, pin_source: item.pin_source ?? 'default', pin_confirmed: !!item.pin_confirmed })) }).catch(() => setError('Unable to load selected address.')) }, [addressId, isEditMode])

  useEffect(() => { const t = setTimeout(async () => { const result = await searchAddressSuggestions(form.street_address, form); setSuggestions(result) }, 300); return () => clearTimeout(t) }, [form.street_address, form.province, form.city, form.district])

  useEffect(() => { let mounted = true; loadLeaflet().then((L) => { if (!mounted || mapRef.current || !mapElRef.current) return; mapRef.current = L.map(mapElRef.current).setView([form.latitude ?? defaultCenter.lat, form.longitude ?? defaultCenter.lng], 13); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(mapRef.current); markerRef.current = L.marker([form.latitude ?? defaultCenter.lat, form.longitude ?? defaultCenter.lng]).addTo(mapRef.current); mapRef.current.on('click', (event) => { setForm((prev) => ({ ...prev, latitude: Number(event.latlng.lat.toFixed(8)), longitude: Number(event.latlng.lng.toFixed(8)), pin_source: 'manual_adjusted', pin_confirmed: true })) }) }).catch(() => setError('Unable to load map.')); return () => { mounted = false; if (mapRef.current) mapRef.current.remove() } }, [])

  useEffect(() => { if (!mapRef.current || !markerRef.current || form.latitude === null || form.longitude === null) return; markerRef.current.setLatLng([form.latitude, form.longitude]); mapRef.current.panTo([form.latitude, form.longitude]) }, [form.latitude, form.longitude])

  const submit = async (e) => { e.preventDefault(); setError(''); if (!hasValidPin) return setError('Choose a location from the suggestions or set a map pin so the courier can find your address.'); setIsSaving(true); try { if (isEditMode) await api.put(`/addresses/${addressId}`, form); else await api.post('/addresses', form); navigate('/profile', { state: { refreshAddressesAt: Date.now() } }) } catch (err) { setError(err?.response?.data?.message ?? 'Unable to save address.') } finally { setIsSaving(false) } }

  return <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-8"><section className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-md sm:p-8"><div className="mb-6 flex items-start justify-between"><h1 className="text-2xl font-black">{isEditMode ? 'Edit Delivery Address' : 'Add Delivery Address'}</h1><MapPin className="h-6 w-6" /></div><form onSubmit={submit} className="space-y-3">{['recipient_name','phone_number','province','city','district','postal_code','street_address','detail_address'].map((f)=><input key={f} value={form[f] ?? ''} onChange={(e)=>setForm((p)=>({ ...p, [f]: e.target.value, ...(f==='street_address'?{pin_source:'default',pin_confirmed:false}:{} )}))} placeholder={f.replaceAll('_',' ')} className="w-full rounded-2xl border px-4 py-3" required={f !== 'detail_address'} />)}{suggestions.length>0 && <div className="rounded-xl border p-2">{suggestions.map((s)=><button type="button" key={s.id} className="block w-full text-left p-2 hover:bg-gray-50" onClick={()=>setForm((p)=>({ ...p, street_address: s.formattedAddress, latitude: s.latitude, longitude: s.longitude, pin_source:'suggestion', pin_confirmed:true }))}>{s.formattedAddress}</button>)}</div>}<div className="grid grid-cols-3 gap-2"><button type="button" onClick={async()=>{navigator.geolocation.getCurrentPosition((pos)=>setForm((p)=>({ ...p, latitude: Number(pos.coords.latitude.toFixed(8)), longitude: Number(pos.coords.longitude.toFixed(8)), pin_source: 'current_location', pin_confirmed: true })))}} className="rounded-xl border p-2">Use Current Location</button><select value={form.label ?? 'Home'} onChange={(e)=>setForm((p)=>({...p,label:e.target.value}))} className="rounded-xl border p-2"><option>Home</option><option>Work</option><option>Other</option></select><label className="flex items-center gap-2"><input type="checkbox" checked={!!form.is_default} onChange={(e)=>setForm((p)=>({...p,is_default:e.target.checked}))}/>Set as default</label></div><div className="text-sm">{hasValidPin ? `Pin: ${form.latitude}, ${form.longitude}` : 'No location pin selected'}</div><div ref={mapElRef} className="h-72 w-full overflow-hidden rounded-3xl border" />{!hasValidPin && <p className="text-sm text-aldesRed">Choose a location from the suggestions or set a map pin so the courier can find your address.</p>}{error && <p className="text-sm text-aldesRed">{error}</p>}<div className="flex justify-end gap-3"><button type="button" onClick={() => navigate('/profile')} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold"><X className="h-4 w-4" /> Cancel</button><button type="submit" disabled={!canSubmit || isSaving} className="inline-flex items-center gap-2 rounded-2xl bg-aldesRed px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> Save Address</button></div></form></section></main>
}

export default AddressBook
