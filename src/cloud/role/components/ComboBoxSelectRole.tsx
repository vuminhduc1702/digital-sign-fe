import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { useGetRoles } from '../api'
import storage from '~/utils/storage'

import { type Role } from '../types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectRole({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Role[]>>
}) {
  const [query, setQuery] = useState('')

  const { id: projectId } = storage.getProject()
  const { data } = useGetRoles({ projectId })

  const { acc: roleFlattenData, extractedPropertyKeys } = flattenData(
    data?.roles,
    ['id', 'name', 'policies'],
  )

  const filteredData = filteredComboboxData(
    query,
    roleFlattenData,
    extractedPropertyKeys,
  ) as Role[]

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
