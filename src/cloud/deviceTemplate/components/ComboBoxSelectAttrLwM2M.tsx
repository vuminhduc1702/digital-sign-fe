import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { type TransportConfigAttribute } from '../types'
import { type FieldWrapperPassThroughProps } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { useTemplateById } from '../api/getTemplateById'

type ComboBoxSelectDeviceProps = {
  setFilteredComboboxDataAttr?: React.Dispatch<React.SetStateAction<TransportConfigAttribute[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectAttrLwM2M({
  setFilteredComboboxDataAttr,
  ...props
}: ComboBoxSelectDeviceProps) {
  const [query, setQuery] = useState('')
  const params = useParams()
  const templateId = params.templateId as string
  const id = params.id as string
  const { data: LwM2MDataById } = useTemplateById ({ templateId })
  const selectedModuleId = id
  const selectedModule = LwM2MDataById?.transport_config?.info.module_config
  .find((module) => module.id === selectedModuleId)
  const selectedAttributes = selectedModule?.attribute_info || []
  const { acc: templateLwM2MFlattenData, extractedPropertyKeys } = flattenData(
    selectedAttributes,
    [
      'action',
      'name',
      'id',
      'kind',
      'type',
    ],
  )
  const filteredData = filteredComboboxData(
    query,
    templateLwM2MFlattenData,
    extractedPropertyKeys,
  )
  useEffect(() => {
    setFilteredComboboxDataAttr?.(filteredData)
  }, [query, LwM2MDataById])

  return (
    <ComboBoxBase
      data={filteredData}
      extractedPropertyKeys={extractedPropertyKeys}
      query={query}
      setQuery={setQuery}
      setFilteredComboboxData={setFilteredComboboxDataAttr}
      startIcon={<SearchIcon width={16} height={16} viewBox="0 0 16 16" />}
      {...props}
    />
  )
}