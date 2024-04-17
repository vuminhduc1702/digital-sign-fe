export type MapAttribute = {
  status_gw?: 'online' | 'offline'
  status_lamp?: 'online' | 'offline'
  on_off?: 'on' | 'off'
  last_connected?: number
  last_update?: number
  latitude_gw?: string
  longitude_gw?: string
  latitude_lamp?: string
  longitude_lamp?: string
  power?: string
}

export type MapInfo = {
  id: string
  name: string
  type: string
  serial: string
  attributes?: MapAttribute
}
