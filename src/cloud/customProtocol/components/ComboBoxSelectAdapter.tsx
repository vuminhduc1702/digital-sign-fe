import { useEffect, useState } from 'react'
import { type FieldValues } from 'react-hook-form'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import {
  type FieldWrapperPassThroughProps,
  type ControllerPassThroughProps,
} from '~/components/Form'
import { type Adapter, type AdapterList } from '../types'

import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectAdapterProps<TFormValues extends FieldValues> = {
  data: AdapterList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Adapter[]>>
  offset?: number
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues>

export function ComboBoxSelectAdapter<TFormValues extends FieldValues>({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectAdapterProps<TFormValues>) {
  const [query, setQuery] = useState('')

  const { acc: adapterFlattenData, extractedPropertyKeys } = flattenData(
    data?.adapters || [],
    [
      'id',
      'name',
      'protocol',
      'thing_id',
      'handle_service',
      'host',
      'port',
      'topic',
      'content_type',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    adapterFlattenData,
    extractedPropertyKeys,
  ) as Adapter[]

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
