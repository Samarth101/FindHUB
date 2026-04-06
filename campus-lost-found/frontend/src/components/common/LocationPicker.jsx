import { useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Loader2, MapPin } from 'lucide-react'
import { RADIUS } from '../../utils/constants'

const containerStyle = {
  width: '100%',
  height: '300px'
}

const defaultCenter = {
  lat: 18.5204,
  lng: 73.8567
}

export default function LocationPicker({ value, onChange }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  })

  const [marker, setMarker] = useState(value || defaultCenter)

  const onMapClick = useCallback((e) => {
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    }
    setMarker(coords)
    if (onChange) onChange(coords)
  }, [onChange])

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500" style={{ borderRadius: RADIUS.wobblySm }}>
        <Loader2 className="animate-spin mb-2" size={24} />
        <p className="font-body text-sm text-center">Loading Map...</p>
      </div>
    )
  }

  const currentPos = value || marker

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-blue-600 font-bold mb-1">
        <MapPin size={16} />
        <span>Click on the map to pin exact location</span>
      </div>

      <div className="border-2 border-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] overflow-hidden" style={{ borderRadius: RADIUS.wobblySm }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPos}
          zoom={15}
          onClick={onMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true
          }}
        >
          <Marker position={currentPos} />
        </GoogleMap>
      </div>

      <div className="flex justify-between text-[10px] text-gray-400 font-mono italic">
        <span>LAT: {currentPos.lat.toFixed(6)}</span>
        <span>LNG: {currentPos.lng.toFixed(6)}</span>
      </div>
    </div>
  )
}