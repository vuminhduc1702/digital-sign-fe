import { useState } from 'react'

import storage from '~/utils/storage'

import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { InputField, SelectField } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { SearchIcon } from '~/components/SVGIcons'
import { useGetCustomers, type SearchFilter } from '../api/customerManageAPI'
import { CustomerTable } from '../components/Customer'

export function CustomerManageTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [key, setKey] = useState('name')
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({})
  const [value, setValue] = useState('')
  const { id: projectId } = storage.getProject()
  const { data, isPreviousData } = useGetCustomers({
    projectId,
    search_field: searchFilter.search_field,
    search_str: searchFilter.search_str,
    config: { keepPreviousData: true, staleTime: 0 },
  })

  const handleSearch = () => {
    setSearchFilter({
      search_field: key,
      search_str: value,
    })
  }

  return (
    <>
      {/* <TitleBar title={t('sidebar:payment.plkh')} /> */}
      <div className="flex grow flex-col px-9 py-3 shadow-lg bg-gray-50 rounded-md">
        <div className="flex justify-between mb-5">
          <div className="flex items-center gap-x-3">
            <SelectField
              options={[
                { label: 'Tên khách hàng', value: 'name' },
                { label: 'Mã khách hàng', value: 'customer_code' },
                { label: 'Số điện thoại', value: 'phone' },
              ]}
              onChange={e => {
                setKey(e.target.value)
              }}
              value={key}
            />
            <InputField
              value={value}
              className="mt-1 h-[37px]"
              onChange={e => setValue(e.target.value)}
            />
            <Button
              className="mt-1 h-[37px] rounded-md "
              variant="trans"
              size="square"
              startIcon={
                <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
              }
              onClick={handleSearch}
            />
          </div>
        </div>
        <CustomerTable
          data={data?.users}
          offset={offset}
          setOffset={setOffset}
          total={data?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
