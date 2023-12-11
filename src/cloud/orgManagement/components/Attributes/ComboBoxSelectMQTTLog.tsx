import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { SearchIcon } from '~/components/SVGIcons'
import { type MQTTMessage, useMQTTLog } from '../../api/attrAPI/getMQTTLog'

export function ComboBoxMQTTLog({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<MQTTMessage[]>>
}) {
  const [query, setQuery] = useState('')
  const params = useParams()
  const deviceId = params.deviceId as string
  const projectId = params.projectId as string
  const { data: mqttLogData } = useMQTTLog({
    device_id: deviceId,
    project_id: projectId,
    config: {
      suspense: false,
    },
  })

  const { acc: mqttMessageFlattenData, extractedPropertyKeys } = flattenData(
    mqttLogData?.messages,
    [
      'project_id',
      'created_by',
      'owner',
      'topic',
      'device_id',
      'payload_as_string',
      'ts',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    mqttMessageFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, mqttLogData])

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
