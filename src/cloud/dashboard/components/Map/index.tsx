import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'
import { useTranslation } from 'react-i18next'

import {
  type WSWidgetMapData,
  type MapSeries,
  type DataSeries,
  type TimeSeries,
  type LatestData,
  type EntityId,
} from '../../types'
import type * as z from 'zod'
import { type widgetSchema } from '../Widget'
import L, { type LatLngTuple, type Map } from 'leaflet'
import { type Device } from '@/cloud/orgManagement'
import { toast } from 'sonner'
import { type MapData } from '../ComboBoxSelectDeviceDashboard'

export function MapChart({
  data,
  widgetInfo,
  isEditMode,
  filter,
}: {
  data: MapSeries
  widgetInfo: z.infer<typeof widgetSchema>
  isEditMode: boolean
  filter: MapData[]
}) {
  // streets
  const STREETS_MAP =
    'https://mt0.google.com/vt/lyrs=m&hl=vi&src=app&x={x}&y={y}&z={z}'
  const STREETS_MAP_WO_LABEL =
    'https://mt0.google.com/vt/lyrs=m&hl=vi&src=app&x={x}&y={y}&z={z}&apistyle=s.t%3A0|s.e%3Al|p.v%3Aoff'

  // satellite
  const SATELLITE_MAP =
    'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}&s=Ga'
  const SATELLITE_MAP_WO_LABEL =
    'http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'

  const { t } = useTranslation()
  const [dragMode, setDragMode] = useState(true)
  const [dataForMap, setDataForMap] = useState<Array<LatLngTuple>>([])
  const [deviceDetailInfo, setDeviceDetailInfo] = useState<EntityId[]>([])
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
      const parseData = extractData(dataList, deviceList)
      setDataForMap(parseData)
      setDeviceDetailInfo(deviceList)
    }
  }, [data])

  function extractData(dataList: LatestData[], deviceList: EntityId[]) {
    const availableDeviceList = [
      ...new Set(widgetInfo?.attribute_config?.map((item: any) => item.label)),
    ]
    for (let i = 0; i < deviceList.length; i++) {
      if (!availableDeviceList.includes(deviceList[i].id)) {
        delete deviceList[i]
        delete dataList[i]
      }
    }
    const dataForMapChart: LatLngTuple[] = dataList.map((item, index) => {
      const { longitude, latitude } = item
      if (longitude === null || latitude === null) {
        return [999, 999]
      }
      return [parseFloat(latitude.value), parseFloat(longitude.value)]
    })
    return dataForMapChart
  }

  const [renderedInit, setRenderedInit] = useState(false)

  // function getDefaultPosition() {
  //   const filterData = dataForMap.filter((item: any) => item[0] !== 999)
  //   if (filterData.length === 1) {
  //     const [lat, lng] = filterData[0]
  //     map.current?.setView([lat, lng], 20)
  //     return
  //   }
  //   map.current?.fitBounds(
  //     dataForMap.filter((item: any) => item[0] !== 999),
  //     {
  //       padding: [30, 30],
  //     },
  //   )
  // }
  function getDefaultPosition() {
    const result = dataForMap.find(item => {
      if (!item) return false
      const [lat, lng] = item
      return lat && lng
    })

    if (result) {
      const lat = Number(result.lat)
      const lng = Number(result.lng)
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng] as [number, number]
      }
    }
    return undefined
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
      console.log(deviceDetailInfo)
      console.log('search', searchDevice)
      const deviceIndex = deviceDetailInfo.findIndex(
        device => device?.id === searchDevice.id,
      )
      if (deviceIndex === -1) {
        return
      }
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
        zoom={5}
        scrollWheelZoom
        dragging={dragMode}
        attributionControl={false}
        center={getDefaultPosition() ? getDefaultPosition() : [17, 104]}
        ref={map}
        maxBoundsViscosity={1.0}
        maxBounds={L.latLngBounds(L.latLng(-90, -100), L.latLng(90, 150))}
      >
        <TileLayer url={STREETS_MAP} />
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
            <Marker
              position={[lat, lng]}
              key={index}
              eventHandlers={{
                click: event => {
                  map.current?.setView([lat, lng], 20)
                },
              }}
            >
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
