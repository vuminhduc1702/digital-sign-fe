import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { SearchIcon } from '~/components/SVGIcons'
import { type ThingService } from '../../types'

export function ComboBoxSelectThingService({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: {
  data: ThingService[]
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<ThingService[]>>
  offset?: number
}) {
  const [query, setQuery] = useState('')

  const { acc: thingServiceFlattenData, extractedPropertyKeys } = flattenData(
    data,
    ['id', 'name', 'create_ts', 'description', 'input', 'output'],
  )

  const filteredData = filteredComboboxData(
    query,
    thingServiceFlattenData,
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
