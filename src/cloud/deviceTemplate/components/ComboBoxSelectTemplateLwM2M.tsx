import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { useGetTemplatesLwM2M } from '../api'
import storage from '~/utils/storage'

import { type TemplateLwM2MList, type TemplateLwM2M } from '../types'
import { type FieldWrapperPassThroughProps } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectDeviceProps = {
  data: TemplateLwM2MList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<TemplateLwM2M[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectTemplateLwM2M({
  data,
  setFilteredComboboxData,
  ...props
}: ComboBoxSelectDeviceProps) {
  const [query, setQuery] = useState('')

  //const projectId = storage.getProject()?.id
  //const { data } = useGetTemplatesLwM2M({ projectId })

  const { acc: templateLwM2MFlattenData, extractedPropertyKeys } = flattenData(
    data?.templates,
    [
      'id',
      'name',
      'rule_chain_id',
      'provision_key',
      'provision_secret',
      'created_time',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    templateLwM2MFlattenData,
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
