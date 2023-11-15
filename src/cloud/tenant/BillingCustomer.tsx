import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { InputField, SelectField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { useCustomerList } from './api/getCustomerListApi'
import { BillingCustomerTable } from './components/BillingCustomerTable'
import { CreateCustomer } from './components/CreateCustomer'

const Tenant = () => {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [key, setKey] = useState('name')
  const [searchFilter, setSearchFilter] = useState({
    search_field: 'name',
    search_str: '',
  })
  const [value, setValue] = useState('')

  const handleSearch = () => {
    console.log(key, value)
    setSearchFilter({
      search_field: key,
      search_str: value,
    })
  }

  const { data: customerData, isPreviousData } = useCustomerList({
    data: {
      limit: 10 || 10,
      offset: offset || 0,
      search_field: searchFilter.search_field,
      search_str: searchFilter.search_str,
    },
    config: {
      suspense: false,
    },
  })

  console.log(customerData, 'check data')
  const formatData = (data: any) => {
    return data.map((item: any) => {
      return {
        name: item.name,
        phone: item.phone,
        email: item.email,
        system_role: item.system_role,
        company: item.profile.company,
        id: item.id,
        permissions: item.permissions,
      }
    })
  }

  return (
    <div className="flex grow flex-col px-9 py-3 shadow-lg">
      <div className="mb-4 flex justify-between">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-3">
            <SelectField
              options={[
                { label: t('form:user.name'), value: 'name' },
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
            <InputField
              value={value}
              className="mt-1 h-[37px]"
              onChange={e => setValue(e.target.value)}
            />
            <Button
              className="rounded-md"
              variant="trans"
              size="square"
              startIcon={
                <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
              }
              onClick={handleSearch}
            />
          </div>
        </div>

        <CreateCustomer />
      </div>

      <BillingCustomerTable
        data={formatData(customerData?.tenant || [])}
        offset={offset}
        setOffset={setOffset}
        total={customerData?.total}
        isPreviousData={isPreviousData}
      />
    </div>
  )
}

export default Tenant
