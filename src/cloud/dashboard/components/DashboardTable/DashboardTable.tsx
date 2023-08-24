import { useTranslation } from 'react-i18next'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteDashboard } from '../../api/deleteDashboard'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { Menu } from '@headlessui/react'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { type Dashboard } from '../../types'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { getVNDateFormat } from '~/utils/misc'
import { BaseTable } from '~/components/Table'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { UpdateDashboard } from './UpdateDashboard'
import { DashboardDetail } from '../../routes/DashboardDetail'

function DashboardTableContextMenu({
  projectId,
  id,
  title
}: {
  projectId: string,
  id: string,
  title: string
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteDashboard()

  return (
    <>
      <Dropdown
        icon={
          <BtnContextMenuIcon
            height={20}
            width={10}
            viewBox="0 0 1 20"
            className="text-secondary-700 hover:text-primary-400"
          />
        }
      >
        <Menu.Items className="absolute right-0 z-10 mt-6 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            <MenuItem
              icon={
                <img
                  src={btnEditIcon}
                  alt="Edit Dashboard"
                  className="h-5 w-5"
                />
              }
              onClick={open}
            >
              {t('cloud:dashboard.add_dashboard.edit')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:dashboard.table.delete_dashboard_full')}
              body={
                t(
                  'cloud:dashboard.table.delete_dashboard_confirm',
                ).replace('{{DBNAME}}', title) ?? 'Confirm delete?'
              }
              triggerButton={
                <Button
                  className="w-full border-none hover:text-primary-400"
                  style={{ justifyContent: 'flex-start' }}
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete Dashboard"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('cloud:dashboard.table.delete_dashboard_full')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() =>
                    mutate({
                      projectId,
                      data: {
                        id: id
                      }
                    })
                  }
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpen ? (
        <UpdateDashboard
          id={id}
          title={title}
          close={close}
          isOpen={isOpen}
          projectId={projectId}
        />
      ) : null}
    </>
  )
}

export function DashboardTable({
    data,
    projectId,
    ...props
  }: {
    data: Dashboard[]
    projectId: string
  }) {
    const { t } = useTranslation()
  
    const columnHelper = createColumnHelper<Dashboard>()
  
    const dataSorted =
      data?.sort((a, b) => b.created_time - a.created_time) || data
  
    const columns = useMemo<ColumnDef<Dashboard, any>[]>(
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
        columnHelper.accessor('name', {
            header: () => (
              <span>{t('cloud:dashboard.table.name')}</span>
            ),
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('created_time', {
            header: () => (
              <span>{t('cloud:dashboard.table.create_time')}</span>
            ),
            cell: info => getVNDateFormat({ date: parseInt(info.getValue()) * 1000 }),
            footer: info => info.column.id,
        }),
        columnHelper.display({
          id: 'contextMenu',
          cell: info => {
            const { id, title } = info.row.original
            return DashboardTableContextMenu({ projectId, id, title })
          },
          header: () => null,
          footer: info => info.column.id,
        }),
      ],
      [],
    )
  
    return data != null && data?.length !== 0 ? (
      <BaseTable data={dataSorted} columns={columns} {...props} />
    ) : (
      <div className="flex grow items-center justify-center">
        {t('table:no_dashboard')}
      </div>
    )
  }
  
