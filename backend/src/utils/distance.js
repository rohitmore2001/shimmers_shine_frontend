// Navi Mumbai central coordinates (approximate)
const NAVI_MUMBAI_COORDS = {
  latitude: 19.0330,
  longitude: 73.0297
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point  
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate distance from Navi Mumbai to given coordinates
 * @param {number} latitude - Latitude of the location
 * @param {number} longitude - Longitude of the location
 * @returns {number} Distance in kilometers from Navi Mumbai
 */
export function calculateDistanceFromNaviMumbai(latitude, longitude) {
  return calculateDistance(
    NAVI_MUMBAI_COORDS.latitude,
    NAVI_MUMBAI_COORDS.longitude,
    latitude,
    longitude
  )
}

/**
 * Geocode an Indian address to get approximate coordinates
 * This is a simplified version - in production, use a proper geocoding service
 * @param {string} address - Address string
 * @param {string} city - City name
 * @param {string} pincode - Postal code
 * @returns {Object} Approximate coordinates {latitude, longitude}
 */
export function geocodeIndianAddress(address, city, pincode) {
  // Simplified geocoding for major Indian cities
  const cityCoords = {
    'navi mumbai': { lat: 19.0330, lng: 73.0297 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'thane': { lat: 19.2183, lng: 72.9781 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 }
  }

  const normalizedCity = city.toLowerCase().trim()
  let coords = cityCoords[normalizedCity] || { lat: 19.0330, lng: 73.0297 } // Default to Navi Mumbai

  // Add some randomization based on pincode to make it more realistic
  if (pincode && pincode.length === 6) {
    const pinOffset = parseInt(pincode.slice(-2)) / 100
    coords.lat += (Math.random() - 0.5) * pinOffset * 0.1
    coords.lng += (Math.random() - 0.5) * pinOffset * 0.1
  }

  return {
    latitude: coords.lat,
    longitude: coords.lng
  }
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}
