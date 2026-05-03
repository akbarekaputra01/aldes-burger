// TODO: Replace with real provider integration when API key/config is available.
export async function searchAddressSuggestions(query, region = {}) {
  const q = query?.trim()
  if (!q || q.length < 3) return []

  const regionText = [region?.district, region?.city, region?.province].filter(Boolean).join(', ')
  return [1, 2, 3].map((idx) => ({
    id: `${q}-${idx}`,
    formattedAddress: `${q} ${idx}, ${regionText || 'Jakarta'}, Indonesia`,
    latitude: -6.2 + idx * 0.001,
    longitude: 106.816666 + idx * 0.001,
  }))
}

export async function reverseGeocode(lat, lng) {
  return {
    formattedAddress: `Pinned at ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
  }
}
