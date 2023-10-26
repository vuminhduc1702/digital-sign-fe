import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'

import { type TimeSeries } from '../../types'

export function Map({
  data,
  isEditMode = false,
}: {
  data: TimeSeries
  isEditMode: boolean
}) {
  console.log('data map: ', data)

  // const coorData = [
  //   [21.0285, 105.8542],
  //   [21.0374, 105.8497],
  //   [21.0369, 105.8511],
  //   [21.04, 105.8311],
  //   [21.0402, 105.8475],
  //   [21.0245, 105.8473],
  // ]

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState(
    [],
  )
  console.log('dataTransformedFeedToChart', dataTransformedFeedToChart)

  const newDataValue = JSON.stringify(data)
  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      const mapWidgetDataType = Object.values(
        Object.entries(data).reduce((acc, [key, values]) => {
          values.forEach(item => {
            const { ts, value } = item
            const floatValue = parseFloat(value).toFixed(4)
            acc[ts] = acc[ts] || { ts, data: [] }
            acc[ts].data.push(floatValue)
          })

          return acc
        }, {}),
      )
      setDataTransformedFeedToChart(mapWidgetDataType)
    }
  }, [newDataValue])

  // const avgLatitude =
  //   dataTransformedFeedToChart.data?.reduce((sum, [lat]) => sum + lat, 0) /
  //   dataTransformedFeedToChart.length
  // const avgLongitude =
  //   dataTransformedFeedToChart.data?.reduce((sum, [, lng]) => sum + lng, 0) /
  //   dataTransformedFeedToChart.length

  return (
    <MapContainer
      className="h-full"
      // center={[avgLatitude, avgLongitude]}
      center={[1, 1]}
      zoom={10}
      scrollWheelZoom
      dragging={!isEditMode}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {dataTransformedFeedToChart.map((coor, index) => {
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
    // <div>lsakdjf</div>
  )
}
