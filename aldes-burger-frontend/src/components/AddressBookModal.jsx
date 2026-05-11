import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Loader2, X, ChevronDown, Check } from 'lucide-react'
import api from '../lib/api'
import { applySuggestionToForm, canSubmitAddress } from '../pages/addressbook/formLogic'
import { geocodeAddress, searchAddressSuggestions, reverseGeocode } from '../pages/addressbook/geocoding'
import { getCities, getDistricts, getPostalCodes, getProvinces } from '../pages/addressbook/regions'

const defaultCenter = { lat: -6.2, lng: 106.816666 }
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

const loadLeaflet = async () => {
  if (window.L) return window.L
  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = LEAFLET_CSS
    document.head.appendChild(css)
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
  return window.L
}

export default function AddressBookModal({ open, onClose, onSaved, initialAddress, userPhone }) {
  const isEdit = Boolean(initialAddress?.id)
  const [form, setForm] = useState({ recipient_name: '', phone_number: '', province: '', city: '', district: '', postal_code: '', street_address: '', detail_address: '', label: 'Home', is_default: false, is_pickup: false, is_return: false, latitude: null, longitude: null, pin_source: 'default', pin_confirmed: false })
  const [isSaving, setIsSaving] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showPhoneReco, setShowPhoneReco] = useState(false)
  const [showMapLayer, setShowMapLayer] = useState(false)
  
  // Region Selector State
  const [showRegionSelector, setShowRegionSelector] = useState(false)
  const [activeRegionTab, setActiveRegionTab] = useState('province')
  const regionSelectorRef = useRef(null)

  const [error, setError] = useState('')
  const previewMapElRef = useRef(null)
  const previewMapRef = useRef(null)
  const previewMarkerRef = useRef(null)
  const mapElRef = useRef(null)
  const mapRef = useRef(null)

  const hasStreet = Boolean(form.street_address && form.street_address.trim().length > 0)
  const isRegionFilled = Boolean(form.province && form.city && form.district && form.postal_code)

  const fullAddressQuery = useMemo(() => {
    return [form.street_address, form.district, form.city, form.province, form.postal_code, 'Indonesia'].filter(Boolean).join(', ')
  }, [form.street_address, form.district, form.city, form.province, form.postal_code])

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(initialAddress ? { ...form, ...initialAddress } : { ...form, phone_number: userPhone || '' })
    setShowMapLayer(false)
    setShowRegionSelector(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialAddress, userPhone])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const [provinceOptions, setProvinceOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [postalCodeOptions, setPostalCodeOptions] = useState([])

  useEffect(() => {
    getProvinces().then(setProvinceOptions).catch(() => setProvinceOptions([]))
  }, [])

  useEffect(() => {
    if (!form.province || provinceOptions.length === 0) {
      setCityOptions([])
      return
    }
    const cleanProv = form.province.trim().toUpperCase()
    const province = provinceOptions.find(p => p.name === form.province || p.name.includes(cleanProv) || cleanProv.includes(p.name))
    
    if (province) {
      if (form.province !== province.name) setForm(prev => ({ ...prev, province: province.name }))
      getCities(province.id).then(setCityOptions).catch(() => setCityOptions([]))
    } else {
      setCityOptions([])
    }
  }, [form.province, provinceOptions])

  useEffect(() => {
    if (!form.city || cityOptions.length === 0) {
      setDistrictOptions([])
      return
    }
    const cleanCity = form.city.replace(/^(KOTA|KABUPATEN|KAB\.|KAB|KOTA KAB)\s+/i, '').trim().toUpperCase()
    const city = cityOptions.find(c => c.name === form.city || c.name.replace(/^(KOTA|KABUPATEN)\s+/i, '').trim() === cleanCity)
    
    if (city) {
      if (form.city !== city.name) setForm(prev => ({ ...prev, city: city.name }))
      getDistricts(city.id).then(setDistrictOptions).catch(() => setDistrictOptions([]))
    } else {
      setDistrictOptions([])
    }
  }, [form.city, cityOptions])

  useEffect(() => {
    if (!form.district || districtOptions.length === 0) {
      setPostalCodeOptions([])
      return
    }
    const cleanDist = form.district.replace(/^(KECAMATAN|KEC\.|KEC)\s+/i, '').trim().toUpperCase()
    const district = districtOptions.find(d => d.name === form.district || d.name.replace(/^(KECAMATAN)\s+/i, '').trim() === cleanDist)
    
    if (district) {
      if (form.district !== district.name) setForm(prev => ({ ...prev, district: district.name }))
      getPostalCodes(district.id, { province: form.province, city: form.city, district: form.district })
        .then((options) => {
          setPostalCodeOptions(options)
          if (options.length === 1) {
            setForm(prev => {
              if (!prev.postal_code && (prev.pin_source === 'current_location' || prev.pin_source === 'suggestion')) {
                return { ...prev, postal_code: options[0].postalCode }
              }
              return prev
            })
          }
        }).catch(() => setPostalCodeOptions([]))
    } else {
      setPostalCodeOptions([])
    }
  }, [form.district, districtOptions, form.province, form.city])

  // Close region selector on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (regionSelectorRef.current && !regionSelectorRef.current.contains(event.target)) {
        setShowRegionSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const q = form.street_address?.trim()
    // Only fetch suggestions if user is actively typing (pin_source === 'default')
    if (!q || q.length < 3 || form.pin_source !== 'default') return setSuggestions([])
    
    searchAddressSuggestions(q, { province: form.province, city: form.city, district: form.district, postalCode: form.postal_code })
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
  }, [form.street_address, form.province, form.city, form.district, form.postal_code, form.pin_source])

  useEffect(() => {
    if (!fullAddressQuery || fullAddressQuery.length < 8) return
    if (form.pin_source === 'manual_map' || form.pin_source === 'manual_adjusted' || form.pin_source === 'current_location') return

    let cancelled = false
    geocodeAddress(fullAddressQuery)
      .then((result) => {
        if (!result || cancelled) return
        setForm((prev) => {
          if (prev.pin_source === 'manual_map' || prev.pin_source === 'manual_adjusted' || prev.pin_source === 'current_location') return prev
          return {
            ...prev,
            latitude: result.latitude,
            longitude: result.longitude,
            pin_source: prev.pin_source === 'suggestion' ? 'suggestion' : 'default',
            pin_confirmed: Boolean(result.latitude && result.longitude),
          }
        })
      })
      .catch(() => { })
    return () => { cancelled = true }
  }, [fullAddressQuery, form.pin_source])

  const updatePin = (latitude, longitude, source = 'manual_adjusted') => {
    setForm((prev) => ({
      ...prev,
      latitude,
      longitude,
      pin_source: source,
      pin_confirmed: true,
    }))
  }

  // Cleanup maps when unmounting
  useEffect(() => {
    return () => {
      if (previewMapRef.current) { previewMapRef.current.remove(); previewMapRef.current = null; previewMarkerRef.current = null; }
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    }
  }, [])

  // Initialize Preview Map - recreate completely when hasStreet changes
  useEffect(() => {
    if (showMapLayer || !previewMapElRef.current || !hasStreet) return
    let mounted = true
    let map = null
    loadLeaflet().then((L) => {
      if (!mounted || !previewMapElRef.current) return
      const lat = form.latitude ?? defaultCenter.lat
      const lng = form.longitude ?? defaultCenter.lng

      map = L.map(previewMapElRef.current, {
        zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, keyboard: false
      }).setView([lat, lng], 15)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      const marker = L.marker([lat, lng]).addTo(map)
      
      previewMapRef.current = map
      previewMarkerRef.current = marker
      
      setTimeout(() => { if (map) map.invalidateSize() }, 100)
    }).catch(() => {})
    
    return () => { 
      mounted = false 
      if (map) {
        map.remove()
        previewMapRef.current = null
        previewMarkerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapLayer, hasStreet]) 

  // Initialize Editor Map
  useEffect(() => {
    if (!showMapLayer || !mapElRef.current) return
    let mounted = true
    let map = null
    loadLeaflet().then((L) => {
      if (!mounted || !mapElRef.current) return
      const lat = form.latitude ?? defaultCenter.lat
      const lng = form.longitude ?? defaultCenter.lng

      map = L.map(mapElRef.current, { zoomControl: false }).setView([lat, lng], 16)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

      // When map moves, update the form state (fixed pin in center)
      map.on('moveend', () => {
        const center = map.getCenter()
        updatePin(Number(center.lat.toFixed(8)), Number(center.lng.toFixed(8)), 'manual_map')
      })
      
      mapRef.current = map
      setTimeout(() => { if (map) map.invalidateSize() }, 150)
    }).catch(() => {})
    
    return () => { 
      mounted = false
      if (map) {
         map.remove()
         mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapLayer])

  // Update map centers when form.latitude/longitude changes
  useEffect(() => {
    const lat = form.latitude
    const lng = form.longitude
    if (lat === null || lng === null) return

    if (!showMapLayer && previewMapRef.current && previewMarkerRef.current) {
      previewMapRef.current.setView([lat, lng], previewMapRef.current.getZoom() || 15)
      previewMarkerRef.current.setLatLng([lat, lng])
    }
  }, [form.latitude, form.longitude, showMapLayer])

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      try {
        const reverseData = await reverseGeocode(lat, lng)
        const updates = {
          latitude: lat,
          longitude: lng,
          pin_source: 'current_location',
          pin_confirmed: true
        }
        
        if (reverseData.province) updates.province = reverseData.province.toUpperCase()
        
        let city = reverseData.city || ''
        if (city) {
          city = city.replace(/^(KOTA|KABUPATEN|KAB\.|KAB|KOTA KAB)\s+/i, '').trim()
          updates.city = city.toUpperCase()
        }
        
        updates.district = reverseData.district ? reverseData.district.toUpperCase() : ''
        updates.postal_code = reverseData.postalCode || ''
        updates.street_address = reverseData.formattedAddress || ''
        
        setForm(prev => ({ ...prev, ...updates }))
      } catch (err) {
        updatePin(lat, lng, 'current_location')
      }
    }, () => {
      setError('Unable to retrieve your location. Please check browser permissions.')
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmitAddress(form)) return setError('Lengkapi data alamat dulu.')
    setIsSaving(true)
    try {
      if (isEdit) await api.put(`/addresses/${initialAddress.id}`, form)
      else await api.post('/addresses', form)
      onSaved()
      onClose()
    } catch {
      setError('Gagal menyimpan alamat.')
    } finally { setIsSaving(false) }
  }

  if (!open) return null
  
  if (showMapLayer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 sm:p-6">
        <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded bg-white overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 border-b border-gray-200 p-4 sm:p-5">
            <button type='button' onClick={() => setShowMapLayer(false)} className='text-gray-500 hover:text-gray-800 transition-colors'><ArrowLeft className='h-6 w-6' /></button>
            <div>
              <h3 className='text-lg sm:text-xl font-medium text-gray-800'>Edit Location</h3>
              <p className='text-xs sm:text-sm text-gray-500 line-clamp-1 mt-0.5'>{fullAddressQuery}</p>
            </div>
          </div>
          
          <div className="relative flex-1 bg-gray-100">
             <div ref={mapElRef} className="h-full w-full" />
             
             {/* Center fixed marker */}
             <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="mb-2 whitespace-nowrap rounded bg-aldesRed px-3 py-2 text-center text-white shadow-md relative">
                   <p className="text-sm font-bold">Your address is here</p>
                   <p className="text-xs opacity-90 mt-0.5">Please check your map location is correct</p>
                   <div className="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-aldesRed"></div>
                </div>
                <svg viewBox="0 0 24 24" className="h-12 w-12 drop-shadow-md -translate-y-1/2 text-aldesRed" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
             </div>
             
             <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2 bg-white rounded shadow-md overflow-hidden">
                <button type="button" className="p-2 hover:bg-gray-100 border-b border-gray-100 transition-colors" onClick={() => mapRef.current?.zoomIn()}><span className="text-xl leading-none block font-bold text-gray-600">+</span></button>
                <button type="button" className="p-2 hover:bg-gray-100 transition-colors" onClick={() => mapRef.current?.zoomOut()}><span className="text-xl leading-none block font-bold text-gray-600">−</span></button>
             </div>
             
             <div className="absolute right-4 bottom-4 z-[1000] flex flex-col gap-2">
                <button type="button" className="rounded-full bg-white p-3 shadow-md hover:bg-gray-50 text-aldesRed transition-colors" onClick={handleCurrentLocation} title="Use Current Location">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><circle cx="12" cy="12" r="6"/></svg>
                </button>
                <button type="button" className="rounded-full bg-white p-3 shadow-md hover:bg-gray-50 text-gray-600 transition-colors" onClick={() => mapRef.current?.panTo([form.latitude ?? defaultCenter.lat, form.longitude ?? defaultCenter.lng])} title="Go to pin">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </button>
             </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-gray-200 bg-white p-4 sm:p-5">
            <button type="button" onClick={() => setShowMapLayer(false)} className="min-w-[120px] rounded border border-gray-300 bg-white py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors uppercase text-sm">Cancel</button>
            <button type="button" onClick={() => setShowMapLayer(false)} className="min-w-[120px] rounded bg-aldesRed py-2 font-medium text-white hover:bg-red-800 transition-colors uppercase text-sm">Confirm</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4 sm:p-6 flex items-start justify-center">
      <div className="mt-8 w-full max-w-2xl rounded shadow-lg bg-white">
        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-5 mt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl sm:text-2xl font-normal text-gray-800">{isEdit ? 'Edit Address' : 'New Address'}</h3>
              <button type='button' onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="h-6 w-6" /></button>
            </div>
            
            <div className="relative z-[70] grid grid-cols-1 gap-5 sm:grid-cols-2 pt-1">
              <div className="relative">
                <input 
                  id="recipient_name"
                  className="peer w-full rounded border border-gray-300 bg-transparent px-3 py-3 text-sm text-gray-800 placeholder-transparent focus:border-aldesRed focus:outline-none focus:ring-1 focus:ring-aldesRed transition-shadow" 
                  placeholder="Full Name" 
                  value={form.recipient_name || ''} 
                  onChange={e => setForm(p => ({ ...p, recipient_name: e.target.value }))} 
                />
                <label 
                  htmlFor="recipient_name" 
                  className="pointer-events-none absolute left-2.5 -top-2 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-aldesRed"
                >
                  Full Name
                </label>
              </div>

              <div className="relative">
                <input 
                  id="phone_number"
                  className="peer w-full rounded border border-gray-300 bg-transparent px-3 py-3 text-sm text-gray-800 placeholder-transparent focus:border-aldesRed focus:outline-none focus:ring-1 focus:ring-aldesRed transition-shadow" 
                  placeholder="Phone Number" 
                  value={form.phone_number || ''} 
                  onFocus={() => setShowPhoneReco(true)} 
                  onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} 
                />
                <label 
                  htmlFor="phone_number" 
                  className="pointer-events-none absolute left-2.5 -top-2 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-aldesRed"
                >
                  Phone Number
                </label>
                {showPhoneReco && userPhone && (
                  <div className="absolute z-10 mt-1 w-full rounded border border-gray-200 bg-white p-2 text-sm shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">{userPhone}</span>
                      <button type="button" className="text-aldesRed font-medium" onClick={() => { setForm(p => ({ ...p, phone_number: userPhone })); setShowPhoneReco(false) }}>Use</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative z-[60]" ref={regionSelectorRef}>
              <div 
                className={`w-full flex items-center justify-between rounded border bg-transparent px-3 py-3 text-sm cursor-pointer transition-shadow ${showRegionSelector ? 'border-aldesRed ring-1 ring-aldesRed' : 'border-gray-300'}`}
                onClick={() => {
                  setShowRegionSelector(!showRegionSelector)
                  if (!showRegionSelector) {
                    if (!form.province) setActiveRegionTab('province')
                    else if (!form.city) setActiveRegionTab('city')
                    else if (!form.district) setActiveRegionTab('district')
                    else setActiveRegionTab('postal_code')
                  }
                }}
              >
                <span className={form.province ? 'text-gray-800' : 'text-gray-400 opacity-0'}>
                  {[form.province, form.city, form.district, form.postal_code].filter(Boolean).join(', ') || 'Placeholder'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showRegionSelector ? 'rotate-180' : ''}`} />
              </div>
              <label 
                className={`pointer-events-none absolute left-2.5 bg-white px-1 transition-all ${
                  form.province || showRegionSelector 
                    ? '-top-2 text-xs text-gray-500 ' + (showRegionSelector ? 'text-aldesRed' : '') 
                    : 'top-3 text-sm text-gray-400'
                }`}
              >
                Province, City, District, Postal Code
              </label>

              {showRegionSelector && (
                <div className="absolute z-[2000] mt-1 w-full rounded border border-gray-200 bg-white shadow-xl overflow-hidden">
                  <div className="flex border-b border-gray-200 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <button type="button" className={`px-4 py-3 font-medium transition-colors ${activeRegionTab === 'province' ? 'border-b-2 border-aldesRed text-aldesRed' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveRegionTab('province')}>
                      {form.province || 'Province'}
                    </button>
                    {(form.province || activeRegionTab === 'city') && (
                      <button type="button" className={`px-4 py-3 font-medium transition-colors ${activeRegionTab === 'city' ? 'border-b-2 border-aldesRed text-aldesRed' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveRegionTab('city')}>
                        {form.city || 'City'}
                      </button>
                    )}
                    {(form.city || activeRegionTab === 'district') && (
                      <button type="button" className={`px-4 py-3 font-medium transition-colors ${activeRegionTab === 'district' ? 'border-b-2 border-aldesRed text-aldesRed' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveRegionTab('district')}>
                        {form.district || 'District'}
                      </button>
                    )}
                    {(form.district || activeRegionTab === 'postal_code') && (
                      <button type="button" className={`px-4 py-3 font-medium transition-colors ${activeRegionTab === 'postal_code' ? 'border-b-2 border-aldesRed text-aldesRed' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveRegionTab('postal_code')}>
                        {form.postal_code || 'Postal Code'}
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {activeRegionTab === 'province' && provinceOptions.map(p => (
                      <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700" onClick={() => { setForm(prev => ({ ...prev, province: p.name, city: '', district: '', postal_code: '' })); setActiveRegionTab('city') }}>
                        <span className={form.province === p.name ? 'text-aldesRed font-medium' : ''}>{p.name}</span>
                        {form.province === p.name && <Check className="h-4 w-4 text-aldesRed" />}
                      </div>
                    ))}
                    
                    {activeRegionTab === 'city' && cityOptions.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700" onClick={() => { setForm(prev => ({ ...prev, city: c.name, district: '', postal_code: '' })); setActiveRegionTab('district') }}>
                        <span className={form.city === c.name ? 'text-aldesRed font-medium' : ''}>{c.name}</span>
                        {form.city === c.name && <Check className="h-4 w-4 text-aldesRed" />}
                      </div>
                    ))}

                    {activeRegionTab === 'district' && districtOptions.map(d => (
                      <div key={d.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700" onClick={() => { setForm(prev => ({ ...prev, district: d.name, postal_code: '' })); setActiveRegionTab('postal_code') }}>
                        <span className={form.district === d.name ? 'text-aldesRed font-medium' : ''}>{d.name}</span>
                        {form.district === d.name && <Check className="h-4 w-4 text-aldesRed" />}
                      </div>
                    ))}

                    {activeRegionTab === 'postal_code' && postalCodeOptions.map(pc => (
                      <div key={pc.postalCode} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700" onClick={() => { setForm(prev => ({ ...prev, postal_code: pc.postalCode })); setShowRegionSelector(false) }}>
                        <span className={form.postal_code === pc.postalCode ? 'text-aldesRed font-medium' : ''}>{pc.postalCode}</span>
                        {form.postal_code === pc.postalCode && <Check className="h-4 w-4 text-aldesRed" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative z-[50]">
              <textarea 
                id="street_address"
                disabled={!isRegionFilled}
                className={`peer w-full min-h-[60px] rounded border bg-transparent px-3 py-3 text-sm text-gray-800 placeholder-transparent focus:outline-none transition-shadow resize-y ${!isRegionFilled ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60 text-gray-400' : 'border-gray-300 focus:border-aldesRed focus:ring-1 focus:ring-aldesRed'}`} 
                placeholder="Street Name, Building, House No." 
                value={form.street_address || ''} 
                onChange={e => setForm(p => ({ ...p, street_address: e.target.value, pin_source: 'default', pin_confirmed: false }))} 
              />
              <label 
                htmlFor="street_address" 
                className={`pointer-events-none absolute left-2.5 -top-2 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs ${!isRegionFilled ? 'text-gray-400 peer-placeholder-shown:text-gray-400' : 'text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-aldesRed'}`}
              >
                {isRegionFilled ? 'Street Name, Building, House No.' : 'Please select Region first'}
              </label>

              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full max-h-48 overflow-auto rounded border border-gray-200 bg-white shadow-lg mt-1">
                  {suggestions.slice(0, 5).map(s => (
                    <button type="button" key={s.id} className="block w-full border-b border-gray-100 px-4 py-2.5 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-gray-700" onClick={() => {
                        setForm(p => applySuggestionToForm(p, s))
                        setSuggestions([])
                    }}>
                      {s.formattedAddress || s.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={`w-full rounded p-3 pb-4 border relative z-40 ${hasStreet ? 'bg-aldesCream/40 border-aldesYellow/50' : 'bg-gray-50 border-gray-200'}`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${hasStreet ? 'bg-aldesYellow' : 'bg-gray-300'}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-medium text-sm ${hasStreet ? 'text-aldesYellow' : 'text-gray-500'}`}>Place an accurate pin</h4>
                    <p className="text-xs mt-0.5 leading-relaxed text-gray-500">We will deliver to your map location.</p>
                  </div>
                </div>
                <button type="button" onClick={handleCurrentLocation} className="flex-shrink-0 flex items-center gap-1.5 rounded bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><circle cx="12" cy="12" r="6"/></svg>
                  Current Location
                </button>
              </div>
              <div className={`relative h-36 w-full overflow-hidden rounded border border-gray-200 bg-gray-100 ${hasStreet ? 'cursor-pointer group' : ''}`} onClick={() => { if(hasStreet) setShowMapLayer(true) }}>
                {hasStreet ? (
                  <div key="map-active" ref={previewMapElRef} className="h-full w-full pointer-events-none" />
                ) : (
                  <div key="map-inactive" className="h-full w-full pointer-events-none" />
                )}
                
                {!hasStreet && (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#f4f5f6]"
                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="150" viewBox="0 0 400 150"><path d="M-50,50 Q100,20 200,80 T450,40" fill="none" stroke="%23ffffff" stroke-width="8"/><path d="M50,-20 Q80,100 150,180" fill="none" stroke="%23ffffff" stroke-width="6"/><path d="M250,-20 Q220,100 350,180" fill="none" stroke="%23ffffff" stroke-width="6"/><path d="M-20,120 Q150,150 250,90 T450,100" fill="none" stroke="%23ffffff" stroke-width="5"/></svg>')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                     <button type="button" disabled className="relative z-10 flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium text-gray-400 shadow border border-gray-100">
                       <span className="text-lg leading-none font-light">+</span> Add Location
                     </button>
                  </div>
                )}
                
                {hasStreet && (
                  <button type="button" className="absolute right-2 top-2 z-[1000] rounded bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow border border-gray-200 hover:bg-gray-50 transition-colors">
                    View Map
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea 
                id="detail_address"
                className="peer w-full min-h-[50px] rounded border border-gray-300 bg-transparent px-3 py-3 text-sm text-gray-800 placeholder-transparent focus:border-aldesRed focus:outline-none focus:ring-1 focus:ring-aldesRed transition-shadow resize-y" 
                placeholder="Other Details (e.g. Block / Unit No., Landmarks)" 
                value={form.detail_address || ''} 
                onChange={e => setForm(p => ({ ...p, detail_address: e.target.value }))} 
              />
              <label 
                htmlFor="detail_address" 
                className="pointer-events-none absolute left-2.5 -top-2 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-aldesRed"
              >
                Other Details (e.g. Block / Unit No., Landmarks)
              </label>
            </div>
            
            <div className="pt-2">
              <span className="block text-sm text-gray-600 mb-2">Label As:</span>
              <div className="flex gap-3">
                <button type="button" onClick={() => setForm(p => ({ ...p, label: 'Home' }))} className={`rounded border px-4 py-1.5 text-sm transition-colors ${form.label === 'Home' ? 'border-aldesRed text-aldesRed bg-aldesCream' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>Home</button>
                <button type="button" onClick={() => setForm(p => ({ ...p, label: 'Work' }))} className={`rounded border px-4 py-1.5 text-sm transition-colors ${form.label === 'Work' ? 'border-aldesRed text-aldesRed bg-aldesCream' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>Work</button>
                <button type="button" onClick={() => setForm(p => ({ ...p, label: 'Other' }))} className={`rounded border px-4 py-1.5 text-sm transition-colors ${form.label === 'Other' ? 'border-aldesRed text-aldesRed bg-aldesCream' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>Other</button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 sm:gap-6 text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-aldesRed focus:ring-aldesRed cursor-pointer" checked={!!form.is_default} onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))} /> <span className="group-hover:text-gray-800 transition-colors">Set as Default Address</span></label>
            </div>
            
            {error && <p className="text-sm text-aldesRed font-medium">{error}</p>}
            
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="min-w-[120px] rounded py-2 font-medium text-gray-600 hover:text-gray-800 transition-colors text-sm uppercase border border-white">Cancel</button>
              <button disabled={isSaving} className="min-w-[140px] rounded bg-aldesRed py-2 font-medium text-white shadow-sm hover:bg-red-800 transition-colors text-sm flex justify-center items-center uppercase">
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
