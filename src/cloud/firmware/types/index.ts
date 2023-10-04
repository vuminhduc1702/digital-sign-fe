import type { BasePagination } from '~/types'

export type FirmWare = {
  id: string
  project_id: string
  name: string
  version: string
  version_id: string
  tag: string
  file_name: string
  file_size: number
  checksum_algorithm: string
  checksum: string
  created_time: number
  created_by: string
  template_id: string
  template_name: string
  description: string
  link: string
  email: string
}

export type FirmWareList = {
  data: FirmWare[]
} & BasePagination
