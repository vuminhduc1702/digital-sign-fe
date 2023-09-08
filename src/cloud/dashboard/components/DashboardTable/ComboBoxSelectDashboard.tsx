import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { SearchIcon } from '~/components/SVGIcons'
import { type Dashboard } from '../../types'
import { useGetDashboards } from '../../api/getDashboards'

export function ComboBoxSelectDashboard({
  projectId,
  setFilteredComboboxData,
  ...props
}: {
  projectId: string
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Dashboard[]>>
}) {
  const [query, setQuery] = useState('')

  const { data: dashboardData } = useGetDashboards({ projectId })

  const { acc: dashboardFlattenData, extractedPropertyKeys } = flattenData(
    dashboardData?.dashboard,
    ['id', 'title', 'name', 'tenant_id', 'created_time', 'configuration'],
  )

  const filteredData = filteredComboboxData(
    query,
    dashboardFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query, dashboardData])

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
