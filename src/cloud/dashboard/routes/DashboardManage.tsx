import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { Button } from '@/components/ui/button'
import TitleBar from '@/components/Head/TitleBar'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { limitPagination } from '@/utils/const'
import { flattenData } from '@/utils/misc'
import storage from '@/utils/storage'
import { convertEpochToDate } from '@/utils/transformFunc'
import { useGetDashboards } from '../api'
import { useDeleteMultipleDashboards } from '../api/deleteMultipleDashboards'
import { DashboardTable } from '../components/DashboardTable'
import { CreateDashboard } from '../components/DashboardTable/CreateDashboard'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function DashboardManage() {
  const { t } = useTranslation()

  const ref = useRef(null)

  const projectId = storage.getProject()?.id

  const [offset, setOffset] = useState(0)
  const searchField = useRef('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()
  const {
    close: closeDashboard,
    open: openDashboard,
    isOpen: isOpenDashboard,
  } = useDisclosure()

  const {
    data: dashboardData,
    isPreviousData: isPreviousDataDashboard,
    isLoading: isLoadingDashboard,
  } = useGetDashboards({
    projectId,
    offset,
    search_field: searchField.current,
    search_str: searchQuery,
  })

  const {
    mutate: mutateDeleteMultipleDashboards,
    isLoading,
    isSuccess: isSuccessDeleteMultipleDashboards,
  } = useDeleteMultipleDashboards()

  useEffect(() => {
    if (isSuccessDeleteMultipleDashboards) {
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleDashboards])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:dashboard.table.name'),
      t('cloud:dashboard.table.configuration.description'),
      t('cloud:dashboard.table.create_time'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    dashboardData?.dashboard?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('cloud:dashboard.table.name')]: curr.title,
            [t('cloud:dashboard.table.configuration.description')]:
              curr.configuration.description,
            [t('cloud:dashboard.table.create_time')]: convertEpochToDate(
              curr.created_time,
            ),
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:dashboard.title')} />
      <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex w-full items-center justify-between gap-x-3">
            <SearchField
              setSearchValue={setSearchQuery}
              searchField={searchField}
              fieldOptions={[
                {
                  value: 'name,id',
                  label: t('search:all'),
                },
                {
                  value: 'name',
                  label: t('cloud:dashboard.table.name'),
                },
                {
                  value: 'id',
                  label: t('cloud:dashboard.table.id'),
                },
              ]}
              setIsSearchData={setIsSearchData}
              closeSearch={true}
            />

            <Button
              className="h-[38px] rounded border-none"
              onClick={openDashboard}
            >
              {t('cloud:dashboard.add_dashboard.button')}
            </Button>
          </div>
        </div>
        <DashboardTable
          data={dashboardData?.dashboard ?? []}
          projectId={projectId}
          offset={offset}
          setOffset={setOffset}
          total={dashboardData?.total || 0}
          limitPagination={limitPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          isPreviousData={isPreviousDataDashboard}
          isLoading={isLoadingDashboard}
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
      {isOpenDashboard && (
        <CreateDashboard
          projectId={projectId}
          open={openDashboard}
          close={closeDashboard}
          isOpen={isOpenDashboard}
        />
      )}
      {isOpenDeleteMulti ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:dashboard.table.delete_dashboard_full')}
          body={t('cloud:dashboard.table.delete_multiple_dashboard_confirm')}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          handleSubmit={() =>
            mutateDeleteMultipleDashboards(
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
