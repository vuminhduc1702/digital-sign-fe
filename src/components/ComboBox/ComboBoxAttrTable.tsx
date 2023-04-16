import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from './ComboBoxBase'
import { useOrgIdStore } from '~/stores/org'
import { useOrgById } from '~/layout/OrgManagementLayout/api/getOrgById'

import { type Org } from '~/layout/MainLayout/types'

export function ComboBoxAttrTable({
  setFilteredComboboxData,
  ...props
}: {
  setFilteredComboboxData?: React.Dispatch<
    React.SetStateAction<Org['attributes']>
  >
}) {
  const [query, setQuery] = useState('')

  const orgId = useOrgIdStore(state => state.orgId)
  const { data: orgByIdData } = useOrgById({ orgId })

  const { acc: orgAttrFlattenData, extractedPropertyKeys } = flattenData(
    orgByIdData?.attributes as Org['attributes'],
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
