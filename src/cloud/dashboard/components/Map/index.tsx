import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'
import { useTranslation } from 'react-i18next'

import {
  type WSWidgetMapData,
  type MapSeries,
  type DataSeries,
  type TimeSeries,
  type LatestData,
} from '../../types'
import { type z } from 'zod'
import { type widgetSchema } from '../Widget'
import { type LatLngTuple, type Map } from 'leaflet'
import { type Device } from '@/cloud/orgManagement'
import { toast } from 'sonner'

export function MapChart({
  data,
  widgetInfo,
  isEditMode,
  filter,
}: {
  data: DataSeries
  widgetInfo: z.infer<typeof widgetSchema>
  isEditMode: boolean
  filter: Device[]
}) {
  const { t } = useTranslation()
  const [dragMode, setDragMode] = useState(true)
  const [dataForMap, setDataForMap] = useState<Array<LatLngTuple>>([])
  const [deviceDetailInfo, setDeviceDetailInfo] = useState<WSWidgetMapData[]>(
    [],
  )
  const map = useRef<Map>(null)
  const searchDevice = filter[0]

  useEffect(() => {
    if (isEditMode) {
      setDragMode(false)
    } else {
      setDragMode(true)
    }
  }, [isEditMode])

  useEffect(() => {
    if (data?.data) {
      const dataList = data.data
      const deviceList = data.device
      const parseData = extractData(dataList)
      setDataForMap(parseData)
      setDeviceDetailInfo(deviceList)
    }
  }, [data])

  function extractData(dataList: LatestData) {
    const dataForMapChart = Object.entries(dataList).reduce(
      (result: Array<LatLngTuple>, [, dataItem]) => {
        if (Object.keys(dataItem).length === 0) {
          const coor: LatLngTuple = [999, 0]
          result.push(coor)
        } else {
          const dataLatIndex = Object.keys(dataItem).findIndex(
            key => key === 'latitude',
          )
          const dataLongIndex = Object.keys(dataItem).findIndex(
            key => key === 'longitude',
          )
          if (!Object.values(dataItem)[dataLatIndex]) {
            const coor: LatLngTuple = [999, 0]
            result.push(coor)
          } else {
            let dataLat = Object.values(dataItem)[dataLatIndex]?.value
            let dataLong = Object.values(dataItem)[dataLongIndex]?.value
            if (dataLat !== null && dataLong !== null) {
              const coor: LatLngTuple = [
                parseFloat(dataLat),
                parseFloat(dataLong),
              ]
              result.push(coor)
            }
          }
        }
        return result
      },
      [],
    )
    return dataForMapChart
  }

  const [renderedInit, setRenderedInit] = useState(false)

  function getDefaultPosition() {
    const filterData = dataForMap.filter((item: any) => item[0] !== 999)
    if (filterData.length === 1) {
      const [lat, lng] = filterData[0]
      map.current?.setView([lat, lng], 20)
      return
    }
    map.current?.fitBounds(
      dataForMap.filter((item: any) => item[0] !== 999),
      {
        padding: [30, 30],
      },
    )
  }

  useEffect(() => {
    if (!renderedInit && dataForMap.length > 0) {
      getDefaultPosition()
      setRenderedInit(true)
      return
    }
    if (filter.length > 1 || filter.length === 0 || filter[0] === undefined) {
      return
    }
    if (!searchDevice) {
      getDefaultPosition()
      return
    } else {
      if (dataForMap.length === 0) {
        return
      }
      // find index of device in dataForMap
      const deviceIndex = deviceDetailInfo.findIndex(
        device => device.id === searchDevice.id,
      )
      const [lat, lng] = dataForMap[deviceIndex]
      if (lat === 999) {
        toast.error(t('cloud:dashboard.map.device_not_found'))
        return
      }
      map.current?.setView([lat, lng], 20)
    }
  }, [dataForMap, searchDevice])

  return (
    <>
      <MapContainer
        className="z-0 mx-2 mt-12 h-[90%]"
        zoom={0}
        scrollWheelZoom
        dragging={dragMode}
        attributionControl={false}
        ref={map}
      >
        <TileLayer url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga" />
        {dataForMap.map((coor, index) => {
          const [lat, lng] = coor
          if (lat === 999) {
            return
          }
          const deviceNameArray = deviceDetailInfo?.map((item: any) => {
            const deviceData = JSON.parse(widgetInfo.datasource.init_message)
              .entityDataCmds[0].query.entityFilter.entityIds
            const deviceFilter = deviceData.filter(
              (device: any) => device === item.id,
            )
            if (deviceFilter.length != 0) {
              return item.entityName
            }
          })
          return (
            <Marker position={[lat, lng]} key={index}>
              <Popup>
                {deviceDetailInfo && deviceDetailInfo.length > 0
                  ? `Thiết bị ${deviceNameArray[index]} (${lat},${lng})`
                  : `Thiết bị ${index} (${lat},${lng})`}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </>
  )
}
