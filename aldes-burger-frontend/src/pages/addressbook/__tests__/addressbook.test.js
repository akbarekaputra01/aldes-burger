import test from 'node:test'
import assert from 'node:assert/strict'
import { getCityOptions, getDistrictOptions, getPostalCodeOptions } from '../regions.js'
import { searchAddressSuggestions } from '../geocoding.js'

test('filters city by province', () => {
  assert.deepEqual(getCityOptions('JAWA BARAT'), ['KOTA BEKASI', 'KABUPATEN BEKASI'])
  assert.deepEqual(getCityOptions('DKI JAKARTA'), ['JAKARTA SELATAN'])
})

test('filters district by city', () => {
  assert.deepEqual(getDistrictOptions('JAWA BARAT', 'KOTA BEKASI'), ['BEKASI UTARA', 'BEKASI SELATAN'])
})

test('postal code selected from district context', () => {
  assert.deepEqual(getPostalCodeOptions('JAWA BARAT', 'KOTA BEKASI', 'BEKASI UTARA'), ['17121', '17124'])
})

test('street suggestions call provider and use query with region context (no fake concat list)', async () => {
  const calls = []
  globalThis.fetch = async (url) => {
    calls.push(String(url))
    return { ok: true, json: async () => ([{ place_id: 1, name: 'Pesona Anggrek', display_name: 'Pesona Anggrek, Bekasi', lat: '-6.1', lon: '106.9' }]) }
  }

  const region = { province: 'JAWA BARAT', city: 'KOTA BEKASI', district: 'BEKASI UTARA', postalCode: '17124' }
  const results = await searchAddressSuggestions('pesona', region)

  assert.equal(calls.length, 1)
  assert.match(calls[0], /pesona/i)
  assert.match(calls[0], /KOTA\\+BEKASI|KOTA\+BEKASI/i)
  assert.equal(results[0].provider, 'nominatim')
  assert.equal(results[0].latitude, -6.1)
  assert.equal(results[0].longitude, 106.9)
  assert.doesNotMatch(results[0].formattedAddress, /Indonesia\s+[123]$/)
})

test('does not search for short query', async () => {
  let called = false
  globalThis.fetch = async () => { called = true; return { ok: true, json: async () => [] } }
  const results = await searchAddressSuggestions('ab', {})
  assert.equal(called, false)
  assert.deepEqual(results, [])
})
