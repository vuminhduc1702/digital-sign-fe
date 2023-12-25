import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'

import { WSWidgetMapData, type MapSeries, type TimeSeries } from '../../types'
import { type z } from 'zod'
import { type widgetSchema } from '../Widget'
import { type Map } from 'leaflet'

export function MapChart({
  data,
  widgetInfo,
  isEditMode,

}: {
  data: MapSeries
  widgetInfo: z.infer<typeof widgetSchema>
  isEditMode: boolean
}) {
  const [dragMode, setDragMode] = useState(true)
  const [dataForMap, setDataForMap] = useState<Array<number[]>>([])
  const [avgLatitude, setAvgLatitude] = useState(0)
  const [avgLongitude, setAvgLongitude] = useState(0)
  const [deviceDetailInfo, setDeviceDetailInfo] = useState<WSWidgetMapData[]>([])
  const newValuesRef = useRef<MapSeries | null>(null)
  const prevValuesRef = useRef<MapSeries | null>(null)
  const map = useRef<Map>(null)

  useEffect(() => {
    if (isEditMode) {
      setDragMode(false)
    } else {
      setDragMode(true)
    }
  }, [isEditMode])

  function dataManipulation() {
    setTimeout(() => {
      if (newValuesRef.current?.data) {
        const dataForMapChart = Object.entries(newValuesRef.current.data).reduce((result: Array<number[]>, [,dataItem]) => {
          const dataLatIndex = Object.keys(dataItem).findIndex(key => key === 'lat')
          const dataLongIndex = Object.keys(dataItem).findIndex(key => key === 'long')
          let dataLat = Object.values(dataItem)[dataLatIndex].value
          let dataLong = Object.values(dataItem)[dataLongIndex].value
          if (dataLat !== null && dataLong !== null) {
            const coor = [parseFloat(dataLat), parseFloat(dataLong)]
            result.push(coor)
          }
          return result
        }, [])
        setDataForMap(dataForMapChart)
      }
    }, 100)
  }

  useEffect(() => {
    if (data.data) {
      prevValuesRef.current = newValuesRef.current || data
      if (
        newValuesRef.current !== null
      ) {
        const deviceIndex = newValuesRef.current.device.findIndex(device => device.id === data.device[0].id)
        if (deviceIndex !== -1 && data.data[0]) {
          for (const [key, newData] of Object.entries(data.data[0])) {
            if (key !== null && newData !== null && newValuesRef.current?.data?.[deviceIndex]?.[key] === prevValuesRef.current?.data?.[deviceIndex]?.[key]) {
              setTimeout(() => {
                Object.assign(newValuesRef.current?.data?.[deviceIndex]?.[key], newData)
              }, 100)
            }
          }
        } else {
          prevValuesRef.current = data
        }
        dataManipulation()
      } else {
        newValuesRef.current = data
        dataManipulation()
      }
    }
    if (data.device && data.device.length !== 0 && data.device.length === newValuesRef.current?.device.length) {
      setDeviceDetailInfo(data.device)
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
      className="mx-2 mt-12 h-[90%] z-0"
      center={[avgLatitude, avgLongitude]}
      zoom={0}
      scrollWheelZoom
      dragging={dragMode}
      attributionControl={false}
      ref={map}
    >
      <TileLayer
        url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga"
      />
      {dataForMap.map((coor, index) => {
        const [lat, lng] = coor
        const deviceNameArray = deviceDetailInfo?.map((item: any) => {
          const deviceData = JSON.parse(widgetInfo.datasource.init_message).entityDataCmds[0].query.entityFilter.entityIds
          const deviceFilter = deviceData.filter((device: any) => device === item.id)
          if (deviceFilter.length != 0) {
            return item.entityName
          }
        })
        return (
          <Marker position={[lat, lng]} key={index}>
            <Popup>
              {deviceDetailInfo && deviceDetailInfo.length > 0 ? `Thiết bị ${deviceNameArray[index]} (${lat},${lng})` : `Thiết bị ${index} (${lat},${lng})`}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
