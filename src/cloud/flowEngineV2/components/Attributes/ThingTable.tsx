import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { BaseTable, type BaseTableProps } from '@/components/Table'
import { PATHS } from '@/routes/PATHS'
import { useDisclosure } from '@/utils/hooks'
import storage from '@/utils/storage'
import { useDeleteThing } from '../../api/thingAPI'
import { UpdateThing } from './UpdateThing'
import { toast } from 'sonner'
import { type EntityThing } from '@/cloud/customProtocol'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LuPen, LuTrash2 } from 'react-icons/lu'
import { type UserInfo } from '@/cloud/orgManagement/api/userAPI'
import { useGetTemplates } from '@/cloud/deviceTemplate/api'

function ThingTableContextMenu({
  id,
  name,
  description,
}: {
  id: string
  name: string
  description: string
}) {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()
  const { close, open, isOpen } = useDisclosure()
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { data: templatesData } = useGetTemplates({
    projectId,
    search_str: id,
    search_field: 'thing_id',
  })

  const { mutate, isLoading, isSuccess } = useDeleteThing()

  const checkConditionBeforeDelete = () => {
    return templatesData?.templates && templatesData?.templates.length > 0
  }

  const handleDelete = () => {
    if (checkConditionBeforeDelete()) {
      const deviceNames = templatesData?.templates
        ?.map(device => device.name)
        .join(', ')
      toast.error(
        `${t('cloud:custom_protocol.thing.delete_thing_error')}: [ ${deviceNames} ]`,
      )
    } else {
      mutate({ id })
    }
  }

  return (
    <>
      <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
          <LuPen
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={open}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={openDelete}
          />
        </div>
      </div>
      <UpdateThing
        thingId={id}
        name={name}
        description={description}
        close={close}
        isOpen={isOpen}
      />

      <ConfirmDialog
        title={t('cloud:custom_protocol.thing.delete')}
        body={t('cloud:custom_protocol.thing.delete_thing_confirm').replace(
          '{{THINGNAME}}',
          name,
        )}
        icon="danger"
        close={closeDelete}
        isOpen={isOpenDelete}
        isSuccessDelete={isSuccess}
        handleSubmit={handleDelete}
        isLoading={isLoading}
      />
    </>
  )
}

type PartialBaseTableProps<T> = Omit<BaseTableProps<UserInfo>, 'columns'> & {
  columns?: ColumnDef<T, any>[]
}

type ThingTableProps = {
  data: EntityThing[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & PartialBaseTableProps<EntityThing>
export function ThingTable({ data, ...props }: ThingTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const projectId = storage.getProject()?.id

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  function moveToLink(id: string) {
    navigate(`${PATHS.THING_TEMPLATE}/${projectId}/${id}`)
  }

  const columnHelper = createColumnHelper<EntityThing>()
  const columns = useMemo<ColumnDef<EntityThing, any>[]>(
    () => [
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { name, id, description } = info.row.original
          return ThingTableContextMenu({ name, id, description })
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
        id: 'name',
        header: () => <span>{t('cloud:custom_protocol.thing.name')}</span>,
        cell: info => info.row.original.name,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('template_name', {
        header: () => (
          <span>{t('cloud:custom_protocol.thing.template_name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('total_service', {
        header: () => (
          <span>{t('cloud:custom_protocol.thing.number_thing')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('description', {
        header: () => (
          <span>{t('cloud:custom_protocol.thing.description')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [props.offset],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data}
      columns={columns}
      onDataText={t('table:no_thing')}
      viewDetailOnClick={moveToLink}
      {...props}
    />
  )
}
