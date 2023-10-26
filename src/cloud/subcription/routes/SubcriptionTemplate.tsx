import { useState } from 'react'

import storage from '~/utils/storage'

import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { InputField, SelectField } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { SearchIcon } from '~/components/SVGIcons'
import { type searchFilter, useGetSubcriptons } from '../api/subcriptionAPI'
import { CreateSubcription, SubcriptionTable } from '../components/Subcription'

export function SubcriptionTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [key, setKey] = useState('subscription')
  const [searchFilter, setSearchFilter] = useState({
    search_field: '',
    search_str: '',
  })
  const [searchData, setsearchData] = useState<searchFilter>({})
  const [value, setValue] = useState('')
  const { id: projectId } = storage.getProject()
  const { data, isPreviousData } = useGetSubcriptons({
    projectId,
    search_field: searchFilter.search_field,
    search_str: searchFilter.search_str,
    searchData: searchData,
    config: { keepPreviousData: true, staleTime: 0 },
  })

  const handleSearch = () => {
    setSearchFilter({
      search_field: key,
      search_str: value,
    })
  }

  const handleField = (field: string, value: any) => {
    const newObj: searchFilter = {}
    newObj[field] = value
    setsearchData(newObj)
  }

  return (
    <>
      <TitleBar title={t('sidebar:payment.pldk')} />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-3">
            <SelectField
              options={[
                { label: 'Mã đăng ký', value: 'subscription' },
                { label: 'Mã khách hàng', value: 'customer_code' },
                { label: 'Tên khách hàng', value: 'name' },
              ]}
              onChange={e => {
                setKey(e.target.value)
              }}
              value={key}
            />
            <InputField
              value={value}
              className='mt-1 h-[39px]'
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
          <div className="flex items-center gap-x-3">
            <CreateSubcription />
          </div>
        </div>
        <SubcriptionTable
          data={data?.data?.data}
          offset={offset}
          setOffset={setOffset}
          handleField={handleField}
          total={data?.data?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
