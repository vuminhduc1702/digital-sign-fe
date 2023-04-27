import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type Org } from '~/layout/MainLayout/types'
import { type Device } from '../../types'
import { type Attribute } from '~/types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectAttr({
  attrData,
  setFilteredComboboxData,
  ...props
}: {
  attrData: Org | Device
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Attribute[]>>
}) {
  const [query, setQuery] = useState('')

  const { acc: attrFlattenData, extractedPropertyKeys } = flattenData(
    attrData?.attributes,
    ['last_update_ts', 'attribute_key', 'logged', 'value_type', 'value'],
  )

  const filteredData = filteredComboboxData(
    query,
    attrFlattenData,
    extractedPropertyKeys,
  ) as Attribute[]

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, attrData])

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
