import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { useProjectIdStore } from '~/stores/project'
import { useGetOrgs } from '~/layout/MainLayout/api'
import {
  ComboBoxBase,
  type ComboBoxBasePassThroughProps,
  filteredComboboxData,
} from '~/components/ComboBox'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'
import { type FieldWrapperPassThroughProps } from '~/components/Form'

import { SearchIcon } from '~/components/SVGIcons'

type ComboBoxSelectOrgProps = {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<OrgMapType[]>>
} & FieldWrapperPassThroughProps &
  ComboBoxBasePassThroughProps<OrgMapType>

export function ComboBoxSelectOrg({
  setFilteredComboboxData,
  ...props
}: ComboBoxSelectOrgProps) {
  const [query, setQuery] = useState('')

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useGetOrgs({ projectId })
  const { acc: orgFlattenData, extractedPropertyKeys } = flattenData(
    orgData?.organizations || [],
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )

  const filteredData = filteredComboboxData(
    query,
    orgFlattenData,
    extractedPropertyKeys,
  ) as OrgMapType[]
  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, orgData])

  return (
    <ComboBoxBase<OrgMapType>
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
