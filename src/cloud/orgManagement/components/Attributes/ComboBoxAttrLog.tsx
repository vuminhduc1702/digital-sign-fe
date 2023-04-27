import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type DeviceAttrLog, type DeviceAttrLogList } from '../../api/attrAPI'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxAttrLog({
  attrLogData,
  setFilteredComboboxData,
  ...props
}: {
  attrLogData: DeviceAttrLogList
  setFilteredComboboxData?: React.Dispatch<
    React.SetStateAction<DeviceAttrLog[]>
  >
}) {
  const [query, setQuery] = useState('')

  const { acc: attrLogFlattenData, extractedPropertyKeys } = flattenData(
    attrLogData?.logs,
    ['ts', 'attribute_key', 'value'],
  )

  const filteredData = filteredComboboxData(
    query,
    attrLogFlattenData,
    extractedPropertyKeys,
  ) as DeviceAttrLog[]

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, attrLogData])

  return (
    <ComboBoxBase
      data={filteredData}
      extractedPropertyKeys={extractedPropertyKeys}
      query={query}
      setQuery={setQuery}
      setFilteredComboboxData={setFilteredComboboxData}
      startIcon={<SearchIcon width={16} height={16} viewBox="0 0 16 16" />}
      {...props}
    />
  )
}
