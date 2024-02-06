import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { useGetDataBases } from '../api'
import storage from '~/utils/storage'

import { type DataBase } from '../types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectDataBase({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<DataBase[]>>
}) {
  const [query, setQuery] = useState('')

  const projectId = storage.getProject()?.id
  const { data } = useGetDataBases({ projectId })

  const { acc: templateFlattenData, extractedPropertyKeys } = flattenData(
    data?.data,
    [
      'id',
      'table_name',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    templateFlattenData,
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
