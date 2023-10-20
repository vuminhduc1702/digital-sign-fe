import { useState } from 'react'

import storage from '~/utils/storage'

import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { InputField, SelectField } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { SearchIcon } from '~/components/SVGIcons'
import { useGetBillings } from '../api/billingAPI'
import {  BillingTable } from '../components/Billing'

export function BillingTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [key, setKey] = useState('subscription')
  const [searchFilter, setSearchFilter] = useState({
    search_field: '',
    search_str: '',
  })
  const [value, setValue] = useState('')
  const { id: projectId } = storage.getProject()
  const { data, isPreviousData } = useGetBillings({
    projectId,
    config: { keepPreviousData: true },
  })

  console.log(data, 'datadatadatadata')

  const handleSearch = () => {
    setSearchFilter({
      search_field: key,
      search_str: value,
    })
  }

  return (
    <>
      <TitleBar title={t('sidebar:payment.plhd')} />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-3">
            <SelectField
              options={[
                { label: 'Số hóa đơn', value: 'id' },
                { label: 'Tên khách hàng', value: 'customer_name' },
              ]}
              onChange={e => {
                setKey(e.target.value)
              }}
              value={key}
            />
            <InputField
              value={value}
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
        <BillingTable
          data={data?.data?.data}
          offset={offset}
          setOffset={setOffset}
          total={data?.data?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
