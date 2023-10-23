import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { useAttrLog, type DeviceAttrLog } from '../../api/attrAPI'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxAttrLog({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<
    React.SetStateAction<DeviceAttrLog[]>
  >
}) {
  const [query, setQuery] = useState('')

  const params = useParams()
  const deviceId = params.deviceId as string
  const { data: deviceAttrData } = useAttrLog({
    entityId: deviceId,
    entityType: 'DEVICE',
    config: {
      suspense: false,
    },
  })

  const { acc: attrLogFlattenData, extractedPropertyKeys } = flattenData(
    deviceAttrData?.logs,
    ['ts', 'attribute_key', 'value'],
  )

  const filteredData = filteredComboboxData(
    query,
    attrLogFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, deviceAttrData])

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
