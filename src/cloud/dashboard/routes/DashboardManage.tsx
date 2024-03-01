import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { limitPagination } from '~/utils/const'
import storage from '~/utils/storage'
import { convertEpochToDate } from '~/utils/transformFunc'
import { useGetDashboards } from '../api'
import { useDeleteMultipleDashboards } from '../api/deleteMultipleDashboards'
import { DashboardTable } from '../components/DashboardTable'
import { CreateDashboard } from '../components/DashboardTable/CreateDashboard'
import { SearchField } from '~/components/Input'
import { useDisclosure } from '~/utils/hooks'
import { ConfirmDialog } from '~/components/ConfirmDialog'

export function DashboardManage() {
  const { t } = useTranslation()

  const ref = useRef(null)

  const projectId = storage.getProject()?.id

  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { close, open, isOpen } = useDisclosure()

  const {
    data: dashboardData,
    isPreviousData,
    isSuccess,
  } = useGetDashboards({ projectId, offset })

  const {
    mutate: mutateDeleteMultipleDashboards,
    isLoading,
    isSuccess: isSuccessDeleteMultipleDashboards,
  } = useDeleteMultipleDashboards()

  useEffect(() => {
    if (isSuccessDeleteMultipleDashboards) {
      close()
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
  const aoo: Array<{ [key: string]: string }> | undefined =
    dashboardData?.dashboard?.reduce((acc, curr, index) => {
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
    }, [] as Array<{ [key: string]: string }>)

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:dashboard.title')} />
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
              <div onClick={open} className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                <div>{t('btn:delete')}:</div>
                <div>{Object.keys(rowSelection).length}</div>
              </div>
            )}
            <CreateDashboard projectId={projectId} />
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
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
        />
      </div>
      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:dashboard.table.delete_dashboard_full')}
          body={t(
            'cloud:dashboard.table.delete_multiple_dashboard_confirm',
          )}
          close={close}
          isOpen={isOpen}
          handleSubmit={() => mutateDeleteMultipleDashboards(
            {
              data: { ids: rowSelectionKey },
            },
            { onSuccess: () => setRowSelection({}) },
          )}
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
