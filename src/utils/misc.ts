import { useTranslation } from 'react-i18next'

import { useNotificationStore } from '~/stores/notifications'

export function getVNDateFormat(date: number | Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
    hourCycle: 'h23',
  }).format(new Date(date))
}

export type PropertyValuePair<K extends string> = {
  [key in K]: unknown
}

type flattenDataStringReturn<K extends string> = {
  [key in K]: string
}

export function flattenData<
  T extends Partial<PropertyValuePair<K>>,
  K extends Extract<keyof T, string>,
>(
  arr: T[],
  propertyKeys: K[],
  subArr?: keyof T,
): { acc: flattenDataStringReturn<K>[]; extractedPropertyKeys: K[] } {
  const extractedPropertyKeys = propertyKeys

  const result = arr?.reduce(
    (acc: flattenDataStringReturn<string>[], obj: T) => {
      const extractedObj = propertyKeys.reduce(
        (result, key) => ({ ...result, [key]: obj[key as keyof T] }),
        {},
      )
      const stringObj = Object.entries(extractedObj).reduce(
        (newObj, [key, value]) => {
          if (typeof value === 'object' && value != null) {
            return { ...newObj, [key]: JSON.stringify(value) }
          }
          return { ...newObj, [key]: String(value) }
        },
        {},
      )
      acc.push(stringObj)

      if (subArr && obj[subArr]) {
        acc.push(...flattenData(obj[subArr] as T[], propertyKeys, subArr).acc)
      }

      return acc
    },
    [],
  )

  return { acc: result, extractedPropertyKeys }
}

export function useCopyId() {
  const { t } = useTranslation()
  const { addNotification } = useNotificationStore()

  async function handleCopyId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      addNotification({
        type: 'success',
        title: t('cloud.org_manage.org_map.copy_success'),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return handleCopyId
}
