import { useEffect, useState } from 'react'

import { flattenData } from '@/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '@/components/ComboBox'

import { type FieldWrapperPassThroughProps } from '@/components/Form'
import { type Device, type DeviceList } from '@/cloud/orgManagement'

import { SearchIcon } from '@/components/SVGIcons'

type ComboBoxSelectDeviceDashboardProps = {
  data: DeviceList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Device[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectDeviceDashboard({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectDeviceDashboardProps) {
  const [query, setQuery] = useState('')

  const { acc: deviceFlattenData, extractedPropertyKeys } = flattenData(data, [
    'id',
    'entityName',
  ])

  const filteredData = filteredComboboxData(
    query,
    deviceFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query])

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
