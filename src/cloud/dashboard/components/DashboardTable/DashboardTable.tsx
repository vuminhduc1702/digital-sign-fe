import { useTranslation } from 'react-i18next'
import { useDisclosure } from '@/utils/hooks'
import { useDeleteDashboard } from '../../api/deleteDashboard'

import { Button } from '@/components/Button'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { useMemo, useEffect, useRef, useState } from 'react'
import { getVNDateFormat } from '@/utils/misc'
import { BaseTable } from '@/components/Table'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '@/components/SVGIcons'
import { UpdateDashboard } from './UpdateDashboard'
import { Link } from '@/components/Link'
import { PATHS } from '@/routes/PATHS'
import { type DashboardRes } from '../../api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/Dropdowns'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { type BaseTableProps } from '@/components/Table'
import { LuEye, LuPen, LuTrash2, LuMoreVertical, LuFiles } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

function DashboardTableContextMenu({
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

  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteDashboard()

  return (
    <>
      <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
          <LuPen className="text-lg text-gray-500" onClick={open} />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2 className="text-lg text-gray-500" onClick={openDelete} />
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex cursor-pointer justify-center p-3">
              <LuMoreVertical className="text-lg text-gray-500" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                open()
              }}
            >
              <img src={btnEditIcon} alt="Edit Dashboard" className="h-5 w-5" />
              {t('cloud:dashboard.add_dashboard.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDelete}>
              <img
                src={btnDeleteIcon}
                alt="Delete Dashboard"
                className="h-5 w-5"
              />
              {t('cloud:dashboard.table.delete_dashboard')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      {isOpen ? (
        <UpdateDashboard
          id={id}
          close={close}
          isOpen={isOpen}
          title={title}
          {...props}
        />
      ) : null}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:dashboard.table.delete_dashboard_full')}
          body={t('cloud:dashboard.table.delete_dashboard_confirm').replace(
            '{{DBNAME}}',
            title,
          )}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({ id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

type PartialBaseTableProps<T> = Omit<
  BaseTableProps<DashboardRes>,
  'columns'
> & {
  columns?: ColumnDef<T, any>[]
}

type DashboardTableProps = {
  data: DashboardRes[]
  projectId: string
  limitPagination: number
} & PartialBaseTableProps<DashboardRes>

export function DashboardTable({
  data,
  projectId,
  limitPagination,
  ...props
}: DashboardTableProps<DashboardRes>) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const columnHelper = createColumnHelper<DashboardRes>()

  const dataSorted =
    data?.sort((a, b) => b.created_time - a.created_time) || data

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  function moveToLink(id: string) {
    navigate(`${PATHS.DASHBOARD}/${projectId}/${id}`)
  }

  const columns = useMemo<ColumnDef<DashboardRes, any>[]>(
    () => [
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { id, title, configuration } = info.row.original
          return DashboardTableContextMenu({
            id,
            title,
            description: configuration.description,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'stt',
        cell: info => {
          return !props.isPreviousData
            ? info.row.index + 1 + props.offset
            : info.row.index + 1 + offsetPrev.current
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'title',
        header: () => <span>{t('cloud:dashboard.table.name')}</span>,
        cell: info => info.row.original.title,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'description',
        cell: info => {
          const { configuration } = info.row.original
          return <span>{configuration.description}</span>
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
    ],
    [props.offset],
  )

  return data != null && data?.length > 0 ? (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted}
      columns={columns}
      viewDetailOnClick={moveToLink}
      {...props}
    />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_dashboard')}
    </div>
  )
}
