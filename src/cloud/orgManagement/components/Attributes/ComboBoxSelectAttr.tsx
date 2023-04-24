import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { useOrgIdStore } from '~/stores/org'
import { useOrgById } from '~/layout/OrgManagementLayout/api/getOrgById'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type Org } from '~/layout/MainLayout/types'
import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectAttr({
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
      startIcon={<SearchIcon width={16} height={16} viewBox="0 0 16 16" />}
      {...props}
    />
  )
}
