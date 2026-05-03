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
  return {
    ...form,
    street_address: suggestion.formattedAddress || suggestion.title,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    pin_source: 'suggestion',
    pin_confirmed: true,
  }
}

export function applyCurrentLocationToForm(form, latitude, longitude) {
  return { ...form, latitude, longitude, pin_source: 'current_location', pin_confirmed: true }
}
