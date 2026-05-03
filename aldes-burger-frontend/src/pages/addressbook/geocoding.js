const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

let googleMapsLoaderPromise

export const loadGoogleMapsPlaces = async () => {
  if (!GOOGLE_MAPS_API_KEY) return null
  if (window.google?.maps?.places) return window.google

  if (!googleMapsLoaderPromise) {
    googleMapsLoaderPromise = new Promise((resolve, reject) => {
      const callback = `gmapsInit_${Date.now()}`
      window[callback] = () => {
        delete window[callback]
        resolve(window.google)
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callback}`
      script.async = true
      script.onerror = () => {
        delete window[callback]
        reject(new Error('Unable to load Google Maps Places'))
      }
      document.head.appendChild(script)
    })
  }

  return googleMapsLoaderPromise
}

const toSuggestion = (item) => ({
  id: String(item.place_id),
  title: item.name || item.display_name?.split(',')[0] || 'Unknown place',
  formattedAddress: item.display_name,
  latitude: Number(item.lat),
  longitude: Number(item.lon),
  provider: 'nominatim',
  raw: item,
})

const buildRegionQuery = (region = {}) => [region.district, region.city, region.province, region.postalCode].filter(Boolean).join(', ')

const searchGooglePlaceSuggestions = async (query, region = {}) => {
  const google = await loadGoogleMapsPlaces()
  if (!google?.maps?.places) return []

  const request = {
    input: query,
    componentRestrictions: { country: 'id' },
  }

  if (region.city || region.province) {
    request.input = [query, region.city, region.province].filter(Boolean).join(', ')
  }

  const service = new google.maps.places.AutocompleteService()
  const predictions = await new Promise((resolve) => {
    service.getPlacePredictions(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return resolve([])
      resolve(results)
    })
  })

  if (!predictions.length) return []

  const geocoder = new google.maps.Geocoder()
  const mapped = await Promise.all(predictions.slice(0, 8).map((prediction) => new Promise((resolve) => {
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status !== 'OK' || !results?.[0]?.geometry?.location) return resolve(null)
      const loc = results[0].geometry.location
      resolve({
        id: prediction.place_id,
        title: prediction.structured_formatting?.main_text || prediction.description,
        formattedAddress: prediction.description,
        latitude: loc.lat(),
        longitude: loc.lng(),
        provider: 'google_places',
        raw: prediction,
      })
    })
  })))

  return mapped.filter(Boolean)
}

export async function searchAddressSuggestions(query, region = {}) {
  const q = query?.trim()
  if (!q || q.length < 3) return []

  if (GOOGLE_MAPS_API_KEY) {
    try {
      const googleResults = await searchGooglePlaceSuggestions(q, region)
      if (googleResults.length > 0) return googleResults
    } catch {
      // fallback to nominatim
    }
  }

  const regionBias = buildRegionQuery(region)
  const queryCandidates = [
    regionBias ? `${q}, ${regionBias}` : '',
    q,
    [q, region?.city, region?.province].filter(Boolean).join(', '),
  ].filter(Boolean)

  let data = []
  let lastError
  for (const candidate of [...new Set(queryCandidates)]) {
    const params = new URLSearchParams({
      q: candidate,
      format: 'jsonv2',
      addressdetails: '1',
      countrycodes: 'id',
      limit: '8',
    })

    try {
      const response = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('Address provider error')
      data = await response.json()
      if (Array.isArray(data) && data.length > 0) break
    } catch (error) {
      lastError = error
    }
  }

  if (!Array.isArray(data) || data.length === 0) {
    if (lastError) throw lastError
    return []
  }
  const unique = new Map()
  for (const item of data) {
    const suggestion = toSuggestion(item)
    if (!Number.isFinite(suggestion.latitude) || !Number.isFinite(suggestion.longitude)) continue
    const key = `${suggestion.title}-${suggestion.formattedAddress}`.toLowerCase()
    if (!unique.has(key)) unique.set(key, suggestion)
  }
  return [...unique.values()]
}

export async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: '1',
  })
  const response = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Reverse geocode failed')

  const data = await response.json()
  const address = data.address || {}
  return {
    formattedAddress: data.display_name || '',
    province: address.state,
    city: address.city || address.county,
    district: address.suburb || address.city_district || address.village,
    postalCode: address.postcode,
    raw: data,
  }
}
