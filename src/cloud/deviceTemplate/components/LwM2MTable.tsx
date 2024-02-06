import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Link } from '~/components/Link'
import { BaseTable } from '~/components/Table'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'

import { type ModuleConfig } from '../types'

type LwM2MTableProps = {
  module_config: ModuleConfig[]
}

export function LwM2MTable({ module_config, ...props }: LwM2MTableProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const [showNoTemplateMessage, setShowNoTemplateMessage] = useState(false)
  const params = useParams()
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNoTemplateMessage(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [module_config])
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
        cell: info => {
          const nameLwM2M = info.row.original.module_name
          const id = info.row.original.id
          return (
            <Link
              to={`${PATHS.TEMPLATE_LWM2M}/${projectId}/${templateId}/${id}`}
            >
              <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
                {nameLwM2M}
              </p>
            </Link>
          )
        },
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
  return module_config != null && module_config?.length !== 0 ? (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={module_config}
      columns={columns}
      {...props}
    />
  ) : (
    <div className="flex grow items-center justify-center">
      {showNoTemplateMessage && t('table:no_template')}
    </div>
  )
}
