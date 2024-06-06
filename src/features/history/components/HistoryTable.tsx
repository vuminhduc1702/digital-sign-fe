import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SignHistory } from '../types'
import { BaseTable } from '@/components/Table'
import { SelectCertificate } from './SelectCertificate'
import { CertificateDetail } from './CertificateDetail'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import { useForm } from 'react-hook-form'
import { useGetCertificateList } from '@/features/certificate/api/getCertificateList'
import moment from 'moment'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ActiveCertificate,
  useGetActiveCertificateList,
} from '@/features/certificate/api/getActiveCertificate'
import { useGetHistoryList } from '../api/getHistoryList'
import { limitPagination } from '@/utils/const'

export function HistoryTable({}) {
  const { t } = useTranslation()

  const [page, setPage] = useState<number>(1)

  const pagePrev = useRef<number>(page)

  // useEffect(() => {
  //   if (!isPreviousData) {
  //     pagePrev.current = page
  //   }
  // }, [isPreviousData, page])

  const form = useForm()

  const { control, setValue, getValues, watch } = form

  const {
    data: certificateData,
    isLoading: certificateIsLoading,
    isSuccess: certificateIsSuccess,
  } = useGetActiveCertificateList({})

  const certificateInfo = new Map<number, ActiveCertificate>()

  certificateData?.forEach(cert => {
    certificateInfo.set(cert.certificateId, cert)
  })

  const {
    data: historyData,
    refetch: refetchHistoryData,
    isLoading: historyIsLoading,
    isSuccess: historyIsSuccess,
    isPreviousData,
  } = useGetHistoryList({
    certificateId: parseInt(getValues('certificate')),
    config: {
      enabled: false,
    },
  })

  useEffect(() => {
    if (!isPreviousData) {
      pagePrev.current = page
    }
  }, [isPreviousData, page])

  const columnHelper = createColumnHelper<SignHistory>()
  const columns = useMemo<ColumnDef<SignHistory, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          return !isPreviousData
            ? info.row.index + 1 + page
            : info.row.index + 1 + pagePrev.current
        },
        header: () => <span>{t('history:stt')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('typeName', {
        id: 'typeName',
        header: () => <span>{t('history:type')}</span>,
        cell: info => info.row.original.typeName,
        footer: info => info.column.id,
      }),
      // columnHelper.accessor('status', {
      //   id: 'status',
      //   header: () => <span>{t('history:status')}</span>,
      //   cell: info => info.row.original.status,
      //   footer: info => info.column.id,
      // }),
      columnHelper.accessor('fileName', {
        id: 'fileName',
        header: () => <span>{t('history:name')}</span>,
        cell: info => {
          return (
            <div>
              <p>{info.row.original.fileName}</p>
              <span>{info.row.original.fileSize}</span>
            </div>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('registTs', {
        id: 'registTs',
        header: () => <span>{t('history:date')}</span>,
        cell: info =>
          moment(info.row.original.registTs).format('DD/MM/YYYY HH:mm:ss'),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'action',
        header: () => <span>{t('history:action')}</span>,
        cell: info => {
          return <span>Tải xuống</span>
        },
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  useEffect(() => {
    if (certificateIsSuccess && certificateData) {
      setValue('certificate', certificateData[0].certificateId.toString())
    }
  }, [certificateIsSuccess])

  useEffect(() => {
    if (getValues('certificate')) {
      refetchHistoryData()
    }
  }, [watch('certificate')])

  return (
    <>
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="certificate"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={onChange} value={value} {...field}>
                    <SelectTrigger className="w-64 focus:outline-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {certificateData?.map(cert => (
                          <SelectItem
                            key={cert.certificateId}
                            value={cert.certificateId.toString()}
                          >
                            {cert.subjectName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
      {watch('certificate') && (
        <div className="grid grid-flow-col grid-rows-3">
          <p>
            Tên chứng thư số:{' '}
            {certificateInfo.get(parseInt(watch('certificate')))?.commonName}
          </p>
          <p>
            Chủ thể:{' '}
            {certificateInfo.get(parseInt(watch('certificate')))?.subjectName}
          </p>
          <p>
            Số series:{' '}
            {certificateInfo.get(parseInt(watch('certificate')))?.serialNumber}
          </p>
          <p>
            Hiệu lực:{' '}
            {moment(
              certificateInfo.get(parseInt(watch('certificate')))
                ?.notValidBefore,
            ).format('DD/mm/yyyy')}
            -{' '}
            {moment(
              certificateInfo.get(parseInt(watch('certificate')))
                ?.notValidAfter,
            ).format('DD/mm/yyyy')}
          </p>
          <p>
            Trạng thái:{' '}
            {certificateInfo.get(parseInt(watch('certificate')))?.statusName}
          </p>
        </div>
      )}
      <div>
        <BaseTable
          data={historyData?.data ?? []}
          columns={columns}
          isCheckbox={false}
          offset={page * limitPagination}
          setOffset={setPage}
          total={historyData?.meta.total || historyData?.data?.length}
          isLoading={historyIsLoading}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
