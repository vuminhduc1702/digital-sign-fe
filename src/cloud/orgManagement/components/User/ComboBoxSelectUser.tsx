import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type UserInfo, type UserList } from '~/features/auth'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectUser({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: {
  data: UserList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<UserInfo[]>>
  offset?: number
}) {
  const [query, setQuery] = useState('')

  const { acc: userFlattenData, extractedPropertyKeys } = flattenData(
    data?.users,
    ['user_id', 'name', 'email', 'role_name', 'activate'],
  )

  const filteredData = filteredComboboxData(
    query,
    userFlattenData,
    extractedPropertyKeys,
  ) as UserInfo[]

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
