import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import TitleBar from '@/components/Head/TitleBar'
import storage from '@/utils/storage'
import { uppercaseTheFirstLetter } from '@/utils/transformFunc'
import { useGetGroups } from '../api/groupAPI'
import { useDeleteMultipleGroup } from '../api/groupAPI/deleteMultipleGroups'
import { CreateGroup, GroupTable } from '../components/Group'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function GroupManage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [offset, setOffset] = useState<number>(0)
  const searchField = useRef('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const { orgId } = useParams()
  const {
    close: closeGroup,
    open: openGroup,
    isOpen: isOpenGroup,
  } = useDisclosure()
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()
  const projectId = storage.getProject()?.id
  const {
    data: groupData,
    isLoading: isLoadingGroup,
    isPreviousData,
  } = useGetGroups({
    orgId,
    projectId,
    offset,
    search_str: searchQuery,
    search_field: searchField.current,
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
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleGroups])

  const rowSelectionKey = Object.keys(rowSelection)

  const formatExcel = groupData?.groups?.reduce(
    (acc, curr, index) => {
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
    },
    [] as Array<{ [key: string]: unknown }>,
  )

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.group_manage.header')} />
      <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex w-full items-center justify-between gap-x-3">
            <SearchField
              setSearchValue={setSearchQuery}
              searchField={searchField}
              fieldOptions={[
                {
                  value: 'name',
                  label: t('cloud:org_manage.group_manage.table.name'),
                },
                {
                  value: 'id',
                  label: t('cloud:org_manage.group_manage.table.id'),
                },
              ]}
              setIsSearchData={setIsSearchData}
              closeSearch={true}
            />
            <Button
              className="h-[38px] rounded border-none"
              onClick={openGroup}
            >
              {t('cloud:org_manage.group_manage.add_group.button')}
            </Button>
          </div>
        </div>
        <GroupTable
          data={groupData?.groups ?? []}
          offset={offset}
          setOffset={setOffset}
          total={groupData?.total ?? 0}
          isPreviousData={isPreviousData}
          isLoading={isLoadingGroup}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          pdfHeader={pdfHeader}
          formatExcel={formatExcel}
          isSearchData={searchQuery.length > 0 && isSearchData}
          utilityButton={
            Object.keys(rowSelection).length > 0 && (
              <div className="flex items-center">
                <Button
                  size="sm"
                  onClick={openDeleteMulti}
                  className="h-full min-w-[60px] rounded-none border-none hover:opacity-80"
                >
                  <div>{t('btn:delete')}:</div>
                  <div>{Object.keys(rowSelection).length}</div>
                </Button>
              </div>
            )
          }
        />
      </div>
      {isOpenGroup && (
        <CreateGroup close={closeGroup} open={openGroup} isOpen={isOpenGroup} />
      )}
      {isOpenDeleteMulti ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.group_manage.table.delete_group')}
          body={t(
            'cloud:org_manage.group_manage.table.delete_multiple_group_confirm',
          )}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
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
