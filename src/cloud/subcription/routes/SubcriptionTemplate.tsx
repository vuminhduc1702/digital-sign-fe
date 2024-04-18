import { useMemo, useRef, useState } from 'react'

import storage from '@/utils/storage'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Button } from '@/components/Button'
import { InputField, SelectDropdown } from '@/components/Form'
import { SearchIcon } from '@/components/SVGIcons'
import { useGetSubcriptons, type searchFilter } from '../api/subcriptionAPI'
import { CreateSubcription, SubcriptionTable } from '../components/Subcription'
import { convertEpochToDate } from '@/utils/transformFunc'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { SearchField } from '@/components/Input'

export const searchSubcriptionSchema = z.object({
  key: z.string().optional(),
  value: z.string(),
})

const valuePriceMethod = (value: string) => {
  switch (value) {
    case 'mass':
      return 'Theo khối lượng'
    case 'fix':
      return 'Cố định'
    case 'unit':
      return 'Theo đơn vị'
    case 'accumulated':
      return 'Theo lũy kế'
    case 'step':
      return 'Theo bậc thang'
    default:
      return ''
  }
}

const transformStatus = (stt: string) => {
  switch (stt) {
    case 'Active':
      return 'Hoạt động'
    case 'Pending Cancel':
      return 'Chờ hủy'
    case 'Cancelled':
      return 'Đã hủy'
    case 'Pending Active':
      return 'Chờ kích hoạt'
    case 'Finished':
      return 'Đã kết thúc'
    default:
      return ''
  }
}
export function SubcriptionTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [searchFilter, setSearchFilter] = useState({
    search_field: '',
    search_str: '',
  })
  const [searchData, setsearchData] = useState<searchFilter>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const projectId = storage.getProject()?.id
  const { data, isLoading, isPreviousData } = useGetSubcriptons({
    projectId,
    search_field: searchFilter.search_field,
    search_str: searchFilter.search_str,
    searchData: searchData,
    config: { keepPreviousData: true, staleTime: 1000 },
  })
  const ref = useRef(null)
  const handleField = (field: string, value: any) => {
    const newObj: searchFilter = {}
    newObj[field] = value
    setsearchData(newObj)
  }

  const { register, formState, control, handleSubmit } = useForm({
    resolver: searchSubcriptionSchema && zodResolver(searchSubcriptionSchema),
    defaultValues: { value: '', key: '' },
  })

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('billing:subcription.table.sub_code'),
      t('billing:subcription.table.customer_code'),
      t('billing:subcription.table.customer_name'),
      t('billing:subcription.table.package'),
      t('billing:subcription.table.period'),
      t('billing:subcription.table.price_method'),
      t('billing:subcription.table.start_date'),
      t('billing:subcription.table.cycle_now'),
      t('billing:subcription.table.status'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    data?.data?.data?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(index.toString())) {
          const temp = {
            [t('billing:subcription.table.sub_code')]: curr.s_id,
            [t('billing:subcription.table.customer_code')]:
              curr.c_customer_code,
            [t('billing:subcription.table.customer_name')]: curr.c_name,
            [t('billing:subcription.table.package')]: curr.p_name,
            [t('billing:subcription.table.period')]:
              curr.p_period + ' ' + curr.p_cal_unit,
            [t('billing:subcription.table.price_method')]: valuePriceMethod(
              curr.p_estimate,
            ),
            [t('billing:subcription.table.start_date')]: convertEpochToDate(
              curr.s_date_register,
            ),
            [t('billing:subcription.table.cycle_now')]: curr.s_cycle_now,
            [t('billing:subcription.table.status')]: transformStatus(
              curr.s_status,
            ),
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <>
      {/* <TitleBar title={t('sidebar:payment.pldk')} /> */}
      <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
        <div className="mb-5 flex justify-between">
          <form
            id="search-subcription"
            // className="flex flex-col justify-between space-y-6"
            className="flex w-full items-center justify-between gap-x-3"
            onSubmit={handleSubmit(values => {
              setSearchFilter({
                search_field: values.key,
                search_str: values.value,
              })
            })}
          >
            <div className="flex gap-x-[14px]">
              <div className="w-96">
                <SelectDropdown
                  isClearable={false}
                  name="key"
                  control={control}
                  options={[
                    {
                      label: t('schema:registration_code'),
                      value: 'subscription',
                    },
                    {
                      label: t('schema:customer_code'),
                      value: 'customer_code',
                    },
                    { label: t('schema:customer_name'), value: 'name' },
                  ]}
                  // error={formState?.errors?.key}
                />
              </div>
              <SearchField
                setSearchValue={setSearchQuery}
                setIsSearchData={setIsSearchData}
                closeSearch={true}
              />
            </div>
            <CreateSubcription />
          </form>
          {/* <div className="flex items-center gap-x-3">
            <CreateSubcription />
          </div> */}
        </div>

        <SubcriptionTable
          data={data?.data?.data}
          offset={offset}
          setOffset={setOffset}
          handleField={handleField}
          total={data?.data?.total ?? 0}
          isPreviousData={isPreviousData}
          isLoading={isLoading}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          pdfHeader={pdfHeader}
          formatExcel={formatExcel}
          isSearchData={searchQuery.length > 0 && isSearchData}
        />
      </div>
    </>
  )
}
