export function getCurrentPosition({ timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Your browser does not support location access.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => {
        const msgs = {
          [err.PERMISSION_DENIED]: 'Location access denied. Please enable it in your browser settings.',
          [err.POSITION_UNAVAILABLE]: 'Location unavailable. Please enable GPS.',
          [err.TIMEOUT]: 'Location request timed out. Try again.',
        }
        reject(new Error(msgs[err.code] || 'Could not get your location.'))
      },
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    )
  })
}
