import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { useGetDevices } from '../../api/deviceAPI'
import { useProjectIdStore } from '~/stores/project'

import { type Device } from '../../types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectDevice({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Device>>
}) {
  const [query, setQuery] = useState('')

  const params = useParams()
  const orgId = params.orgId as string
  const projectId = useProjectIdStore(state => state.projectId)
  const { data: deviceData } = useGetDevices({ orgId, projectId })

  const { acc: deviceFlattenData, extractedPropertyKeys } = flattenData(
    deviceData?.devices as Array<Device>,
    ['id', 'name', 'group_name', 'template_name', 'created_time'],
  )

  const filteredData = filteredComboboxData(
    query,
    deviceFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, deviceData])

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
