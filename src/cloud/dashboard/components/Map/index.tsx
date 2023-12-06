import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'

import { type TimeSeries } from '../../types'

export function Map({
  data,
  isEditMode,
}: {
  data: TimeSeries
  isEditMode: boolean
}) {
  const [dragMode, setDragMode] = useState(true)
  const [dataForMap, setDataForMap] = useState<Array<any>>([])
  const [avgLatitude, setAvgLatitude] = useState(0)
  const [avgLongitude, setAvgLongitude] = useState(0)
  const map = useRef(null)

  // const fakeCoor = [
  //   [21.0285, 105.8542],
  //   [21.0374, 105.8497],
  //   [21.0369, 105.8511],
  //   [21.04, 105.8311],
  //   [21.0402, 105.8475],
  //   [21.0245, 105.8473],
  // ]

  // const avgLatitude =
    // fakeCoor.reduce((sum, [lat]) => sum + lat, 0) / fakeCoor.length
  // const avgLongitude =
    // fakeCoor.reduce((sum, [, lng]) => sum + lng, 0) / fakeCoor.length
  
  
  useEffect(() => {
    if (isEditMode) {
      setDragMode(false)
    } else {
      setDragMode(true)
    }
  }, [isEditMode])

  useEffect(() => {
    const dataCurrent = []
    let coorCurrent = []
    if (Object.keys(data).length !== 0) {
      let currentLat = 0
      let currentLong = 0
      if (dataForMap.length > 0) {
        const dataLat = Object.entries(data).filter(([key]) => key === 'lat')
        const dataLong = Object.entries(data).filter(([key]) => key === 'long')
        currentLat = dataLat.length > 0 ? parseFloat(Object.entries(data).filter(([key]) => key === 'lat')[0]?.[1]?.[0].value) : dataForMap[0][0]
        currentLong = dataLong.length > 0 ? parseFloat(Object.entries(data).filter(([key]) => key === 'long')[0]?.[1]?.[0].value) : dataForMap[0][1]
      } else {
        currentLat = parseFloat(Object.entries(data).filter(([key]) => key === 'lat')[0]?.[1]?.[0].value)
        currentLong = parseFloat(Object.entries(data).filter(([key]) => key === 'long')[0]?.[1]?.[0].value)
      }
      coorCurrent = [currentLat, currentLong]
      setAvgLatitude(currentLat)
      setAvgLongitude(currentLong)
      dataCurrent.push(coorCurrent)
      map.current?.setView([currentLat, currentLong])
      setDataForMap(dataCurrent)
    }
  }, [data])

  return (
    <MapContainer
      className="h-full"
      center={[avgLatitude, avgLongitude]}
      zoom={10}
      scrollWheelZoom
      dragging={dragMode}
      attributionControl={false}
      ref={map}
    >
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {dataForMap.map((coor, index) => {
        const [lat, lng] = coor

        return (
          <Marker position={[lat, lng]} key={index}>
            <Popup>
              {/* {`Thiết bị ${index}.`}
              <br />
              Cảm biến nhiệt độ. */}
              {`Current coor (${lat},${lng})`}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
