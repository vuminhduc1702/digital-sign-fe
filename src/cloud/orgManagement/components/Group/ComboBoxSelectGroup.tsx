import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type GroupList, type Group } from '../../types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectGroup({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: {
  data: GroupList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Group[]>>
  offset?: number
}) {
  const [query, setQuery] = useState('')

  const { acc: groupFlattenData, extractedPropertyKeys } = flattenData(
    data?.groups || [],
    ['id', 'name', 'entity_type'],
  )

  const filteredData = filteredComboboxData(
    query,
    groupFlattenData,
    extractedPropertyKeys,
  ) as Group[]

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
