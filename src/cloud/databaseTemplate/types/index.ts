import { type BasePagination } from '~/types'

export type DataBase = {
  id: string
  name: string
  table_name: string
  provision_key: string
  provision_secret: string
  created_time: number
}

export type DataBaseList = {
  data: DataBase[]
} & BasePagination

export type FieldsList = {
  name: string
  type: any
}

export type FieldsColumn = {
  name: string
}

export type FieldsRows = {
  [key: string]: any
}
