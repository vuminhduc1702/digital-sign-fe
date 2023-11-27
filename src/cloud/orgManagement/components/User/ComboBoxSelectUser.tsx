import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type UserInfo, type UserList } from '../../api/userAPI'

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
    [
      'user_id',
      'name',
      'email',
      'role_name',
      'activate',
      'org_id',
      'org_name',
      'role_name',
      'role_id',
      'phone',
      'profile',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    userFlattenData,
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
