import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'

import { type TimeSeries } from '../../types'
import { z } from 'zod'
import { widgetSchema } from '../Widget'

export function Map({
  data,
  widgetInfo,
  isEditMode,
  deviceInfo
}: {
  data: any
  widgetInfo: z.infer<typeof widgetSchema>
  isEditMode: boolean
  deviceInfo?: any
}) {
  const [dragMode, setDragMode] = useState(true)
  const [dataForMap, setDataForMap] = useState<Array<any>>([])
  const [avgLatitude, setAvgLatitude] = useState(0)
  const [avgLongitude, setAvgLongitude] = useState(0)
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)
  const map = useRef(null)

  // const fakeCoor = [
  //   [21.0285, 105.8542],
  //   [21.0374, 105.8497],
  //   [21.0369, 105.8511],
  //   [21.04, 105.8311],
  //   [21.0402, 105.8475],
  //   [21.0245, 105.8473],
  // ]

  useEffect(() => {
    if (isEditMode) {
      setDragMode(false)
    } else {
      setDragMode(true)
    }
  }, [isEditMode])

  function dataManipulation() {
    const dataCurrent: number[][] = []
    let coorCurrent: number[] = []
    const test: { data: number[]; id: string }[] = []

    if (newValuesRef.current) {
      Object.entries(newValuesRef.current).forEach(dataItem => {
        const dataLatIndex = Object.keys(Object.values(dataItem)[1]).findIndex(key => key === 'lat')
        const dataLongIndex = Object.keys(Object.values(dataItem)[1]).findIndex(key => key === 'long')
        const dataLat = Object.values(Object.values(dataItem)[1])[dataLatIndex].value
        const dataLong = Object.values(Object.values(dataItem)[1])[dataLongIndex].value
        coorCurrent = [parseFloat(dataLat), parseFloat(dataLong)]
        const coorIndex = dataCurrent.findIndex(item => item[0] === coorCurrent[0])
        if (coorIndex === -1) {
          const mapping = {id: deviceInfo?.name?.[0]?.value}
          test.push({...mapping, data: coorCurrent})
          dataCurrent.push(coorCurrent)
        }
      })
      setDataForMap(dataCurrent)
    }
  }

  useEffect(() => {
    console.log(data)
    if (data.data) {
      prevValuesRef.current = newValuesRef.current || data.data
      if (
        newValuesRef.current !== null
      ) {
        // console.log(data)
        // data.data.forEach((item: any, index: number) => {
        //   // console.log(key)
        //   // console.log(value)
        //   if (
        //     newValuesRef.current[key] != null &&
        //     newValuesRef.current[key] === prevValuesRef.current?.[key]
        //   ) {
        //     newValuesRef.current[key] = [...value]
        //   } else {
        //     prevValuesRef.current = data
        //   }
        //   dataManipulation()
        // })
      } else {
        newValuesRef.current = data.data
        // console.log('data: ', newValuesRef.current)
        dataManipulation()
      }
    }
  }, [data])

  useEffect(() => {
    const avgLat = dataForMap.reduce((sum, [lat]) => sum + lat, 0) / dataForMap.length
    const avgLong = dataForMap.reduce((sum, [, lng]) => sum + lng, 0) / dataForMap.length
    setAvgLatitude(avgLat)
    setAvgLongitude(avgLong)
    if (dataForMap.length >= 2) {
      map.current?.setView([avgLat, avgLong], 3)
    } else {
      map.current?.setView([avgLat, avgLong], 15)
    }
  }, [dataForMap])

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
        const deviceName = data.device?.[index].name.value
        return (
          <Marker position={[lat, lng]} key={index}>
            <Popup>
              {data.device?.[index] && data ? `Thiết bị ${data.device?.[index].name.value}` : `Thiết bị ${deviceName}`}
              <br /> 
              {`Current coor (${lat},${lng})`}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
