const WILAYAH_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api'
const KODEPOS_BASE = 'https://kodepos.vercel.app/search'

const toRegionOption = (item) => ({ id: String(item.id), name: String(item.nama).toUpperCase() })

const requestJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Region provider error (${response.status})`)
  return response.json()
}

export async function getProvinces() {
  const data = await requestJson(`${WILAYAH_BASE}/provinces.json`)
  return Array.isArray(data) ? data.map(toRegionOption) : []
}

export async function getCities(provinceId) {
  if (!provinceId) return []
  const data = await requestJson(`${WILAYAH_BASE}/regencies/${provinceId}.json`)
  return Array.isArray(data) ? data.map(toRegionOption) : []
}

export async function getDistricts(cityId) {
  if (!cityId) return []
  const data = await requestJson(`${WILAYAH_BASE}/districts/${cityId}.json`)
  return Array.isArray(data) ? data.map(toRegionOption) : []
}

export async function getPostalCodes(districtId, context = {}) {
  if (!districtId || !context.district) return []
  const q = [context.district, context.city, context.province].filter(Boolean).join(' ')
  const data = await requestJson(`${KODEPOS_BASE}?q=${encodeURIComponent(q)}`)
  const rows = Array.isArray(data?.data) ? data.data : []
  const unique = new Map()
  for (const row of rows) {
    if (!row?.postalcode) continue
    const key = String(row.postalcode)
    if (!unique.has(key)) unique.set(key, { postalCode: key, village: row.urban, district: row.subdistrict, city: row.city, province: row.province })
  }
  return [...unique.values()]
}
