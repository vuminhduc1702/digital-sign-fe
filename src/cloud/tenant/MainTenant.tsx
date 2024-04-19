import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { InputField, SelectField } from '@/components/Form'
import { SearchIcon } from '@/components/SVGIcons'
import { useCustomerList } from './api/getTenantListApi'
import { TenantTable } from './components/TenantTable'
import { CreateCustomer } from './components/CreateTenant'
import { useNavigate } from 'react-router-dom'
import narrowLeft from '@/assets/icons/narrow-left.svg'
import { ContentLayout } from '@/layout/ContentLayout'
import { limitPagination } from '@/utils/const'
import { SearchField } from '@/components/Input'

const MainTenant = () => {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const [key, setKey] = useState('name')
  const [searchFilter, setSearchFilter] = useState({
    search_field: 'name',
    search_str: '',
  })
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    setSearchFilter({
      search_field: key,
      search_str: value,
    })
  }

  const {
    data: customerData,
    isPreviousData,
    isLoading,
  } = useCustomerList({
    data: {
      limit: limitPagination,
      offset: offset || 0,
      search_field: searchFilter.search_field,
      search_str: searchFilter.search_str,
    },
    config: {
      suspense: false,
    },
  })

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:tenant.table.tenant'),
      t('cloud:tenant.table.phone'),
      t('cloud:tenant.table.email'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel = customerData?.tenant?.reduce(
    (acc, curr, index) => {
      if (rowSelectionKey.includes(curr.id)) {
        const temp = {
          [t('table:no')]: (index + 1 + offset).toString(),
          [t('cloud:tenant.table.tenant')]: curr.tenant,
          [t('cloud:tenant.table.phone')]: curr.phone,
          [t('cloud:tenant.table.email')]: curr.email,
        }
      }
      return acc
    },
    [] as Array<{ [key: string]: string }>,
  )

  return (
    <ContentLayout title="Tenant">
      <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
        <div
          className="mb-6 mr-auto flex cursor-pointer rounded-md border border-secondary-700 px-3 py-2 text-base font-medium"
          onClick={() => navigate(-1)}
        >
          <img src={narrowLeft} alt="left" className="aspect-square w-[20px]" />
          <span className="ml-2">{t('form:back')}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <div className="flex justify-between">
            <div className="flex w-full items-center justify-between gap-x-3">
              <SelectField
                options={[
                  { label: 'Tenant', value: 'name' },
                  {
                    label: t('cloud:org_manage.user_manage.add_user.phone'),
                    value: 'phone',
                  },
                ]}
                onChange={e => {
                  setKey(e.target.value)
                }}
                value={key}
              />
              <SearchField
                setSearchValue={setSearchQuery}
                setIsSearchData={setIsSearchData}
                closeSearch={true}
              />
            </div>
          </div>

          <CreateCustomer />
        </div>

        <TenantTable
          data={customerData?.tenant ?? []}
          offset={offset}
          setOffset={setOffset}
          total={customerData?.total}
          isPreviousData={isPreviousData}
          isLoading={isLoading}
          isSearchData={searchQuery.length > 0 && isSearchData}
          pdfHeader={pdfHeader}
          formatExcel={formatExcel}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </ContentLayout>
  )
}

export default MainTenant
