import { useEffect, useState } from 'react'

import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { flattenData } from '~/utils/misc'

import { type FieldWrapperPassThroughProps } from '~/components/Form'

import { SearchIcon } from '~/components/SVGIcons'
import { type FirmWare, type FirmWareList } from '../../types'

type ComboBoxSelectFirmWareProps = {
  data: FirmWareList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<FirmWare[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectFirmWare({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectFirmWareProps) {
  const [query, setQuery] = useState('')

  const { acc: firmwareFlattenData, extractedPropertyKeys } = flattenData(
    data?.data,
    [
      'id',
      'name',
      'template_name',
      'version',
      'created_time',
      'tag',
      'created_by',
      'template_id',
      'email',
      'description',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    firmwareFlattenData,
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
