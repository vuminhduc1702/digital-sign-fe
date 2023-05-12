import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { useProjectIdStore } from '~/stores/project'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectOrg({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<OrgMapType[]>>
}) {
  const [query, setQuery] = useState('')

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useGetOrgs({ projectId })
  const { acc: orgFlattenData, extractedPropertyKeys } = flattenData(
    orgData?.organizations || [],
    ['id', 'name', 'level'],
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
