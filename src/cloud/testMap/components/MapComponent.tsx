import { useRef, useState } from 'react'
import { type LatLngTuple, type Map } from 'leaflet'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from 'react-leaflet'
import { type MapInfo } from '../types'
import MapSetting from './MapSetting'
import ItemInfo from './ItemInfo'

type MapProps = {
  data: MapInfo[]
  type: string
}

export default function MapComponent({ data, type }: MapProps) {
  // google street
  const GOOGLE_STREETS =
    'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga}'

  // google satellite
  const GOOGLE_SATELLITE = 'http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
  const map = useRef<Map>(null)

  const [dataForMap, setDataForMap] = useState<Array<LatLngTuple>>([
    [0, 0],
    [20, 12],
  ])

  // type of map
  // 0 - google streets
  // 1 - google satellite
  const [mapType, setMapType] = useState<number>(0)
  const [isLabel, setIsLabel] = useState<boolean>(false)

  return (
    <div className="relative h-[600px] w-[600px]">
      <MapContainer
        className="z-10 h-full w-full rounded-lg"
        zoom={10}
        zoomControl={false}
        scrollWheelZoom
        attributionControl={false}
        ref={map}
        center={[10, 10]}
        // style={{ height: '500px', width: '500px' }}
      >
        <TileLayer url={mapType === 0 ? GOOGLE_STREETS : GOOGLE_SATELLITE} />
        <ZoomControl position={'bottomright'} />
        {data.map((item, index) => {
          const lat = Number(item.attributes?.latitude_gw)
          const lng = Number(item.attributes?.longitude_gw)
          console.log(item)
          console.log(lat)
          console.log(lng)

          if (lat && lng) {
            return (
              <Marker key={index} position={[lat, lng]}>
                <Popup>
                  <ItemInfo {...item} />
                </Popup>
              </Marker>
            )
          }
        })}
      </MapContainer>
      <MapSetting
        className="absolute right-1 top-1"
        isLabel={isLabel}
        setIsLabel={setIsLabel}
        mapType={mapType}
        setMapType={setMapType}
      />
    </div>
  )
}
