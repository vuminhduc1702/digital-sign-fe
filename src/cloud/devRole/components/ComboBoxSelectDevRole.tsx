import { useEffect, useState } from 'react'

import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { flattenData } from '~/utils/misc'

import { type Role } from '../types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectDevRole({
  data,
  setFilteredComboboxData,
  ...props
}: {
  data: Role[]
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Role[]>>
}) {
  const [query, setQuery] = useState('')

  const { acc: roleFlattenData, extractedPropertyKeys } = flattenData(data, [
    'id',
    'name',
    'policies',
    'role_type',
  ])

  const filteredData = filteredComboboxData(
    query,
    roleFlattenData,
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
