import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { useRoleById } from '../api/getRoleById'
import { BaseTable } from '~/components/Table'

import { type Policies } from '../types'

export function PolicyTable({ ...props }) {
  const { t } = useTranslation()

  const params = useParams()
  const roleId = params.roleId as string
  const { data } = useRoleById({ roleId })

  const columnHelper = createColumnHelper<Policies>()
  const columns = useMemo<ColumnDef<Policies, string>[]>(
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
      columnHelper.accessor('policy_name', {
        header: () => <span>{t('cloud:role_manage.add_policy.name')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return data != null && data?.policies.length !== 0 ? (
    <BaseTable data={data.policies} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_policy')}
    </div>
  )
}
