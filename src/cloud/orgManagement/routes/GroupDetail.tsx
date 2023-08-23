import { useState } from 'react'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { GroupBreadcrumbs } from '../components/Group/GroupBreadcrumbs'
import {
  AttrTable,
  CreateAttr,
  ComboBoxSelectAttr,
} from '../components/Attributes'
import { ExportTable } from '~/components/Table/components/ExportTable'

import { type Attribute } from '~/types'

export function GroupDetail() {
  const params = useParams()
  const groupId = params.groupId as string
  console.log('params', params)

  const [filteredAttrComboboxData, setFilteredAttrComboboxData] = useState<
    Attribute[]
  >([])

  return (
    <div className="flex grow flex-col">
      <TitleBar className="normal-case" title={<GroupBreadcrumbs />} />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable />
          <div className="flex items-center gap-x-3">
            <CreateAttr entityId={groupId} entityType="GROUP" />
            <ComboBoxSelectAttr
              entityId={groupId}
              entityType="GROUP"
              setFilteredComboboxData={setFilteredAttrComboboxData}
            />
          </div>
        </div>
        <AttrTable
          data={filteredAttrComboboxData}
          entityId={groupId}
          entityType="GROUP"
        />
      </div>
    </div>
  )
}