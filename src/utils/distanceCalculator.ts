// Haversine formula for distance calculation (fallback)
export const calculateDistanceHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Google Maps Distance Matrix API (more accurate)
export const calculateDistanceGoogleMaps = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  apiKey?: string
): Promise<number> => {
  if (!apiKey) {
    // Fallback to Haversine if no API key
    return calculateDistanceHaversine(origin.lat, origin.lng, destination.lat, destination.lng);
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}&units=metric`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      return data.rows[0].elements[0].distance.value / 1000; // Convert meters to kilometers
    }
    
    // Fallback to Haversine if API fails
    return calculateDistanceHaversine(origin.lat, origin.lng, destination.lat, destination.lng);
  } catch (error) {
    console.error('Google Maps API error:', error);
    // Fallback to Haversine if API fails
    return calculateDistanceHaversine(origin.lat, origin.lng, destination.lat, destination.lng);
  }
};

// Get Google Maps directions URL
export const getGoogleMapsDirectionsUrl = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): string => {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;
};
