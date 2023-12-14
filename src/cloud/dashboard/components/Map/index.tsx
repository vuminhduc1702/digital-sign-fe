import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'

import { type TimeSeries } from '../../types'
import { z } from 'zod'
import { widgetSchema } from '../Widget'
import { Map } from 'leaflet'

export function MapChart({
  data,
  widgetInfo,
  isEditMode
}: {
  data: any
  widgetInfo: z.infer<typeof widgetSchema>
  isEditMode: boolean
}) {
  const [dragMode, setDragMode] = useState(true)
  const [dataForMap, setDataForMap] = useState<Array<any>>([])
  const [avgLatitude, setAvgLatitude] = useState(0)
  const [avgLongitude, setAvgLongitude] = useState(0)
  const [deviceDetailInfo, setDeviceDetailInfo] = useState([])
  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)
  const map = useRef<Map>(null)

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
    const coorDataWithId: { data: number[]; id: string }[] = []

    if (newValuesRef.current) {
      Object.entries(newValuesRef.current).forEach((dataItem, index) => {
        const dataLatIndex = Object.keys(Object.values(dataItem)[1]).findIndex(key => key === 'lat')
        const dataLongIndex = Object.keys(Object.values(dataItem)[1]).findIndex(key => key === 'long')
        const dataLat = Object.values(Object.values(dataItem)[1])[dataLatIndex].value
        const dataLong = Object.values(Object.values(dataItem)[1])[dataLongIndex].value
        coorCurrent = [parseFloat(dataLat), parseFloat(dataLong)]
        const coorIndex = dataCurrent.findIndex(item => item === coorCurrent)
        if (coorIndex === -1) {
          coorDataWithId.push({id: data?.device?.[index].id, data: coorCurrent})
          console.log(coorDataWithId)
          dataCurrent.push(coorCurrent)
        }
      })
      setDataForMap(dataCurrent)
    }
  }

  useEffect(() => {
    if (data.data) {
      prevValuesRef.current = newValuesRef.current || data.data
      if (
        newValuesRef.current !== null
      ) {
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
        dataManipulation()
      }
      if (data.device && data.device.length != 0) {
        setDeviceDetailInfo(data.device)
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
      className="h-[90%] mt-12 mx-2"
      center={[avgLatitude, avgLongitude]}
      zoom={0}
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
        // const deviceName = deviceDetailInfo?.[index].name.value
        const deviceNameArray = deviceDetailInfo?.map((item: TimeSeries) => {
          const deviceData = JSON.parse(widgetInfo.datasource.init_message).entityDataCmds[0].query.entityFilter.entityIds
          const deviceFilter = deviceData.filter((device: any) => device === item.id)
          if (deviceFilter.length != 0) {
            return item.entityName
          }
        })
        return (
          <Marker position={[lat, lng]} key={index}>
            <Popup>
              {deviceDetailInfo && deviceDetailInfo.length > 0 ? `Thiết bị ${deviceNameArray[index]}` : `Thiết bị ${index}`}
              <br /> 
              {`Current coor (${lat},${lng})`}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
