import { useMemo, useRef, useState } from 'react'

import storage from '@/utils/storage'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { searchSubcriptionSchema } from '@/cloud/subcription/routes/SubcriptionTemplate'
import { Button } from '@/components/Button'
import { InputField, SelectDropdown } from '@/components/Form'
import { SearchIcon } from '@/components/SVGIcons'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { useGetCustomers, type SearchFilter } from '../api/customerManageAPI'
import { CustomerTable } from '../components/Customer'
import { SearchField } from '@/components/Input'

export function CustomerManageTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({})
  const projectId = storage.getProject()?.id
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const { data, isPreviousData, isLoading } = useGetCustomers({
    projectId,
    search_field: searchFilter.search_field,
    search_str: searchFilter.search_str,
    config: { keepPreviousData: true, staleTime: 1000 },
  })
  const ref = useRef(null)
  const { register, formState, control, handleSubmit } = useForm({
    resolver: searchSubcriptionSchema && zodResolver(searchSubcriptionSchema),
    defaultValues: { value: '', key: '' },
  })

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('billing:customer_manage.table.customer_code'),
      t('billing:customer_manage.table.customer_name'),
      t('billing:customer_manage.table.phone'),
      t('billing:customer_manage.table.email'),
      t('billing:customer_manage.table.role'),
      t('billing:customer_manage.table.parent'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    data?.users?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.user_id)) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('billing:customer_manage.table.customer_code')]:
              curr.customer_code,
            [t('billing:customer_manage.table.customer_name')]: curr.name,
            [t('billing:customer_manage.table.phone')]: curr.phone,
            [t('billing:customer_manage.table.email')]: curr.email,
            [t('billing:customer_manage.table.role')]: curr.role_name ?? '',
            [t('billing:customer_manage.table.parent')]: curr.org_name ?? '',
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <>
      {/* <TitleBar title={t('sidebar:payment.plkh')} /> */}
      <div className="relative flex grow flex-col gap-10 px-9 py-3 shadow-lg">
        <form
          id="search-customer"
          className="flex justify-between"
          onSubmit={handleSubmit(values => {
            setSearchFilter({
              search_field: values.key,
              search_str: values.value,
            })
          })}
        >
          <div className="flex w-full items-center justify-between gap-x-3">
            <div className="w-96">
              <SelectDropdown
                isClearable={false}
                name="key"
                control={control}
                options={[
                  { label: t('schema:customer_name'), value: 'name' },
                  { label: t('schema:customer_code'), value: 'customer_code' },
                  { label: t('schema:customer_phone'), value: 'phone' },
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
        </form>
        <CustomerTable
          data={data?.users || []}
          offset={offset}
          setOffset={setOffset}
          total={data?.total ?? 0}
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
