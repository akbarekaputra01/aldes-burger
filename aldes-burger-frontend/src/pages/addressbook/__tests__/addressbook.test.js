import test from 'node:test'
import assert from 'node:assert/strict'
import { getCities, getDistricts, getPostalCodes, getProvinces } from '../regions.js'
import { searchAddressSuggestions } from '../geocoding.js'
import { applyCurrentLocationToForm, applySuggestionToForm, canSubmitAddress } from '../formLogic.js'

test('region provider fetches from external API, not local REGION_TREE', async () => {
  const calls = []
  globalThis.fetch = async (url) => {
    calls.push(String(url))
    return { ok: true, json: async () => ([{ id: '32', nama: 'Jawa Barat' }]) }
  }
  const provinces = await getProvinces()
  assert.equal(provinces[0].name, 'JAWA BARAT')
  assert.match(calls[0], /emsifa/i)
})

test('city, district and postal code are loaded via provider chain', async () => {
  globalThis.fetch = async (url) => {
    const u = String(url)
    if (u.includes('/regencies/32')) return { ok: true, json: async () => ([{ id: '3275', nama: 'Kota Bekasi' }]) }
    if (u.includes('/districts/3275')) return { ok: true, json: async () => ([{ id: '3275010', nama: 'Bekasi Utara' }]) }
    if (u.includes('kodepos.vercel.app')) return { ok: true, json: async () => ({ data: [{ postalcode: '17124', urban: 'Harapan Baru', subdistrict: 'Bekasi Utara', city: 'Kota Bekasi', province: 'Jawa Barat' }] }) }
    return { ok: true, json: async () => [] }
  }

  const cities = await getCities('32')
  const districts = await getDistricts('3275')
  const postalCodes = await getPostalCodes('3275010', { district: 'BEKASI UTARA', city: 'KOTA BEKASI', province: 'JAWA BARAT' })
  assert.equal(cities[0].name, 'KOTA BEKASI')
  assert.equal(districts[0].name, 'BEKASI UTARA')
  assert.equal(postalCodes[0].postalCode, '17124')
})

test('street suggestions call provider and return real coordinates', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ([{ place_id: 1, name: 'Pesona Anggrek', display_name: 'Pesona Anggrek, Bekasi', lat: '-6.1', lon: '106.9' }]) })
  const region = { province: 'JAWA BARAT', city: 'KOTA BEKASI', district: 'BEKASI UTARA', postalCode: '17124' }
  const results = await searchAddressSuggestions('pesona', region)
  assert.equal(results[0].provider, 'mapsco')
  assert.equal(results[0].latitude, -6.1)
  assert.equal(results[0].longitude, 106.9)
})

test('selecting provider suggestion sets pin_source suggestion and coordinates', () => {
  const form = { street_address: '', pin_source: 'default', pin_confirmed: false, latitude: null, longitude: null }
  const next = applySuggestionToForm(form, { title: 'Pesona', formattedAddress: 'Pesona Bekasi', latitude: -6.2, longitude: 106.9 })
  assert.equal(next.street_address, 'Pesona Bekasi')
  assert.equal(next.pin_source, 'suggestion')
  assert.equal(next.pin_confirmed, true)
  assert.equal(next.latitude, -6.2)
})

test('manual text-only address cannot submit with default coordinates', () => {
  const form = { recipient_name: 'A', phone_number: '08', province: 'JAWA BARAT', city: 'KOTA BEKASI', district: 'BEKASI UTARA', postal_code: '17124', street_address: 'Jl. ABC', latitude: -6.2, longitude: 106.8, pin_source: 'default', pin_confirmed: false }
  assert.equal(canSubmitAddress(form), false)
})

test('current location marks pin as valid source', () => {
  const next = applyCurrentLocationToForm({}, -6.12, 106.81)
  assert.equal(next.pin_source, 'current_location')
  assert.equal(next.pin_confirmed, true)
  assert.equal(next.latitude, -6.12)
})
