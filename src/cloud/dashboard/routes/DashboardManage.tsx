import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { limitPagination } from '~/utils/const'
import storage from '~/utils/storage'
import { convertEpochToDate } from '~/utils/transformFunc'
import { useGetDashboards } from '../api'
import { useDeleteMultipleDashboards } from '../api/deleteMultipleDashboards'
import { DashboardTable } from '../components/DashboardTable'
import { CreateDashboard } from '../components/DashboardTable/CreateDashboard'

export function DashboardManage() {
  const { t } = useTranslation()

  const ref = useRef(null)

  const projectId = storage.getProject()?.id

  const [offset, setOffset] = useState(0)

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
              <ConfirmationDialog
                isDone={isSuccessDeleteMultipleDashboards}
                icon="danger"
                title={t('cloud:dashboard.table.delete_dashboard_full')}
                body={t(
                  'cloud:dashboard.table.delete_multiple_dashboard_confirm',
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
                      mutateDeleteMultipleDashboards(
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
            <CreateDashboard projectId={projectId} />
            {/* dummyInput */}
          </div>
        </div>
        <DashboardTable
          data={dashboardData?.dashboard || []}
          projectId={projectId}
          offset={offset}
          setOffset={setOffset}
          total={dashboardData?.total || 0}
          limitPagination={limitPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}
