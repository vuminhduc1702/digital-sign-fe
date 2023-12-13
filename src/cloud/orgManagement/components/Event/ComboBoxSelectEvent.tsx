import { useEffect, useState } from 'react'

import { flattenData } from '~/utils/misc'
import { ComboBoxBase, filteredComboboxData } from '~/components/ComboBox'

import { type EventList, type EventType } from '../../types'

import { SearchIcon } from '~/components/SVGIcons'

export function ComboBoxSelectEvent({
  data,
  setFilteredComboboxData,
  ...props
}: {
  data: EventList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<EventType[]>>
}) {
  const [query, setQuery] = useState('')

  const { acc: eventFlattenData, extractedPropertyKeys } = flattenData(
    data?.events,
    [
      'id',
      'name',
      'group_name',
      'onClick',
      'status',
      'interval',
      'retry',
      'schedule',
      'action',
      'condition',
      'org_id',
      'group_id',
      'cmd',
    ],
  )

  const filteredData = filteredComboboxData(
    query,
    eventFlattenData,
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
