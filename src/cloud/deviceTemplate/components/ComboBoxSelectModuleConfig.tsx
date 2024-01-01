import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { useTemplateLwM2MById } from '../api'
import storage from '~/utils/storage'
import { type TransportConfigInfo, type ModuleConfig } from '../types'
import { type FieldWrapperPassThroughProps } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectDeviceProps = {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<ModuleConfig[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectModuleConfig({
  setFilteredComboboxData,
  ...props
}: ComboBoxSelectDeviceProps) {
  const [query, setQuery] = useState('')
  const params = useParams()
  const templateId = params.templateId as string
  const { data: LwM2MDataById } = useTemplateLwM2MById ({ templateId })
  //console.log('data12', LwM2MDataById)
  // console.log('filteredComboboxData', filteredComboboxData)
  const { acc: templateLwM2MFlattenData, extractedPropertyKeys } = flattenData(
    LwM2MDataById?.transport_config?.info.module_config || [],
    [
      'module_name',
      'numberOfAttributes',
      'id',
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
  }, [query, LwM2MDataById])

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