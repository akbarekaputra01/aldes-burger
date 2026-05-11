export const pinValidSources = ['suggestion', 'current_location', 'manual_map', 'manual_adjusted']

export function hasValidPin(form) {
  return form.latitude !== null && form.longitude !== null && form.pin_confirmed && pinValidSources.includes(form.pin_source)
}

export function canSubmitAddress(form) {
  return Boolean(
    hasValidPin(form) &&
    form.recipient_name && form.phone_number && form.province && form.city && form.district && form.postal_code && form.street_address,
  )
}

export function applySuggestionToForm(form, suggestion) {
  const updates = {
    street_address: suggestion.formattedAddress || suggestion.title,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    pin_source: 'suggestion',
    pin_confirmed: true,
  }
  
  if (suggestion.raw?.address) {
    const address = suggestion.raw.address;
    updates.province = address.state ? address.state.toUpperCase() : '';
    
    let city = address.city || address.town || address.county || '';
    if (city) {
      if (city.toLowerCase().startsWith('kota ')) updates.city = city.toUpperCase();
      else if (city.toLowerCase().startsWith('kabupaten ')) updates.city = city.toUpperCase();
      else if (address.city) updates.city = `KOTA ${city.toUpperCase()}`; // guess
      else updates.city = `KABUPATEN ${city.toUpperCase()}`;
    } else {
      updates.city = '';
    }
    
    let district = address.suburb || address.city_district || address.village || '';
    updates.district = district ? district.toUpperCase() : '';
    updates.postal_code = address.postcode || '';
  } else {
    updates.province = '';
    updates.city = '';
    updates.district = '';
    updates.postal_code = '';
  }

  return { ...form, ...updates }
}

export function applyCurrentLocationToForm(form, latitude, longitude) {
  return { ...form, latitude, longitude, pin_source: 'current_location', pin_confirmed: true }
}
