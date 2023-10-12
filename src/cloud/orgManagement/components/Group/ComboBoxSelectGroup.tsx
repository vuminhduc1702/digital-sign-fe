import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import {
  ComboBoxBase,
  type ComboBoxBasePassThroughProps,
  filteredComboboxData,
} from '~/components/ComboBox'

import { type GroupList, type Group } from '../../types'
import { type FieldWrapperPassThroughProps } from '~/components/Form'

import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectGroupProps = {
  data: GroupList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Group[]>>
  offset?: number
} & FieldWrapperPassThroughProps &
  ComboBoxBasePassThroughProps<Group>

export function ComboBoxSelectGroup({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectGroupProps) {
  const [query, setQuery] = useState('')

  const { acc: groupFlattenData, extractedPropertyKeys } = flattenData(
    data?.groups,
    ['id', 'name', 'entity_type', 'org_name', 'organization'],
  )

  const filteredData = filteredComboboxData(
    query,
    groupFlattenData,
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
