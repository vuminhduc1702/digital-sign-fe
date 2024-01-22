import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { Menu } from '@headlessui/react'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useDeleteDashboard } from '~/cloud/dashboard/api'

function DataBaseTableContextMenu({
  id,
  title,
  ...props
}: {
  id: string
  title: string
  description: string
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
        <Menu.Items className="absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
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
              body={t('cloud:dashboard.table.delete_dashboard_confirm').replace(
                '{{DBNAME}}',
                title,
              )}
              triggerButton={
                <Button
                  className="w-full justify-start border-none hover:text-primary-400"
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
                  {t('cloud:dashboard.table.delete_dashboard')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutate({ id })}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {/* {isOpen ? (
        <UpdateDashboard
          id={id}
          close={close}
          isOpen={isOpen}
          title={title}
          {...props}
        />
      ) : null} */}
    </>
  )
}

export function DataBaseTable({
  columnsProp,
  data,
  ...props
}: {
  columnsProp: string[]
  data: any[]
}) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<any>()

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      ...columnsProp?.map(item => (
        columnHelper.accessor(item, {
          header: () => (
            <span>{(item)}</span>
          ),
          cell: info => info?.getValue(),
          footer: info => info.column.id,
        })
      )),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { id, title, configuration } = info.row.original
          return DataBaseTableContextMenu({
            id,
            title,
            description: JSON.parse(configuration as unknown as string)
              .description,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [columnsProp],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data || []}
      columns={columns}
      {...props}
    />
  )
}
