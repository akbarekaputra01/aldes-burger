import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Loader2, X, ChevronDown, Check, MapPin, Navigation } from 'lucide-react'
import api from '../lib/api'
import { applySuggestionToForm, canSubmitAddress } from '../pages/addressbook/formLogic'
import { geocodeAddress, searchAddressSuggestions, reverseGeocode } from '../pages/addressbook/geocoding'
import { getCities, getDistricts, getPostalCodes, getProvinces } from '../pages/addressbook/regions'
import { useTranslation } from '../context/LanguageContext'

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
  const { t } = useTranslation()
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
  }, [open, initialAddress, userPhone])

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
    const cachedProvinces = sessionStorage.getItem('aldes_province_options')
    if (cachedProvinces) {
      setProvinceOptions(JSON.parse(cachedProvinces))
    }
    getProvinces().then(data => {
      setProvinceOptions(data)
      sessionStorage.setItem('aldes_province_options', JSON.stringify(data))
    }).catch(() => {
      if(!cachedProvinces) setProvinceOptions([])
    })
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
      
      const cacheKey = `aldes_cities_${province.id}`
      const cachedCities = sessionStorage.getItem(cacheKey)
      if (cachedCities) setCityOptions(JSON.parse(cachedCities))

      getCities(province.id).then(data => {
        setCityOptions(data)
        sessionStorage.setItem(cacheKey, JSON.stringify(data))
      }).catch(() => {
        if(!cachedCities) setCityOptions([])
      })
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
      
      const cacheKey = `aldes_districts_${city.id}`
      const cachedDistricts = sessionStorage.getItem(cacheKey)
      if (cachedDistricts) setDistrictOptions(JSON.parse(cachedDistricts))

      getDistricts(city.id).then(data => {
        setDistrictOptions(data)
        sessionStorage.setItem(cacheKey, JSON.stringify(data))
      }).catch(() => {
        if(!cachedDistricts) setDistrictOptions([])
      })
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

  useEffect(() => {
    return () => {
      if (previewMapRef.current) { previewMapRef.current.remove(); previewMapRef.current = null; previewMarkerRef.current = null; }
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    }
  }, [])

  useEffect(() => {
    if (showMapLayer || !previewMapElRef.current || !hasStreet) return
    let mounted = true
    let map = null
    
    loadLeaflet().then((L) => {
      if (!mounted || !previewMapElRef.current) return
      
      // BERSIHKAN LEAFLET ID SEBELUM MEMBUAT MAP BARU (Mencegah Reuse Error)
      if (previewMapElRef.current) {
        previewMapElRef.current._leaflet_id = null;
      }

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
  }, [showMapLayer, hasStreet])

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
  }, [showMapLayer])

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
      setError(t('addressForm.geolocationUnsupported'))
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
      setError(t('addressForm.retrieveLocationFailed'))
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmitAddress(form)) return setError(t('addressForm.completeAllFields'))
    setIsSaving(true)
    try {
      if (isEdit) await api.put(`/addresses/${initialAddress.id}`, form)
      else await api.post('/addresses', form)
      
      sessionStorage.removeItem('aldes_addresses_cache')
      onSaved()
      onClose()
    } catch {
      setError(t('addressForm.saveAddressFailed'))
    } finally { setIsSaving(false) }
  }

  const inputClassName = "w-full rounded-xl border-4 border-black bg-white px-4 py-3.5 text-sm font-bold text-black outline-none transition-transform focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 placeholder:text-gray-400 placeholder:font-bold"
  const labelClassName = "pointer-events-none absolute left-3 -top-3 bg-white px-2 text-xs font-black uppercase text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"

  if (!open) return null

  if (showMapLayer) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-sm" style={{ zIndex: 99999 }}>
        <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-3xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="flex items-center gap-3 border-b-4 border-black bg-aldesYellow p-4 sm:p-5">
            <button type='button' onClick={() => setShowMapLayer(false)} className='rounded-xl border-2 border-black bg-white p-2 hover:bg-aldesCream transition-transform active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
              <ArrowLeft className='h-6 w-6 stroke-[3] text-black' />
            </button>
            <div>
              <h3 className='text-xl sm:text-2xl font-black uppercase text-black'>{t('addressForm.editPin')}</h3>
              <p className='text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 mt-0.5'>{fullAddressQuery}</p>
            </div>
          </div>
          
          <div className="relative flex-1 bg-gray-100 border-b-4 border-black"> 
             <div ref={mapElRef} className="h-full w-full" />
             
             <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                 <div className="mb-2 whitespace-nowrap rounded-xl border-4 border-black bg-aldesRed px-4 py-2.5 text-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative"> 
                    <p className="text-sm font-black uppercase">{t('addressForm.yourPinIsHere')}</p>
                    <p className="text-[10px] font-bold opacity-90 mt-0.5">{t('addressForm.dragMap')}</p>
                    <div className="absolute -bottom-[9px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-black"></div>
                    <div className="absolute -bottom-[5px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-aldesRed"></div>
                 </div>
                 <svg viewBox="0 0 24 24" className="h-12 w-12 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-1/2 text-aldesRed" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                   <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                 </svg>
             </div>
             
             <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
                 <button type="button" className="rounded-xl border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none hover:bg-aldesCream transition-all" onClick={() => mapRef.current?.zoomIn()}><span className="text-xl leading-none block font-black text-black">+</span></button>
                 <button type="button" className="rounded-xl border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none hover:bg-aldesCream transition-all" onClick={() => mapRef.current?.zoomOut()}><span className="text-xl leading-none block font-black text-black">-</span></button>
             </div>
             
             <div className="absolute right-4 bottom-4 z-[1000] flex flex-col gap-3">
                 <button type="button" className="rounded-2xl border-4 border-black bg-aldesYellow p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-y-1 active:shadow-none transition-all text-black" onClick={handleCurrentLocation} title={t('addressForm.useCurrentLocation')}>
                   <Navigation className="h-6 w-6 stroke-[3]" />
                 </button>
                 <button type="button" className="rounded-2xl border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 active:translate-y-1 active:shadow-none transition-all text-aldesRed" onClick={() => mapRef.current?.panTo([form.latitude ?? defaultCenter.lat, form.longitude ?? defaultCenter.lng])} title="Go to pin"> 
                    <MapPin className="h-6 w-6 stroke-[3]" />
                 </button>
             </div>
          </div>
          <div className="flex justify-end gap-4 bg-aldesCream p-4 sm:p-5">
            <button type="button" onClick={() => setShowMapLayer(false)} className="min-w-[120px] rounded-2xl border-4 border-black bg-white py-3 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 active:translate-y-1 active:shadow-none transition-all uppercase">{t('addressForm.cancel')}</button>
            <button type="button" onClick={() => setShowMapLayer(false)} className="min-w-[120px] rounded-2xl border-4 border-black bg-aldesRed py-3 font-black text-white shadow-[4px_4px_0_0px_rgba(0,0,0,1)] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all uppercase">{t('addressForm.confirm')}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-y-auto bg-black/60 p-4 sm:p-6 flex items-start justify-center backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="mt-8 w-full max-w-2xl rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="bg-aldesYellow border-b-4 border-black p-5 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl sm:text-2xl font-black uppercase text-black">{isEdit ? t('profile.editAddress') : t('checkout.addNewAddress')}</h3>
          <button type='button' onClick={onClose} className="rounded-xl border-2 border-black bg-white p-1 hover:bg-aldesCream transition-transform active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <X className="h-6 w-6 stroke-[3] text-black" />
          </button>
        </div>

        <div className="p-6 bg-aldesCream rounded-b-2xl">
          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* 1. RECIPIENT INFO */}
            <div className="relative z-50 grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2">
              <div className="relative pt-1.5">
                <input 
                  id="recipient_name"
                  className={inputClassName}
                  placeholder={t('addressForm.recipientNamePlaceholder')} 
                  value={form.recipient_name || ''} 
                  onChange={e => setForm(p => ({ ...p, recipient_name: e.target.value }))}
                />
                <label htmlFor="recipient_name" className={labelClassName}>{t('signup.name')}</label>
              </div>
              <div className="relative pt-1.5">
                <input 
                  id="phone_number"
                  className={inputClassName}
                  placeholder={t('addressForm.phoneNumberPlaceholder')} 
                  value={form.phone_number || ''} 
                  onFocus={() => setShowPhoneReco(true)} 
                  onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                />
                <label htmlFor="phone_number" className={labelClassName}>{t('addressForm.phoneNumber')}</label>
                
                {/* SUGGESTION PHONE NUMBER */}
                {showPhoneReco && userPhone && (
                  <div className="absolute w-full rounded-xl border-4 border-black bg-white p-3 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2" style={{ zIndex: 100 }}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">{userPhone}</span>
                      <button type="button" className="text-aldesRed font-black uppercase bg-red-50 px-3 py-1 rounded-lg border-2 border-black" onClick={() => { setForm(p => ({ ...p, phone_number: userPhone })); setShowPhoneReco(false) }}>{t('addressForm.usePhone')}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 2. REGION SELECTOR */}
            <div className="relative z-40" ref={regionSelectorRef}>
              <div 
                className={`w-full flex items-center justify-between rounded-xl border-4 bg-white px-4 py-3.5 text-sm font-bold cursor-pointer transition-transform border-black ${showRegionSelector ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5' : ''}`}
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
                <span className={form.province ? 'text-black uppercase' : 'text-gray-400 font-bold'}>
                  {[form.province, form.city, form.district, form.postal_code].filter(Boolean).join(', ') || t('addressForm.selectRegionPlaceholder')}
                </span>
                <ChevronDown className={`h-5 w-5 text-black stroke-[3] transition-transform ${showRegionSelector ? 'rotate-180' : ''}`} />
              </div>
              
              <label className="pointer-events-none absolute left-3 -top-3 text-xs bg-white text-black border-black border-2 font-black uppercase rounded-lg px-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {t('addressForm.regionLabel')}
              </label>

              {showRegionSelector && (
                <div className="absolute mt-2 w-full rounded-2xl border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden" style={{ zIndex: 100 }}>
                  <div className="flex border-b-4 border-black text-sm overflow-x-auto whitespace-nowrap scrollbar-hide bg-gray-50">
                    <button type="button" className={`px-4 py-3 font-black uppercase transition-colors ${activeRegionTab === 'province' ? 'bg-aldesYellow border-b-4 border-black text-black' : 'text-gray-500 hover:bg-gray-200'}`} onClick={() => setActiveRegionTab('province')}>
                      {form.province || t('addressForm.province')}
                    </button>
                    {(form.province || activeRegionTab === 'city') && (
                      <button type="button" className={`px-4 py-3 font-black uppercase transition-colors border-l-4 border-black ${activeRegionTab === 'city' ? 'bg-aldesYellow border-b-4 border-black text-black' : 'text-gray-500 hover:bg-gray-200'}`} onClick={() => setActiveRegionTab('city')}>
                        {form.city || t('addressForm.city')}
                      </button>
                    )}
                    {(form.city || activeRegionTab === 'district') && (
                      <button type="button" className={`px-4 py-3 font-black uppercase transition-colors border-l-4 border-black ${activeRegionTab === 'district' ? 'bg-aldesYellow border-b-4 border-black text-black' : 'text-gray-500 hover:bg-gray-200'}`} onClick={() => setActiveRegionTab('district')}>
                        {form.district || t('addressForm.district')}
                      </button>
                    )}
                    {(form.district || activeRegionTab === 'postal_code') && (
                      <button type="button" className={`px-4 py-3 font-black uppercase transition-colors border-l-4 border-black ${activeRegionTab === 'postal_code' ? 'bg-aldesYellow border-b-4 border-black text-black' : 'text-gray-500 hover:bg-gray-200'}`} onClick={() => setActiveRegionTab('postal_code')}>
                        {form.postal_code || t('addressForm.postal')}
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {activeRegionTab === 'province' && provinceOptions.map(p => (
                      <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-aldesCream border-b-2 border-gray-100 cursor-pointer text-sm font-bold text-gray-800 uppercase" onClick={() => { setForm(prev => ({ ...prev, province: p.name, city: '', district: '', postal_code: '' })); setActiveRegionTab('city') }}>
                        <span className={form.province === p.name ? 'text-aldesRed font-black' : ''}>{p.name}</span>
                        {form.province === p.name && <Check className="h-5 w-5 text-aldesRed stroke-[3]" />}
                      </div>
                    ))}
                    
                    {activeRegionTab === 'city' && cityOptions.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-aldesCream border-b-2 border-gray-100 cursor-pointer text-sm font-bold text-gray-800 uppercase" onClick={() => { setForm(prev => ({ ...prev, city: c.name, district: '', postal_code: '' })); setActiveRegionTab('district') }}>
                        <span className={form.city === c.name ? 'text-aldesRed font-black' : ''}>{c.name}</span>
                        {form.city === c.name && <Check className="h-5 w-5 text-aldesRed stroke-[3]" />}
                      </div>
                    ))}

                    {activeRegionTab === 'district' && districtOptions.map(d => (
                      <div key={d.id} className="flex items-center justify-between px-4 py-3 hover:bg-aldesCream border-b-2 border-gray-100 cursor-pointer text-sm font-bold text-gray-800 uppercase" onClick={() => { setForm(prev => ({ ...prev, district: d.name, postal_code: '' })); setActiveRegionTab('postal_code') }}>
                        <span className={form.district === d.name ? 'text-aldesRed font-black' : ''}>{d.name}</span>
                        {form.district === d.name && <Check className="h-5 w-5 text-aldesRed stroke-[3]" />}
                      </div>
                    ))}

                    {activeRegionTab === 'postal_code' && postalCodeOptions.map(pc => (
                      <div key={pc.postalCode} className="flex items-center justify-between px-4 py-3 hover:bg-aldesCream border-b-2 border-gray-100 cursor-pointer text-sm font-bold text-gray-800 uppercase" onClick={() => { setForm(prev => ({ ...prev, postal_code: pc.postalCode })); setShowRegionSelector(false) }}>
                        <span className={form.postal_code === pc.postalCode ? 'text-aldesRed font-black' : ''}>{pc.postalCode}</span>
                        {form.postal_code === pc.postalCode && <Check className="h-5 w-5 text-aldesRed stroke-[3]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 3. STREET ADDRESS & SUGGESTION BOX */}
            <div className="relative z-30">
              <textarea 
                id="street_address"
                disabled={!isRegionFilled}
                className={`w-full min-h-[60px] rounded-xl border-4 px-4 py-3.5 text-sm font-bold text-black focus:outline-none transition-all resize-y ${!isRegionFilled ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-70 text-gray-400' : 'border-black bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5'}`} 
                placeholder={t('addressForm.streetAddressPlaceholder')} 
                value={form.street_address || ''} 
                onChange={e => setForm(p => ({ ...p, street_address: e.target.value, pin_source: 'default', pin_confirmed: false }))}
              />
              <label 
                htmlFor="street_address" 
                className="pointer-events-none absolute left-3 -top-3 px-2 text-xs font-black uppercase rounded-lg border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white border-black text-black z-10"
              >
                {isRegionFilled ? t('addressForm.streetAddressPlaceholder') : t('addressForm.selectRegionFirst')}
              </label>

              {suggestions.length > 0 && (
                <div className="absolute w-full max-h-48 overflow-auto rounded-2xl border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mt-2" style={{ zIndex: 100 }}>
                  {suggestions.slice(0, 5).map(s => (
                    <button type="button" key={s.id} className="block w-full border-b-2 border-gray-200 px-4 py-3 text-left hover:bg-aldesCream focus:bg-aldesCream focus:outline-none" onClick={() => {
                        setForm(p => applySuggestionToForm(p, s))
                        setSuggestions([])
                    }}>
                      <div className="font-black text-black uppercase text-sm">{s.formattedAddress || s.title}</div>
                      {s.formattedAddress && s.title !== s.formattedAddress && <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">{s.title}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. MAP PREVIEW AREA */}
            <div className={`w-full rounded-2xl p-4 border-4 relative z-10 transition-colors ${hasStreet ? 'bg-aldesYellow border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-dashed border-gray-400'}`}>
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`flex h-6 w-6 items-center justify-center rounded border-2 border-black ${hasStreet ? 'bg-white text-aldesRed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-200 text-gray-400 border-transparent'}`}>
                      <MapPin className="h-4 w-4 stroke-[3]" />
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-black uppercase text-sm ${hasStreet ? 'text-black' : 'text-gray-500'}`}>{t('addressForm.placeAccuratePin')}</h4>
                    <p className={`text-xs font-bold mt-0.5 uppercase ${hasStreet ? 'text-gray-800' : 'text-gray-400'}`}>{t('addressForm.deliverToMap')}</p>
                  </div>
                </div>
                <button type="button" onClick={handleCurrentLocation} className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-white border-2 border-black px-3 py-2 text-xs font-black uppercase text-black hover:bg-aldesCream hover:-translate-y-0.5 active:translate-y-0 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Navigation className="h-4 w-4 stroke-[3]" />
                  {t('addressForm.currentLoc')}
                </button>
              </div>
              
              <div className={`relative h-44 w-full overflow-hidden rounded-xl border-4 border-black bg-white shadow-[inset_0px_0px_10px_rgba(0,0,0,0.1)] ${hasStreet ? 'cursor-pointer group' : ''}`} onClick={() => { if(hasStreet) setShowMapLayer(true) }} style={{ zIndex: 0 }}>
                {hasStreet ? (
                  <div key="map-active" ref={previewMapElRef} className="h-full w-full pointer-events-none" />
                ) : (
                  <div key="map-inactive" className="h-full w-full pointer-events-none" />
                )}
                
                {!hasStreet && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100"> 
                     <button type="button" disabled className="relative z-10 flex items-center gap-2 rounded-xl bg-white px-4 py-2 border-2 border-gray-300 text-sm font-black uppercase text-gray-400">
                       <MapPin className="h-5 w-5 stroke-[2]" /> {t('addressForm.addLocation')}
                     </button>
                  </div>
                )}
                
                {hasStreet && (
                  <button type="button" className="absolute right-3 bottom-3 z-[1000] rounded-lg border-2 border-black bg-aldesYellow px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {t('addressForm.viewFullMap')}
                  </button>
                )}
              </div>
            </div>

            {/* 5. DETAIL ADDRESS */}
            <div className="relative z-0">
              <textarea 
                id="detail_address"
                className={inputClassName}
                placeholder={t('addressForm.otherDetailsPlaceholder')} 
                value={form.detail_address || ''} 
                onChange={e => setForm(p => ({ ...p, detail_address: e.target.value }))}
              />
              <label htmlFor="detail_address" className={labelClassName}>{t('addressForm.otherDetails')}</label>
            </div>
            
            <div className="pt-2 border-t-2 border-gray-200">
              <span className="block text-sm font-black uppercase text-black mb-3">{t('addressForm.labelAs')}</span>
              <div className="flex gap-3">
                <button type="button" onClick={() => setForm(p => ({ ...p, label: 'Home' }))} className={`rounded-xl border-2 px-5 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${form.label === 'Home' ? 'border-black text-white bg-black' : 'border-black text-black bg-white hover:bg-gray-50'}`}>{t('addressForm.home')}</button>
                <button type="button" onClick={() => setForm(p => ({ ...p, label: 'Work' }))} className={`rounded-xl border-2 px-5 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${form.label === 'Work' ? 'border-black text-white bg-black' : 'border-black text-black bg-white hover:bg-gray-50'}`}>{t('addressForm.work')}</button>
                <button type="button" onClick={() => setForm(p => ({ ...p, label: 'Other' }))} className={`rounded-xl border-2 px-5 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${form.label === 'Other' ? 'border-black text-white bg-black' : 'border-black text-black bg-white hover:bg-gray-50'}`}>{t('addressForm.other')}</button>
              </div>
            </div>
            
            <div className="pt-2 text-sm text-black">
              <label className="flex items-center gap-3 cursor-pointer group w-max">
                <input type="checkbox" className="h-5 w-5 accent-aldesRed border-2 border-black rounded cursor-pointer" checked={!!form.is_default} onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))} /> 
                 <span className="font-black uppercase group-hover:text-aldesRed transition-colors">{t('addressForm.setAsDefault')}</span>
              </label>
            </div>
            
            {error && <div className="rounded-xl border-2 border-black bg-white p-3 text-sm font-black uppercase text-aldesRed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{error}</div>}
            
            {/* SUBMIT BUTTONS */}
            <div className="flex justify-end gap-4 pt-6 border-t-4 border-black">
              <button type="button" onClick={onClose} className="min-w-[120px] rounded-2xl border-4 border-black bg-white py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-transform active:translate-y-1 active:shadow-none">{t('addressForm.cancel')}</button>
              <button disabled={isSaving} className="min-w-[140px] rounded-2xl border-4 border-black bg-aldesRed py-3 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:brightness-110 transition-transform active:translate-y-1 active:shadow-none flex justify-center items-center disabled:opacity-50">
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : t('addressForm.saveAddress')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}