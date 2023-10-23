import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'

import { type TimeSeries } from '../../types'

export function Map({
  data,
  isEditMode,
}: {
  data: TimeSeries
  isEditMode: boolean
}) {
  const fakeCoor = [
    [21.0285, 105.8542],
    [21.0374, 105.8497],
    [21.0369, 105.8511],
    [21.04, 105.8311],
    [21.0402, 105.8475],
    [21.0245, 105.8473],
  ]

  const avgLatitude =
    fakeCoor.reduce((sum, [lat]) => sum + lat, 0) / fakeCoor.length
  const avgLongitude =
    fakeCoor.reduce((sum, [, lng]) => sum + lng, 0) / fakeCoor.length

  return (
    <MapContainer
      className="h-full"
      center={[avgLatitude, avgLongitude]}
      zoom={10}
      scrollWheelZoom
      dragging={!isEditMode}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {fakeCoor.map((coor, index) => {
        const [lat, lng] = coor

        return (
          <Marker position={[lat, lng]} key={index}>
            <Popup>
              {`Thiết bị ${index}.`}
              <br />
              Cảm biến nhiệt độ.
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
