import type { Attribute, BaseEntity, BasePagination } from '~/types'

export type Device = {
  key: string
  token: string
  template_id?: string
  name: string
  group_id?: string
  group_name?: string
  org_id: string
  org_name?: string
  template_name?: string
  status: 'offline' | 'online' | 'block'
  additional_info: {
    device_id?: string
    imei?: string
    device_manufacture?: string
    protocol?: string
    heartbeat_interval: number
    last_heartbeat: number
    timeout_lifecycle: number
    device_model?: string
    // mqtt_config?:
  }
} & Attribute[] &
  BaseEntity

export type DeviceList = {
  devices: Device[]
} & BasePagination
