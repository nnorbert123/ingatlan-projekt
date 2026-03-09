// Geocoding Service - Cím -> GPS koordináták
export const geocodeAddress = async (address) => {
  try {
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Fordított geocoding - GPS koordináták -> Cím
export const reverseGeocode = async (lat, lng) => {
  try {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            formatted_address: results[0].formatted_address,
            city: results[0].address_components.find(c => 
              c.types.includes('locality')
            )?.long_name || '',
            country: results[0].address_components.find(c => 
              c.types.includes('country')
            )?.long_name || ''
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Távolság számítás két GPS pont között (km-ben)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Föld sugara km-ben
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance.toFixed(2); // 2 tizedesjegyre kerekítve
};

// Magyar városok geocoding adatbázisa (fallback)
export const hungarianCities = {
  'Budapest': { lat: 47.4979, lng: 19.0402 },
  'Debrecen': { lat: 47.5316, lng: 21.6273 },
  'Szeged': { lat: 46.2530, lng: 20.1414 },
  'Miskolc': { lat: 48.1035, lng: 20.7784 },
  'Pécs': { lat: 46.0727, lng: 18.2329 },
  'Győr': { lat: 47.6875, lng: 17.6504 },
  'Nyíregyháza': { lat: 47.9559, lng: 21.7187 },
  'Kecskemét': { lat: 46.8967, lng: 19.6896 },
  'Székesfehérvár': { lat: 47.1898, lng: 18.4253 },
  'Szombathely': { lat: 47.2308, lng: 16.6218 }
};

// Város alapján GPS koordináta (fallback megoldás)
export const getCityCoordinates = (city) => {
  const normalizedCity = city.trim();
  return hungarianCities[normalizedCity] || null;
};
