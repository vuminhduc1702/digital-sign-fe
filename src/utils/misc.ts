import { clsx, type ClassValue } from 'clsx'
import { type RefObject } from 'react'
import { twMerge } from 'tailwind-merge'

type DateFormat = {
  date: number | Date
  config?: Intl.DateTimeFormatOptions
}

export const defaultDateConfig: Intl.DateTimeFormatOptions = {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh',
  hourCycle: 'h23',
}
export function getVNDateFormat({ date, config }: DateFormat) {
  let dateConfig = defaultDateConfig
  if (config) {
    dateConfig = config
  }
  if (date == null)
    new Intl.DateTimeFormat('vi-VN', dateConfig).format(new Date())
  return new Intl.DateTimeFormat('vi-VN', dateConfig).format(new Date(date))
}

export function flattenData<T>(
  arr: T[] = [],
  propertyKeys: Array<keyof T>,
  subArr?: keyof T,
): { acc: T[]; extractedPropertyKeys: Array<keyof T> } {
  const extractedPropertyKeys = propertyKeys

  const result = arr?.reduce((acc: T[], obj: T) => {
    const extractedObj = propertyKeys.reduce(
      (result, key) => ({ ...result, [key]: obj[key] }),
      {} as T,
    )

    const stringObj = Object.entries(extractedObj).reduce(
      (newObj, [key, value]) => {
        if (typeof value === 'object' && value != null) {
          return { ...newObj, [key]: JSON.stringify(value) }
        }
        return { ...newObj, [key]: value == null ? value : String(value) }
      },
      {} as T,
    )

    acc.push(stringObj)

    if (subArr && obj[subArr]) {
      acc.push(...flattenData(obj[subArr] as T[], propertyKeys, subArr).acc)
    }

    return acc
  }, [])

  return { acc: result, extractedPropertyKeys }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const scrollToIntro = (Ref: RefObject<HTMLDivElement>) => {
  Ref.current?.scrollIntoView({ behavior: 'smooth' })
}

export function flattenOrgs(input: Org[]) {
  return input?.reduce((acc: Org[], item: Org) => {
    item = Object.assign({}, item)
    acc = acc.concat(item)
    if (item.sub_orgs) {
      acc = acc.concat(flattenOrgs(item.sub_orgs))
      item.sub_orgs = []
    }
    return acc
  }, [])
}
