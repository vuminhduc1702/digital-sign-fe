import { type BasePagination } from '~/types'
import { type AttrList } from '~/utils/schemaValidation'

export type Template = {
  id: string
  name: string
  rule_chain_id: string
  provision_key: string
  provision_secret: string
  created_time: number
  attributes: AttrList
}

export type TemplateList = {
  templates: Template[]
} & BasePagination


export type RuleChain = {
  id: {
    entityType: string
    id: string
  }
  name: string
}

export type RulechainList = {
  data: RuleChain[]
  totalPages: number
  totalElements: number
  hasNext: boolean
}
