import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { type EntityType, useGetAttrs } from '../../api/attrAPI'

import { type Attribute } from '~/types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectAttr({
  entityId,
  entityType,
  setFilteredComboboxData,
  ...props
}: {
  entityId: string
  entityType: EntityType
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Attribute[]>>
}) {
  const [query, setQuery] = useState('')

  const { data: attrsData } = useGetAttrs({ entityType, entityId })

  const { acc: attrFlattenData, extractedPropertyKeys } = flattenData(
    attrsData?.attributes,
    ['last_update_ts', 'attribute_key', 'logged', 'value_type', 'value'],
  )

  const filteredData = filteredComboboxData(
    query,
    attrFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, attrsData])

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
