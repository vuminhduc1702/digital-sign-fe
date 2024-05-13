import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/misc'
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
import L, { type LatLngTuple, type Map, type Marker as TMarker } from 'leaflet'
import { type Device } from '@/cloud/orgManagement'
import { toast } from 'sonner'
import { type MapData } from '../ComboBoxSelectDeviceDashboard'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { ComboBoxSelectDeviceDashboard } from '../ComboBoxSelectDeviceDashboard'
import { MapSettingBrand } from './MapSettingBrand'
import { MapSettingType } from './MapSettingType'
import { MapFullscreen } from './MapFullscreen'

export function MapChart({
  data,
  widgetInfo,
  isEditMode,
  setIsMapFullscreen,
}: {
  data: MapSeries
  widgetInfo: z.infer<typeof widgetSchema>
  isEditMode: boolean
  setIsMapFullscreen?: React.Dispatch<React.SetStateAction<boolean>>
}) {
  // google map
  const STREETS_MAP =
    'https://mt0.google.com/vt/lyrs=m&hl=vi&src=app&x={x}&y={y}&z={z}'
  const STREETS_MAP_WO_LABEL =
    'https://mt0.google.com/vt/lyrs=m&hl=vi&src=app&x={x}&y={y}&z={z}&apistyle=s.t%3A0|s.e%3Al|p.v%3Aoff'

  // google map satellite
  const SATELLITE_MAP =
    'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}&s=Ga'
  const SATELLITE_MAP_WO_LABEL =
    'http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'

  // open street map
  const OPEN_STREET_MAP = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'
  // open street map satellite
  const OPEN_STREET_MAP_SATELLITE =
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  const { t } = useTranslation()
  const [dragMode, setDragMode] = useState(true)
  // 0 - google map, 1 - open street map
  const [mapBrand, setMapBrand] = useState(0)
  // 0 - streets map, 1 - satellite map
  const [mapType, setMapType] = useState(0)
  const [mapLabel, setMapLabel] = useState<boolean>(true)
  const [dataForMap, setDataForMap] = useState<Array<LatLngTuple>>([])
  const [deviceDetailInfo, setDeviceDetailInfo] = useState<EntityId[]>([])
  const map = useRef<Map>(null)
  const markerRefs = useRef<Array<TMarker>>([])
  const [filteredComboboxDataMap, setFilteredComboboxDataMap] = useState<
    MapData[]
  >([])

  // fullscreen for map
  const fullMap = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [mapStyle, setMapStyle] = useState<string>()
  //

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
      const { longtitude, latitude } = item
      if (longtitude === null || latitude === null) {
        return [999, 999]
      }
      return [
        parseFloat(latitude?.value ?? 0),
        parseFloat(longtitude?.value ?? 0),
      ]
    })
    return dataForMapChart
  }

  const [renderedInit, setRenderedInit] = useState(false)

  // get device search list
  function getMapDeviceList(widgetInfo: any) {
    const result: EntityId[] = []
    widgetInfo?.attribute_config?.map((item: any) => {
      const entityName = item.deviceName
      const id = item.label
      if (result.findIndex(entity => entity.id === id) === -1 && id) {
        result.push({
          entityName: entityName,
          entityType: 'DEVICE',
          id: id,
        })
      }
    })
    return result
  }

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
    if (
      filteredComboboxDataMap.length > 1 ||
      filteredComboboxDataMap.length === 0 ||
      filteredComboboxDataMap[0] === undefined
    ) {
      return
    }

    if (!filteredComboboxDataMap[0]) {
      getDefaultPosition()
      return
    } else {
      if (dataForMap.length === 0) {
        return
      }
      // find index of device in dataForMap
      const deviceIndex = deviceDetailInfo.findIndex(
        device => device?.id === filteredComboboxDataMap[0].id,
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

      markerRefs.current.map((markerRef, index) => {
        if (!markerRef?.getLatLng()) {
          return
        }
        const { lat: markerLat, lng: markerLng } = markerRef.getLatLng()
        if (markerLat === lat && markerLng === lng) {
          const marker = markerRef
          marker.openPopup()
        }
      })
    }
  }, [dataForMap, filteredComboboxDataMap])

  // map fullscreen
  useEffect(() => {
    setTimeout(() => {
      map.current?.invalidateSize()
    }, 1)
    setIsMapFullscreen && setIsMapFullscreen(isFullscreen)
  }, [isFullscreen])

  return (
    <div className={cn('h-full', mapStyle ? mapStyle : '')} ref={fullMap}>
      <div className="absolute right-[10%] top-0 mr-8 mt-2 flex gap-x-2">
        <ComboBoxSelectDeviceDashboard
          setFilteredComboboxData={setFilteredComboboxDataMap}
          data={getMapDeviceList(widgetInfo)}
        />
      </div>
      <MapContainer
        className={cn(`z-0 mx-2 mt-12 h-[90%]`)}
        zoom={5}
        scrollWheelZoom
        dragging={dragMode}
        attributionControl={false}
        center={getDefaultPosition() ? getDefaultPosition() : [17, 104]}
        ref={map}
        maxBoundsViscosity={1.0}
        maxBounds={L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 150))}
      >
        <TileLayer
          url={
            mapBrand === 0
              ? mapType === 0
                ? mapLabel
                  ? STREETS_MAP
                  : STREETS_MAP_WO_LABEL
                : mapLabel
                  ? SATELLITE_MAP
                  : SATELLITE_MAP_WO_LABEL
              : mapType === 0
                ? OPEN_STREET_MAP
                : OPEN_STREET_MAP_SATELLITE
          }
        />
        <MarkerClusterGroup disabledCusteringAtZoom={18}>
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
                ref={ele => {
                  if (ele) {
                    markerRefs.current[index] = ele
                  }
                }}
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
                    ? `Thiết bị ${deviceNameArray[index]}`
                    : `Thiết bị ${index}`}
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
      <MapSettingBrand mapType={mapBrand} setMapType={setMapBrand} />
      <MapSettingType
        mapType={mapType}
        setMapType={setMapType}
        isMapLabel={mapLabel}
        setIsMapLabel={setMapLabel}
        mapBrand={mapBrand}
        setMapBrand={setMapBrand}
      />
      <MapFullscreen
        isFullscreen={isFullscreen}
        setFullscreen={setIsFullscreen}
      />
    </div>
  )
}
