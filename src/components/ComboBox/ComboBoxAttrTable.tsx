import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { useProjectIdStore } from '~/stores/project'
import { useOrganizations } from '~/layout/MainLayout/api/getOrgs'
import { ComboBoxBase, filteredComboboxData } from './ComboBoxBase'
import { useOrgIdStore } from '~/stores/org'
import { useOrgById } from '~/cloud/orgManagement/api/getOrgById'

import { type OrgAttr } from '~/layout/MainLayout/types'

export function ComboBoxAttrTable({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<
    React.SetStateAction<OrgAttr['attributes']>[]
  >
}) {
  const [query, setQuery] = useState('')

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useOrganizations({ projectId })
  const orgId =
    useOrgIdStore(state => state.orgId) || orgData?.organizations[0]?.id
  const { data: orgByIdData } = useOrgById({ orgId })

  const { acc: orgAttrFlattenData, extractedPropertyKeys } = flattenData(
    orgByIdData?.attributes as Array<OrgAttr['attributes']>,
    ['last_update_ts', 'attribute_key', 'logged', 'value_type', 'value'],
  )

  const filteredData = filteredComboboxData(
    query,
    orgAttrFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, orgByIdData])

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
