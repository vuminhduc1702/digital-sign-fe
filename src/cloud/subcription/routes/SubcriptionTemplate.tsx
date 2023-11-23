import { useState } from 'react'

import storage from '~/utils/storage'

import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { InputField, SelectDropdown } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { SearchIcon } from '~/components/SVGIcons'
import { type searchFilter, useGetSubcriptons } from '../api/subcriptionAPI'
import { CreateSubcription, SubcriptionTable } from '../components/Subcription'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const searchSubcriptionSchema = z.object({
  key: z.string().optional(),
  value: z.string(),
})

export function SubcriptionTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [searchFilter, setSearchFilter] = useState({
    search_field: '',
    search_str: '',
  })
  const [searchData, setsearchData] = useState<searchFilter>({})
  const { id: projectId } = storage.getProject()
  const { data, isPreviousData } = useGetSubcriptons({
    projectId,
    search_field: searchFilter.search_field,
    search_str: searchFilter.search_str,
    searchData: searchData,
    config: { keepPreviousData: true, staleTime: 0 },
  })

  const handleField = (field: string, value: any) => {
    const newObj: searchFilter = {}
    newObj[field] = value
    setsearchData(newObj)
  }

  const { register, formState, control, handleSubmit } =
    useForm({
      resolver: searchSubcriptionSchema && zodResolver(searchSubcriptionSchema),
      defaultValues: { value: '', key: '' },
    })

  return (
    <>
      <TitleBar title={t('sidebar:payment.pldk')} />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <form
            id="search-subcription"
            className="flex flex-col justify-between space-y-6"
            onSubmit={handleSubmit(values => {
              setSearchFilter({
                search_field: values.key,
                search_str: values.value,
              })
            })}
          >
            <div className="flex items-center gap-x-3">
            <div className='w-96'>
              <SelectDropdown
                isClearable={false}
                name="key"
                control={control}
                options={[
                  { label: 'Mã đăng ký', value: 'subscription' },
                  { label: 'Mã khách hàng', value: 'customer_code' },
                  { label: 'Tên khách hàng', value: 'name' },
                ]}
              />
              </div>
              <InputField
                className='h-[37px]'
                error={formState.errors['value']}
                registration={register('value')}
              />
              <Button
                className="rounded-md"
                variant="trans"
                size="square"
                startIcon={
                  <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
                }
                form="search-subcription"
                type="submit"
              />
            </div>
          </form>
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
