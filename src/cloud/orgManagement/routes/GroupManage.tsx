import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { uppercaseTheFirstLetter } from '~/utils/transformFunc'
import { useGetGroups } from '../api/groupAPI'
import { useDeleteMultipleGroup } from '../api/groupAPI/deleteMultipleGroups'
import { CreateGroup, GroupTable } from '../components/Group'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

export function GroupManage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { orgId } = useParams()
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

  const rowSelectionKey = Object.keys(rowSelection)

  const aoo: Array<{ [key: string]: string }> | undefined =
    groupData?.groups.reduce((acc, curr, index) => {
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
          <div className="flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <ConfirmationDialog
                isDone={isSuccessDeleteMultipleGroups}
                icon="danger"
                title={t('cloud:org_manage.group_manage.table.delete_group')}
                body={t(
                  'cloud:org_manage.group_manage.table.delete_multiple_group_confirm',
                )}
                triggerButton={
                  <div className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                    <div>Xoá:</div>
                    <div>{Object.keys(rowSelection).length}</div>
                  </div>
                }
                confirmButton={
                  <Button
                    isLoading={isLoading}
                    type="button"
                    size="md"
                    className="bg-primary-400"
                    onClick={() =>
                      mutateDeleteMultipleGroups(
                        {
                          data: { ids: rowSelectionKey },
                        },
                        { onSuccess: () => setRowSelection({}) },
                      )
                    }
                    startIcon={
                      <img
                        src={btnSubmitIcon}
                        alt="Submit"
                        className="size-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateGroup />
            {/* dummyInput */}
            <InputField
              type="text"
              placeholder={t('table:search')}
              value={searchQuery}
              onChange={e => {
                const value = e.target.value
                setSearchQuery(value)
              }}
              endIcon={
                <div className="absolute top-1/2 right-2 -translate-y-1/2 transform flex justify-center">
                  {searchQuery.length > 0 && (
                    <XMarkIcon
                      className="h-[16px] w-[16px] mr-[5px] transform cursor-pointer opacity-50 flex align-center justify-center cursor-pointer"
                      onClick={() => setSearchQuery('')}
                    />
                  )}
                  <SearchIcon
                    className="cursor-pointer flex justify-between align-center"
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                  />
                </div>
              }
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
    </div>
  )
}
