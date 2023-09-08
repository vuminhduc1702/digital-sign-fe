import { useEffect, useState } from 'react'
import { type FieldValues } from 'react-hook-form'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import {
  type FieldWrapperPassThroughProps,
  type ControllerPassThroughProps,
} from '~/components/Form'

import { SearchIcon } from '~/components/SVGIcons'
import { type EntityThing, type EntityThingList } from '~/cloud/customProtocol'

type ComboBoxSelectDeviceProps<TFormValues extends FieldValues> = {
  data: EntityThingList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<EntityThing[]>>
  offset?: number
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues>

export function ComboBoxSelectThing<TFormValues extends FieldValues>({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectDeviceProps<TFormValues>) {
  const [query, setQuery] = useState('')

  const { acc: thingFlattenData, extractedPropertyKeys } = flattenData(
    data?.list,
    [
      'id',
      'name',
      'type',
      'project_id',
      'template_name',
      'create_ts',
      'description',
      'total_service',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    thingFlattenData,
    extractedPropertyKeys,
  ) as EntityThing[]

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
