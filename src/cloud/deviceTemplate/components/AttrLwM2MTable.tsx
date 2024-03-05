import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BaseTable } from '~/components/Table'
import { type TransportConfigAttribute } from '../types'

type AttrLwM2MTableProps = {
  attributeInfo: TransportConfigAttribute[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
}

export function AttrLwM2MTable({
  attributeInfo,
  ...props
}: AttrLwM2MTableProps) {
  const { t } = useTranslation()
  const [showNoTemplateMessage, setShowNoTemplateMessage] = useState(false)
  const columnHelper = createColumnHelper<TransportConfigAttribute>()
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNoTemplateMessage(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [attributeInfo])

  const columns = useMemo<ColumnDef<TransportConfigAttribute, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'name',
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.attr_key')}</span>
        ),
        cell: info => {
          const nameAttrLwM2M = info.row.original.name
          return (
            <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
              {nameAttrLwM2M}
            </p>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'typeAttr',
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.value_type')}</span>
        ),
        cell: info => {
          const numberAttr = info.row.original.type
          return numberAttr
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'idAttrLwM2M',
        header: () => <span>{t('cloud:org_manage.org_manage.table.id')}</span>,
        cell: info => {
          const idLwM2M = info.row.original.id
          return idLwM2M
        },
        footer: info => info.column.id,
      }),
      // columnHelper.accessor('logged', {
      //   header: () => (
      //     <span>{t('cloud:org_manage.org_manage.table.logged')}</span>
      //   ),
      //   cell: info => {
      //     const { attribute_key } = info.row.original

      //     return (
      //       <Switch
      //         key={attribute_key + +info.getValue()}
      //         defaultChecked={info.getValue() === 'true' ? true : false}
      //         onCheckedChange={checked => {
      //           debouncedSwitchChange(checked, attribute_key)
      //         }}
      //       />
      //     )
      //   },
      //   footer: info => info.column.id,
      // }),
    ],
    [],
  )
  return attributeInfo != null && attributeInfo?.length !== 0 ? (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={attributeInfo}
      columns={columns}
      {...props}
    />
  ) : (
    <div className="flex grow items-center justify-center">
      {showNoTemplateMessage && t('table:no_template')}
    </div>
  )
}
