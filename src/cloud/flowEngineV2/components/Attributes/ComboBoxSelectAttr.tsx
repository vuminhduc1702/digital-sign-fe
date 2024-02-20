import { useEffect, useState } from 'react'
import { type FieldValues } from 'react-hook-form'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type FieldWrapperPassThroughProps } from '~/components/Form'

import { SearchIcon } from '~/components/SVGIcons'
import { type EntityThing, type EntityThingList } from '~/cloud/customProtocol'

type ComboBoxSelectDeviceProps = {
  data: EntityThingList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<EntityThing[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectThing({
  data,
  setFilteredComboboxData, 
  offset,
  ...props
}: ComboBoxSelectDeviceProps) {
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
