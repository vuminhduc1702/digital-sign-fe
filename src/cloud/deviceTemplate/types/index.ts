import { type BasePagination } from '~/types'

export type Template = {
  id: string
  name: string
  rule_chain_id: string
  provision_key: string
  provision_secret: string
  created_time: number
}

export type TemplateList = {
  templates: Template[]
} & BasePagination
