import { useTranslation } from 'react-i18next'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteDashboard } from '../../api/deleteDashboard'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { getVNDateFormat } from '~/utils/misc'
import { BaseTable } from '~/components/Table'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { UpdateDashboard } from './UpdateDashboard'
import { Link } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import { type DashboardRes } from '../../api'

export function DashboardTable({
  data,
  projectId,
  ...props
}: {
  data: DashboardRes[]
  projectId: string
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteDashboard()

  const [dashboardInfo, setDashboardInfo] = useState<DashboardRes>()

  const columnHelper = createColumnHelper<DashboardRes>()

  const dataSorted =
    data?.sort((a, b) => b.created_time - a.created_time) || data

  const columns = useMemo<ColumnDef<DashboardRes, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('title', {
        header: () => <span>{t('cloud:dashboard.table.name')}</span>,
        cell: info => (
          <Link
            to={`${PATHS.DASHBOARD}/${projectId}/${info.row.original.id}`}
            onClick={() => {
              window.localStorage.setItem('dbname', info.row.original.title)
            }}
          >
            {info.getValue()}
          </Link>
        ),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'description',
        cell: info => {
          const { configuration } = info.row.original
          return (
            <span>
              {JSON.parse(configuration as unknown as string).description}
            </span>
          )
        },
        header: () => (
          <span>{t('cloud:dashboard.table.configuration.description')}</span>
        ),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('created_time', {
        header: () => <span>{t('cloud:dashboard.table.create_time')}</span>,
        cell: info =>
          getVNDateFormat({ date: parseInt(info.getValue()) * 1000 }),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { title, id } = info.row.original
          setDashboardInfo(info.row.original)
          // return DashboardTableContextMenu({
          //   id,
          //   title,
          //   description: JSON.parse(configuration as unknown as string)
          //     .description,
          // })
          return (
            <div className="flex items-center gap-x-2">
              <Button
                type="button"
                size="square"
                variant="none"
                className="mt-1 p-0"
                onClick={open}
                startIcon={
                  <img
                    src={btnEditIcon}
                    alt="Edit Dashboard"
                    className="h-6 w-6"
                  />
                }
              />
              <ConfirmationDialog
                isDone={isSuccess}
                icon="danger"
                title={t('cloud:dashboard.table.delete_dashboard_full')}
                body={t(
                  'cloud:dashboard.table.delete_dashboard_confirm',
                ).replace('{{DBNAME}}', title)}
                triggerButton={
                  <Button
                    size="square"
                    variant="none"
                    className="p-0"
                    startIcon={
                      <img
                        src={btnDeleteIcon}
                        alt="Delete Dashboard"
                        className="h-6 w-6"
                      />
                    }
                  ></Button>
                }
                confirmButton={
                  <Button
                    isLoading={isLoading}
                    type="button"
                    size="md"
                    className="bg-primary-400"
                    onClick={() => mutate({ id })}
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
            </div>
          )
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return data != null && data?.length !== 0 ? (
    <>
      <BaseTable data={dataSorted} columns={columns} {...props} />
      <UpdateDashboard
        id={dashboardInfo?.id as string}
        close={close}
        isOpen={isOpen}
        title={dashboardInfo?.title as string}
        configuration={dashboardInfo?.configuration as unknown as string}
      />
    </>
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_dashboard')}
    </div>
  )
}
