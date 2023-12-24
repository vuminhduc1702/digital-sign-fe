import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'
import { useGetTemplates } from '../api'
import storage from '~/utils/storage'

import { type Template } from '../types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectTemplateLwM2M({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Template[]>>
}) {
  const [query, setQuery] = useState('')

  const projectId = storage.getProject()?.id
  const { data } = useGetTemplates({ projectId })

  const { acc: templateFlattenData, extractedPropertyKeys } = flattenData(
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
    templateFlattenData,
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
