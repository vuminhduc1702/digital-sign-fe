import { useEffect, useState } from 'react'
import { type FieldValues } from 'react-hook-form'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type DeviceList, type Device } from '../../types'
import {
  type FieldWrapperPassThroughProps,
  type ControllerPassThroughProps,
} from '~/components/Form'

import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectDeviceProps<TFormValues extends FieldValues> = {
  data: DeviceList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Device[]>>
  offset?: number
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues>

export function ComboBoxSelectDevice<TFormValues extends FieldValues>({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectDeviceProps<TFormValues>) {
  const [query, setQuery] = useState('')

  const { acc: deviceFlattenData, extractedPropertyKeys } = flattenData(
    data?.devices || [],
    ['id', 'name', 'group_name', 'template_name', 'created_time', 'org_name'],
  )

  const filteredData = filteredComboboxData(
    query,
    deviceFlattenData,
    extractedPropertyKeys,
  ) as Device[]

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
