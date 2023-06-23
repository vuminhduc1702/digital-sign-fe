import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import {
  ComboBoxSelectGroup,
  CreateGroup,
  GroupTable,
} from '../components/Group'
import { useProjectIdStore } from '~/stores/project'
import { useGetGroups } from '../api/groupAPI'

import { type Group } from '../types'

export function GroupManage() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Group[]>([])
  const [offset, setOffset] = useState(0)

  const { orgId } = useParams()
  const projectId = useProjectIdStore(state => state.projectId)
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
    <>
      <TitleBar
        title={t('cloud:org_manage.group_manage.header') ?? 'Group management'}
      />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable />
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
    </>
  )
}
