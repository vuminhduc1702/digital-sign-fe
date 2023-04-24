import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { useProjectIdStore } from '~/stores/project'
import { useOrganizations } from '~/layout/MainLayout/api'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type Org } from '~/layout/MainLayout/types'
import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'

export function ComboBoxOrgManageSidebar({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<OrgMapType>[]>
}) {
  const [query, setQuery] = useState('')

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useOrganizations({ projectId })
  const { acc: orgFlattenData, extractedPropertyKeys } = flattenData(
    orgData?.organizations as Array<Org>,
    ['id', 'name', 'level'],
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
    <ComboBoxBase
      data={filteredData}
      extractedPropertyKeys={extractedPropertyKeys}
      query={query}
      setQuery={setQuery}
      setFilteredComboboxData={setFilteredComboboxData}
      {...props}
    />
  )
}
