const WILAYAH_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api'
const KODEPOS_BASE = 'https://kodepos.vercel.app/search'

const normalizeName = (item) => {
  const raw = item?.nama ?? item?.name ?? item?.label ?? ''
  const clean = String(raw).trim()
  if (!clean || clean.toLowerCase() === 'undefined' || clean.toLowerCase() === 'null') return ''
  return clean.toUpperCase()
}

const toRegionOption = (item) => ({
  id: String(item?.id ?? item?.code ?? ''),
  name: normalizeName(item),
})

const sanitizeRegionOptions = (rows) => rows.filter((row) => row.id && row.name)


const stripAdministrativePrefix = (value = '') => String(value)
  .replace(/^KABUPATEN\s+/i, '')
  .replace(/^KOTA\s+/i, '')
  .replace(/^PROVINSI\s+/i, '')
  .trim()

const buildPostalQueries = (context = {}) => {
  const district = stripAdministrativePrefix(context.district)
  const city = stripAdministrativePrefix(context.city)
  const province = stripAdministrativePrefix(context.province)
  const candidates = [
    [district, city, province].filter(Boolean).join(' '),
    [district, city].filter(Boolean).join(' '),
    district,
  ].filter(Boolean)

  return [...new Set(candidates)]
}

const requestJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Region provider error (${response.status})`)
  return response.json()
}

export async function getProvinces() {
  const data = await requestJson(`${WILAYAH_BASE}/provinces.json`)
  return Array.isArray(data) ? sanitizeRegionOptions(data.map(toRegionOption)) : []
}

export async function getCities(provinceId) {
  if (!provinceId) return []
  const data = await requestJson(`${WILAYAH_BASE}/regencies/${provinceId}.json`)
  return Array.isArray(data) ? sanitizeRegionOptions(data.map(toRegionOption)) : []
}

export async function getDistricts(cityId) {
  if (!cityId) return []
  const data = await requestJson(`${WILAYAH_BASE}/districts/${cityId}.json`)
  return Array.isArray(data) ? sanitizeRegionOptions(data.map(toRegionOption)) : []
}

export async function getPostalCodes(districtId, context = {}) {
  if (!districtId || !context.district) return []
  const queries = buildPostalQueries(context)
  const unique = new Map()

  for (const q of queries) {
    const data = await requestJson(`${KODEPOS_BASE}?q=${encodeURIComponent(q)}`)
    const rows = Array.isArray(data?.data) ? data.data : []
    for (const row of rows) {
      const postal = row?.postalcode ?? row?.code
      if (!postal) continue
      const key = String(postal)
      if (!unique.has(key)) unique.set(key, { postalCode: key, village: row.urban ?? row.village, district: row.subdistrict ?? row.district, city: row.city ?? row.regency, province: row.province })
    }
    if (unique.size > 0) break
  }

  return [...unique.values()]
}
