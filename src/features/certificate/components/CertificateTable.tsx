import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Certificate } from '../types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDisclosure } from '@/utils/hooks'
import { CertificateDialog } from './CertificateDialog'
import { BaseTable } from '@/components/Table'
import { useGetCertificateList } from '../api/getCertificateList'
import { limitPagination } from '@/utils/const'
import moment from 'moment'
import { Button } from '@/components/ui/button'
import { LuDownload, LuEye, LuTrash } from 'react-icons/lu'

type CertificateProps = {
  certificate: Certificate
}

function CertificateInfo({ certificate }: CertificateProps) {
  const { t } = useTranslation()
  const { close, open, isOpen } = useDisclosure()

  return (
    <div className="flex">
      <div className="flex cursor-pointer justify-center p-3">
        <LuEye className="text-lg text-gray-500" onClick={open} />
        {isOpen ? (
          <CertificateDialog isOpen={isOpen} close={close} data={certificate} />
        ) : null}
      </div>
      <div className="flex cursor-pointer justify-center p-3">
        <LuDownload className="text-lg text-gray-500" />
      </div>
      <div className="flex cursor-pointer justify-center p-3">
        <LuTrash className="text-lg text-gray-500" />
      </div>
    </div>
  )
}

export function CertificateTable() {
  const { t } = useTranslation()

  const [page, setPage] = useState<number>(1)

  const { data, isLoading, isPreviousData } = useGetCertificateList({
    pageNum: page,
  })

  const pagePrev = useRef<number>(page)

  useEffect(() => {
    if (!isPreviousData) {
      pagePrev.current = page
    }
  }, [isPreviousData, page])

  const columnHelper = createColumnHelper<Certificate>()
  const columns = useMemo<ColumnDef<Certificate, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          return !isPreviousData
            ? info.row.index + page
            : info.row.index + pagePrev.current
        },
        header: () => <span>{t('certificate:stt')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('commonName', {
        id: 'commonName',
        header: () => <span>{t('certificate:issuer')}</span>,
        cell: info => info.row.original.commonName,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('subjectName', {
        id: 'subjectName',
        header: () => <span>{t('certificate:name')}</span>,
        cell: info => info.row.original.subjectName,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('typeName', {
        id: 'typeName',
        header: () => <span>{t('certificate:type')}</span>,
        cell: info => info.row.original.typeName,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'date',
        header: () => <span>{t('certificate:date')}</span>,
        cell: info => {
          const start = moment(info.row.original.notValidBefore).format(
            'HH:mm:ss DD/MM/YYYY',
          )
          const end = moment(info.row.original.notValidAfter).format(
            'HH:mm:ss DD/MM/YYYY',
          )

          return (
            <div>
              {start} - {end}
            </div>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('statusName', {
        id: 'statusName',
        header: () => <span>{t('certificate:status')}</span>,
        cell: info => info.row.original.statusName,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('serialNumber', {
        id: 'serialNumber',
        header: () => <span>{t('certificate:serial')}</span>,
        cell: info => info.row.original.serialNumber,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'action',
        header: () => <span>{t('certificate:action')}</span>,
        cell: info => {
          return CertificateInfo({ certificate: info.row.original })
        },
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return (
    <>
      <div className="bg-white p-6 rounded-lg">
        <BaseTable
          data={data?.data ?? []}
          columns={columns}
          isCheckbox={false}
          offset={page * limitPagination}
          setOffset={setPage}
          total={data?.meta?.total || data?.data?.length}
          isLoading={isLoading}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
