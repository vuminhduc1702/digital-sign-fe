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
import { Certificate } from '@/features/certificate/types'
import { LuDownload, LuDownloadCloud } from 'react-icons/lu'
import { downloadFile } from '../api/downloadFile'

export function HistoryTable({}) {
  const { t } = useTranslation()

  const [page, setPage] = useState<number>(1)
  const [selectedCert, setSelectedCert] = useState<ActiveCertificate | null>(
    null,
  )

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

  const {
    data: historyData,
    refetch: refetchHistoryData,
    isLoading: historyIsLoading,
    isSuccess: historyIsSuccess,
    isPreviousData,
  } = useGetHistoryList({
    certificateId: Number(watch('certificate')),
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
            ? info.row.index + page
            : info.row.index + pagePrev.current
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
      columnHelper.accessor('fileName', {
        id: 'fileName',
        header: () => <span>{t('history:name')}</span>,
        cell: info => {
          return (
            <div>
              <p>{info.row.original.fileName}</p>
              <span className="text-secondary-700">{`(${info.row.original.fileSize})`}</span>
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
          const downloadData = {fileName: info.row.original.fileName, fileId: info.row.original.fileId}
          return (
            <LuDownload onClick={() => downloadFile(downloadData)}/>
          )
        },
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  useEffect(() => {
    if (certificateIsSuccess && certificateData && certificateData.length > 0) {
      setValue('certificate', certificateData[0].certificateId.toString())
    }
  }, [certificateIsSuccess, certificateData])

  useEffect(() => {
    console.log(watch('certificate'))
    if (watch('certificate') !== undefined) {
      const selectedCertificate =
        certificateData?.find(
          cert => cert.certificateId.toString() === getValues('certificate'),
        ) ?? null
        console.log('cert', selectedCertificate)
      if (selectedCertificate) {
        setSelectedCert(selectedCertificate)
        refetchHistoryData()
      }
    }
  }, [watch('certificate')])

  return (
    <div className="rounded-lg bg-white p-6">
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="certificate"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={() => {
                    onChange()
                    refetchHistoryData()
                  }} value={value} {...field}>
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
      {selectedCert && <CertificateDetail certificate={selectedCert} />}
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
    </div>
  )
}
