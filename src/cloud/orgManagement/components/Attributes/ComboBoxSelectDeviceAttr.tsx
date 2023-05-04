import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { useParams } from 'react-router-dom'
import { useGetAttrs } from '../../api/attrAPI'

import { type Attribute } from '~/types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectDeviceAttr({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Attribute[]>>
}) {
  const [query, setQuery] = useState('')
  const [offset, setOffset] = useState(0)

  const params = useParams()
  const deviceId = params.deviceId as string
  const { data: attrsData } = useGetAttrs({
    entityType: 'DEVICE',
    entityId: deviceId,
    offset,
  })

  const { acc: attrFlattenData, extractedPropertyKeys } = flattenData(
    attrsData,
    ['last_update_ts', 'attribute_key', 'logged', 'value_type', 'value'],
  )

  const filteredData = filteredComboboxData(
    query,
    attrFlattenData,
    extractedPropertyKeys,
  ) as Attribute[]

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
