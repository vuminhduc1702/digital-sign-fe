import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { useGetGroups } from '../api/groupAPI'
import {
  ComboBoxSelectGroup,
  CreateGroup,
  GroupTable,
} from '../components/Group'

import { type Group } from '../types'

export function GroupManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<Group[]>([])
  const [offset, setOffset] = useState(0)

  const { orgId } = useParams()
  const { id: projectId } = storage.getProject()
  const {
    data: groupData,
    isPreviousData,
    isSuccess,
  } = useGetGroups({
    orgId,
    projectId,
    offset,
    config: { keepPreviousData: true },
  })

  return (
    <div ref={ref}>
      <TitleBar
        title={t('cloud:org_manage.group_manage.header') ?? 'Group management'}
      />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable refComponent={ref} />
          <div className="flex items-center gap-x-3">
            <CreateGroup />
            {isSuccess ? (
              <ComboBoxSelectGroup
                data={groupData}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <GroupTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={groupData?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </div>
  )
}
