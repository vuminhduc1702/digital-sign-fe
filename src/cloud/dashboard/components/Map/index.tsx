import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'

import { DataItem, EntityId, WSWidgetData, type TimeSeries } from '../../types'
import { z } from 'zod'
import { widgetSchema } from '../Widget'

export function Map({
  data,
  widgetInfo,
  isEditMode,
  deviceInfo
}: {
  data: TimeSeries
  widgetInfo: z.infer<typeof widgetSchema>
  isEditMode: boolean
  deviceInfo?: any
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
    const dataCurrent: string[][] = []
    let coorCurrent: string[] = []

    // const fakeData = [
    //   ['lat', [
    //     {'ts': 123123123, 'value': '34'},
    //     {'ts': 234234234, 'value': '21'}
    //   ]],
    //   ['long', [
    //     {'ts': 123123123, 'value': '142'},
    //     {'ts': 234234234, 'value': '231'}
    //   ]]
    // ]
    if (Object.keys(data).length !== 0) {
      Object.keys(data).forEach(() => {
        const dataLat = Object.entries(data).filter(([key]) => key === 'lat')[0]?.[1]
        const dataLong = Object.entries(data).filter(([key]) => key === 'long')[0]?.[1]
        Object.entries(dataLat).map((latKey, index) => {
          coorCurrent = [latKey[1].value, dataLong[index]?.value]
          const coorIndex = dataCurrent.findIndex(item => item[0] === coorCurrent[0])
          if (coorIndex === -1) {
            dataCurrent.push(coorCurrent)
          }
        })
      })

      setDataForMap(dataCurrent)
    }
  }, [data])

  // useEffect(() => {
  //   console.log(deviceInfo)
  // }, [deviceInfo])

  return (
    <MapContainer
      className="h-[90%] mt-10 mx-2"
      center={[avgLatitude, avgLongitude]}
      zoom={15}
      scrollWheelZoom
      dragging={dragMode}
      attributionControl={false}
      ref={map}
    >
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga"
      />
      {dataForMap.map((coor, index) => {
        const [lat, lng] = coor

        return (
          <Marker position={[lat, lng]} key={index}>
            <Popup>
              {`Thiết bị ${index}`}
              <br /> 
              {`Current coor (${lat},${lng})`}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
