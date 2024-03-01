import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { uppercaseTheFirstLetter } from '~/utils/transformFunc'
import { useGetGroups } from '../api/groupAPI'
import { useDeleteMultipleGroup } from '../api/groupAPI/deleteMultipleGroups'
import { CreateGroup, GroupTable } from '../components/Group'
import { SearchField } from '~/components/Input'
import { useDisclosure } from '~/utils/hooks'
import { ConfirmDialog } from '~/components/ConfirmDialog'

export function GroupManage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { orgId } = useParams()
  const { close, open, isOpen } = useDisclosure()
  const projectId = storage.getProject()?.id
  const { data: groupData, isPreviousData } = useGetGroups({
    orgId,
    projectId,
    offset,
    config: { keepPreviousData: true },
  })

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.overview.name'),
      t('cloud:org_manage.group_manage.table.entity_type'),
      t('cloud:org_manage.org_manage.title'),
    ],
    [],
  )

  const {
    mutate: mutateDeleteMultipleGroups,
    isLoading,
    isSuccess: isSuccessDeleteMultipleGroups,
  } = useDeleteMultipleGroup()

  useEffect(() => {
    if (isSuccessDeleteMultipleGroups) {
      close()
    }
  }, [isSuccessDeleteMultipleGroups])

  const rowSelectionKey = Object.keys(rowSelection)

  const aoo: Array<{ [key: string]: string }> | undefined =
    groupData?.groups?.reduce((acc, curr, index) => {
      if (rowSelectionKey.includes(curr.id)) {
        const temp = {
          [t('table:no')]: (index + 1 + offset).toString(),
          [t('cloud:org_manage.org_manage.overview.name')]: curr.name,
          [t('cloud:org_manage.group_manage.table.entity_type')]:
            uppercaseTheFirstLetter(curr.entity_type),
          [t('cloud:org_manage.org_manage.title')]: curr.organization
            ? curr.organization
            : t('table:no_in_org'),
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.group_manage.header')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable
            refComponent={ref}
            rowSelection={rowSelection}
            aoo={aoo}
            pdfHeader={pdfHeader}
          />
          <div className="mr-[42px] flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <div
                onClick={open}
                className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white"
              >
                <div>{t('btn:delete')}:</div>
                <div>{Object.keys(rowSelection).length}</div>
              </div>
            )}
            <CreateGroup />
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        <GroupTable
          data={groupData?.groups ?? []}
          offset={offset}
          setOffset={setOffset}
          total={groupData?.total ?? 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.group_manage.table.delete_group')}
          body={t(
            'cloud:org_manage.group_manage.table.delete_multiple_group_confirm',
          )}
          close={close}
          isOpen={isOpen}
          handleSubmit={() =>
            mutateDeleteMultipleGroups(
              {
                data: { ids: rowSelectionKey },
              },
              { onSuccess: () => setRowSelection({}) },
            )
          }
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
