import { useEffect, useState } from 'react'

import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useGetPlans } from '../api'

import { type PlanFilter } from '../types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectPackage({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<PlanFilter[]>>
}) {
  const [query, setQuery] = useState('')

  const { id: projectId } = storage.getProject()
  const { data } = useGetPlans({ projectId })

  const { acc: planFlattenData, extractedPropertyKeys } = flattenData(
    data?.data,
    ['id', 'name', 'description'],
  )

  const filteredData = filteredComboboxData(
    query,
    planFlattenData,
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
