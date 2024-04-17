import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Link } from '@/components/Link'
import { BaseTable } from '@/components/Table'
import { PATHS } from '@/routes/PATHS'
import storage from '@/utils/storage'

import { type ModuleConfig } from '../types'
import { BaseTablePagination } from '@/types'

type LwM2MTableProps = {
  moduleConfig: ModuleConfig[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
}
export function LwM2MTable({ moduleConfig, ...props }: LwM2MTableProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const [showNoTemplateMessage, setShowNoTemplateMessage] = useState(false)
  const params = useParams()
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNoTemplateMessage(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [moduleConfig])
  const templateId = params.templateId as string
  const columnHelper = createColumnHelper<ModuleConfig>()
  const columns = useMemo<ColumnDef<ModuleConfig, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'name',
        header: () => <span>{t('cloud:device_template.listLwM2M.name')}</span>,
        cell: info => info.row.original.module_name,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'idLwM2M',
        header: () => <span>{t('cloud:device_template.listLwM2M.id')}</span>,
        cell: info => {
          const idLwM2M = info.row.original.id
          return idLwM2M
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'numberAttr',
        header: () => (
          <span>{t('cloud:device_template.listLwM2M.numberAttr')}</span>
        ),
        cell: info => {
          const numberAttr = info.row.original.numberOfAttributes
          return numberAttr
        },
        footer: info => info.column.id,
      }),
    ],
    [],
  )
  return moduleConfig != null && moduleConfig?.length !== 0 ? (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={moduleConfig}
      columns={columns}
      path={PATHS.TEMPLATE_LWM2M}
      projectId={projectId}
      orgId={templateId}
      {...props}
    />
  ) : (
    <div className="flex grow items-center justify-center">
      {showNoTemplateMessage && t('table:no_template')}
    </div>
  )
}
