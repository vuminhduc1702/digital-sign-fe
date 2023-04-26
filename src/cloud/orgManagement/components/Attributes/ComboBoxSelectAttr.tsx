import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { flattenData } from '~/utils/misc'
import { useOrgById } from '~/layout/OrgManagementLayout/api/getOrgById'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type Org } from '~/layout/MainLayout/types'
import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectAttr({
  attrData,
  setFilteredComboboxData,
  ...props
}: {
  attrData: Org
  setFilteredComboboxData?: React.Dispatch<
    React.SetStateAction<Org['attributes']>
  >
}) {
  const [query, setQuery] = useState('')

  const { acc: orgAttrFlattenData, extractedPropertyKeys } = flattenData(
    attrData?.attributes as Org['attributes'],
    ['last_update_ts', 'attribute_key', 'logged', 'value_type', 'value'],
  )

  const filteredData = filteredComboboxData(
    query,
    orgAttrFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, attrData])

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
