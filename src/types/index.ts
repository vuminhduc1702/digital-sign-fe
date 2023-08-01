export type BaseEntity = {
  id: string
  created_by: string
  created_time: number
}

export type BasePagination = {
  total: number
  offset: number
  limit: number
}

export type BaseTablePagination = {
  offset: number
  setOffset: React.Dispatch<React.SetStateAction<number>>
  total: number
  isPreviousData: boolean
}

export type BaseAPIRes = {
  code: 0 | number
  message: 'success' | string
}

export type Attribute = {
  attribute_key: string
  logged: boolean
  value: string | number | boolean
  value_as_string?: string
  last_update_ts: number
  value_type: 'STR' | 'BOOL' | 'LONG' | 'DBL' | 'JSON'
}
