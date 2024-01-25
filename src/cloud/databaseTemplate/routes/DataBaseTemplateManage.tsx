import { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { ContentLayout } from '~/layout/ContentLayout'
import storage from '~/utils/storage'
import { DataBaseSidebar, DataBaseTable } from '../components'

import { useSelectDataBase } from '../api/selectDataBase'
import CreateColumn from '../components/CreateColumn'
import CreateRows from '../components/CreateRows'
import { FieldsRows } from '../types'
import { InputField, SelectDropdown, SelectOption } from '~/components/Form'
import { Button } from '~/components/Button'
import { SearchIcon } from '~/components/SVGIcons'
import { searchSubcriptionSchema } from '~/cloud/subcription/routes/SubcriptionTemplate'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Switch } from '~/components/Switch'
import * as z from 'zod'

export const searchDataBaseSchema = z.object({
  key: z.string().optional(),
  limit: z.string(),
})

export function DataBaseTemplateManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    FieldsRows[]
  >([])

  const [isShow, setIsShow] = useState(false)
  const [key, setKey] = useState<SelectOption | undefined>({ label: 'AND', value: '$and' })
  const [dataConvert, setDataConvert] = useState<FieldsRows[]>([])

  const { tableName } = useParams()

  const projectId = storage.getProject()?.id

  const { data, mutate, isLoading } = useSelectDataBase()

  const keySelect = [
    { label: 'AND', value: '$and' },
    { label: 'OR', value: '$or' },
    { label: 'ONLY', value: '$only' },
  ]

  const { register, formState, control, handleSubmit, setValue, getValues } = useForm({
    resolver: searchDataBaseSchema && zodResolver(searchDataBaseSchema),
    values: { limit: '', key: '$and' },
  })

  useEffect(() => {
    if (tableName) {
      mutate({ table: tableName, project_id: projectId })
    }
    setIsShow(false)
    setValue('key', '$and')
    setValue('limit', '')
    setKey({ label: 'AND', value: '$and' })
  }, [tableName])

  const refetchData = () => {
    if (tableName) {
      mutate({ table: tableName, project_id: projectId })
    }
  }

  const onSearch = (value: FieldsRows) => {
    let keys = Object.keys(value)
    const data = keys.map(item => ({
      [item]: value[item],
    }))
    setDataConvert(data)
  }

  useEffect(() => {
    if (data?.data?.columns) {
      let result = []
      const lc = data?.data?.columns.length
      const lr = data?.data?.rows.length
      for (var i = 0; i < lr; i++) {
        var dataRow = data?.data?.rows?.[i]
        const row: FieldsRows = {}
        for (var j = 0; j < lc; j++) row[data?.data?.columns?.[j]] = dataRow[j]
        result.push(row)
      }
      setFilteredComboboxData(result)
    }
  }, [data])

  return (
    <ContentLayout title={t('sidebar:cloud.db_template')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <DataBaseSidebar />
        </div>

        {projectId && tableName ? (
          <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
            <Suspense
              fallback={
                <div className="flex grow items-center justify-center md:col-span-2">
                  <Spinner size="xl" />
                </div>
              }
            >
              <TitleBar title={t('sidebar:cloud.db_template')} />
              <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
                <div className="flex justify-between">
                  <ExportTable refComponent={ref} />
                  <div className="flex items-center gap-x-3">
                    <CreateRows onClose={refetchData} columnsProp={data?.data?.columns || []} />
                    <form
                      id="search-subcription"
                      className="flex flex-col justify-between space-y-6"
                      onSubmit={handleSubmit(values => {
                        const data = {
                          struct_scan: false,
                          limit: parseInt(values.limit) || null,
                          filter: {
                            [values.key]: dataConvert
                          }
                        }
                        mutate({ table: tableName, project_id: projectId, data })
                      })}
                    >
                      <div className="flex items-center gap-x-3">
                        <SelectDropdown
                          isClearable={false}
                          name="key"
                          control={control}
                          value={key}
                          customOnChange={e => {
                            const result = keySelect.find(
                              item => item.value === e,
                            )
                            setKey(result)
                          }}
                          options={keySelect}
                        />
                        <InputField
                          className="h-[37px]"
                          error={formState.errors['limit']}
                          registration={register('limit')}
                        />
                        <Switch
                          onCheckedChange={checked =>
                            setIsShow(checked)
                          }
                          checked={isShow}
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
                  </div>
                </div>
                {data?.data?.columns && (
                  <DataBaseTable
                    isShow={isShow}
                    columnsProp={data?.data?.columns}
                    data={filteredComboboxData}
                    onClose={refetchData}
                    onSearch={onSearch}
                  />
                )}
                <CreateColumn onClose={refetchData} />
              </div>
            </Suspense>
          </div>
        ) : null}
      </div>
    </ContentLayout>
  )
}
