import { type BasePagination } from '~/types'

export type Project = {
  id: string
  name: string
  image: string
  description: string
  app_key: string
  app_secret: string
  sms_config: {
    type: string
    config: null
    content: string
    reset_password_content?: string
  }
}

export type ProjectList = {
  projects: Project[]
} & BasePagination
