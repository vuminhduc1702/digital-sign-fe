import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type FieldWrapperPassThroughProps } from '~/components/Form'
import { type Adapter, type AdapterList } from '../types'

import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectAdapterProps = {
  data: AdapterList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Adapter[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectAdapter({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectAdapterProps) {
  const [query, setQuery] = useState('')

  const { acc: adapterFlattenData, extractedPropertyKeys } = flattenData(
    data?.adapters,
    [
      'id',
      'name',
      'protocol',
      'thing_id',
      'handle_service',
      'host',
      'port',
      'content_type',
      'configuration',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    adapterFlattenData,
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
