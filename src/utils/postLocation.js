export const normalizePostLocation = (rawLocation) => {
  if (!rawLocation) return null

  const source = typeof rawLocation === 'object' && rawLocation !== null
    ? (rawLocation.location || rawLocation.data || rawLocation)
    : rawLocation

  if (typeof source === 'string') {
    const trimmed = source.trim()
    return trimmed ? { label: trimmed, lat: null, lng: null } : null
  }

  if (typeof source !== 'object' || source === null) return null

  const lat = Number(source.lat ?? source.latitude)
  const lng = Number(source.lng ?? source.lon ?? source.longitude)
  const city = source.city || source.town || source.village || ''
  const region = source.region || source.state || source.province || ''
  const country = source.country || ''
  const placeName = source.placeName || source.place_name || source.address || source.display_name || ''

  const label = placeName || [city, region, country].filter(Boolean).join(', ')
  if (!label && !Number.isFinite(lat) && !Number.isFinite(lng)) return null

  return {
    label: label || 'Vị trí không xác định',
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  }
}
