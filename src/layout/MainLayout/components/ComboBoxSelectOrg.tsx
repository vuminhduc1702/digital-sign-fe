import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { useGetOrgs } from '~/layout/MainLayout/api'
import {
  ComboBoxBase,
  type ComboBoxBasePassThroughProps,
  filteredComboboxData,
} from '~/components/ComboBox'
import storage from '~/utils/storage'

import { type Org } from '../types'
import { type FieldWrapperPassThroughProps } from '~/components/Form'

import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectOrgProps = {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Org[]>>
} & FieldWrapperPassThroughProps &
  ComboBoxBasePassThroughProps<Org>

export function ComboBoxSelectOrg({
  setFilteredComboboxData,
  ...props
}: ComboBoxSelectOrgProps) {
  const [query, setQuery] = useState('')

  const projectId = storage.getProject()?.id
  const { data: orgData } = useGetOrgs({ projectId })
  console.log('data', orgData)
  const { acc: orgFlattenData, extractedPropertyKeys } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name', 'org_id', 'image'],
    'sub_orgs',
  )

  const filteredData = filteredComboboxData(
    query,
    orgFlattenData,
    extractedPropertyKeys,
  )
  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, orgData])

  return (
    <ComboBoxBase<Org>
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
