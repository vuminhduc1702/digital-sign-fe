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

export function flattenData<T extends PropertyValuePair<K>, K extends string>(
  arr: T[],
  propertyKeys: K[],
  subArr?: keyof T,
): { acc: PropertyValuePair<K>[]; extractedPropertyKeys: K[] } {
  const extractedPropertyKeys = propertyKeys

  const result = arr?.reduce((acc: PropertyValuePair<string>[], obj: T) => {
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
      acc.push(...flattenData(obj[subArr], propertyKeys, subArr).acc)
    }

    return acc
  }, [])

  return { acc: result, extractedPropertyKeys }
}
