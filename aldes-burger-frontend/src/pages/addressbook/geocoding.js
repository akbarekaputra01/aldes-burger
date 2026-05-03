const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

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

export async function searchAddressSuggestions(query, region = {}) {
  const q = query?.trim()
  if (!q || q.length < 3) return []

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
