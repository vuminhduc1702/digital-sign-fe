import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { limitPagination } from '~/utils/const'
import { flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { convertEpochToDate } from '~/utils/transformFunc'
import { useGetDashboards } from '../api'
import { useDeleteMultipleDashboards } from '../api/deleteMultipleDashboards'
import { DashboardTable } from '../components/DashboardTable'
import { CreateDashboard } from '../components/DashboardTable/CreateDashboard'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

export function DashboardManage() {
  const { t } = useTranslation()

  const ref = useRef(null)

  const projectId = storage.getProject()?.id

  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: dashboardData,
    isPreviousData,
    isSuccess,
  } = useGetDashboards({ projectId, offset })

  const { acc: dashboardFlattenData, extractedPropertyKeys } = flattenData(
    dashboardData?.dashboard,
    ['id', 'title', 'name', 'tenant_id', 'created_time', 'configuration'],
  )
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
    dashboardData?.dashboard.reduce((acc, curr, index) => {
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
                        className="h-5 w-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateDashboard projectId={projectId} />
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
        <DashboardTable
          data={dashboardFlattenData}
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
