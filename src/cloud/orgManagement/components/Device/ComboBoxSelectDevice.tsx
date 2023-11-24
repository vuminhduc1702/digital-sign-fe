import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type DeviceList, type Device } from '../../types'
import { type FieldWrapperPassThroughProps } from '~/components/Form'

import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectDeviceProps = {
  data: DeviceList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Device[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectDevice({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectDeviceProps) {
  const [query, setQuery] = useState('')

  const { acc: deviceFlattenData, extractedPropertyKeys } = flattenData(
    data?.devices,
    [
      'id',
      'name',
      'group_name',
      'template_name',
      'created_time',
      'org_name',
      'key',
      'org_id',
      'status',
      'attributes',
      'created_by',
      'group_id',
      'template_id',
      'token',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    deviceFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, data])

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
