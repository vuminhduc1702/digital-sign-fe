import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useDisclosure } from '@/utils/hooks'

import TitleBar from '@/components/Head/TitleBar'
import { ContentLayout } from '@/layout/ContentLayout'
import storage from '@/utils/storage'
import { DataBaseSidebar, DataBaseTable } from '../components'

import { type DataSearchTable, useSelectDataBase } from '../api/selectDataBase'
import CreateColumn from '../components/CreateColumn'
import CreateRows from '../components/CreateRows'
import { type FieldsRows } from '../types'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '@/components/Form'
import { Button } from '@/components/ui/button'
import { SearchIcon } from '@/components/SVGIcons'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Switch } from '@/components/ui/switch'
import * as z from 'zod'
import { ReloadIcon } from '@radix-ui/react-icons'
import { PlusIcon } from '@/components/SVGIcons'

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
  const [key, setKey] = useState<SelectOption | undefined>({
    label: 'AND',
    value: '$and',
  })
  const [keySearch, setKeySearch] = useState<string[]>([])
  const [dataLike, setDataLike] = useState<FieldsRows[]>([])
  const [dataExact, setDataExact] = useState<FieldsRows[]>([])
  const [textValidate, setTextValidate] = useState('')
  const [searchExact, setSearchExact] = useState(false)

  const { tableName } = useParams()

  const projectId = storage.getProject()?.id

  const { data, mutate, isLoading } = useSelectDataBase()
  const {
    open: openCreateColumn,
    close: closeCreateColumn,
    isOpen: isOpenCreateColumn,
  } = useDisclosure()
  const {
    open: openCreateRow,
    close: closeCreateRow,
    isOpen: isOpenCreateRow,
  } = useDisclosure()

  const keySelect = [
    { label: 'AND', value: '$and' },
    { label: 'OR', value: '$or' },
    { label: 'ONLY', value: '$only' },
  ]

  const { register, formState, control, handleSubmit, setValue, getValues } =
    useForm({
      resolver: searchDataBaseSchema && zodResolver(searchDataBaseSchema),
      values: { limit: '', key: '$and' },
    })

  useEffect(() => {
    if (tableName) {
      mutate({ table: tableName, project_id: projectId })
    }
    setIsShow(false)
    setSearchExact(false)
    setValue('key', '$and')
    setValue('limit', '')
    setKey({ label: 'AND', value: '$and' })
    setKeySearch([])
    setTextValidate('')
  }, [tableName])

  const refetchData = () => {
    if (tableName) {
      setIsShow(false)
      setTextValidate('')
      mutate({ table: tableName, project_id: projectId })
    }
  }

  const onSearch = (value: FieldsRows) => {
    let keys = Object.keys(value)
    const dataExactConvert = keys.map(item => ({
      [item]: value[item],
    }))
    const dataLikeConvert = keys.map(item => ({
      [item]: { $like: value[item] },
    }))
    setKeySearch(keys)
    setDataExact(dataExactConvert)
    setDataLike(dataLikeConvert)
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
            <TitleBar title={t('sidebar:cloud.db_template')} />
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-end">
                <div className="mr-[42px] flex items-center gap-x-3">
                  <div className="flex items-center gap-x-2">
                    <Button
                      className="w-full justify-start rounded-md"
                      variant="trans"
                      size="square"
                      startIcon={
                        <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                      }
                      onClick={openCreateRow}
                    >
                      {t('cloud:db_template.add_db.add_row')}
                    </Button>
                  </div>
                  {data?.data?.columns && (
                    <div className="flex items-center gap-x-2">
                      <Button
                        className="w-full justify-start rounded-md"
                        variant="trans"
                        size="square"
                        startIcon={
                          <PlusIcon
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                          />
                        }
                        onClick={openCreateColumn}
                      >
                        {t('cloud:db_template.add_db.add_column')}
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-x-2">
                    <Button
                      className="w-full justify-start rounded-md "
                      variant="trans"
                      size="square"
                      onClick={refetchData}
                      startIcon={
                        <ReloadIcon
                          className="mt-0.5"
                          width={16}
                          height={16}
                          viewBox="0 0 16 16"
                        />
                      }
                    >
                      {t('cloud:db_template.add_db.reload')}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <form
                  id="search-subcription"
                  className="flex flex-col justify-between space-y-6"
                  onSubmit={handleSubmit(values => {
                    setIsShow(true)
                    let data: DataSearchTable = {}
                    if (values.key === '$and' || values.key === '$or') {
                      data = {
                        struct_scan: false,
                        limit: parseInt(values.limit) || null,
                        filter: {
                          [values.key]: searchExact ? dataExact : dataLike,
                        },
                      }
                      if (searchExact) {
                        const checkData = dataExact?.map(
                          (item, index) => item[keySearch[index]],
                        )
                        const checkDataValue = checkData?.filter(item => item)
                        if (checkDataValue?.length < 2) {
                          setTextValidate(
                            '* Vui lòng nhập ít nhất 2 trường tìm kiếm với phương thức AND hoặc OR',
                          )
                        } else {
                          setTextValidate('')
                          mutate({
                            table: tableName,
                            project_id: projectId,
                            data,
                          })
                        }
                      } else {
                        const checkData = dataLike?.map(
                          (item, index) => item[keySearch[index]],
                        )
                        const checkDataValue = checkData?.filter(
                          item => item.$like,
                        )
                        if (checkDataValue?.length < 2) {
                          setTextValidate(
                            '* Vui lòng nhập ít nhất 2 trường tìm kiếm với phương thức AND hoặc OR',
                          )
                        } else {
                          setTextValidate('')
                          mutate({
                            table: tableName,
                            project_id: projectId,
                            data,
                          })
                        }
                      }
                    } else if (values.key === '$only') {
                      data = {
                        struct_scan: false,
                        limit: parseInt(values.limit) || null,
                        filter: searchExact ? dataExact[0] : dataLike[0],
                      }
                      if (searchExact) {
                        const checkData = dataExact?.map(
                          (item, index) => item[keySearch[index]],
                        )
                        const checkDataValue = checkData?.filter(item => item)
                        if (checkDataValue?.length === 1) {
                          setTextValidate('')
                          mutate({
                            table: tableName,
                            project_id: projectId,
                            data,
                          })
                        } else {
                          setTextValidate(
                            '* Vui lòng nhập 1 trường tìm kiếm với phương thức ONLY',
                          )
                        }
                      } else {
                        const checkData = dataLike?.map(
                          (item, index) => item[keySearch[index]],
                        )
                        const checkDataValue = checkData?.filter(
                          item => item.$like,
                        )
                        if (checkDataValue?.length === 1) {
                          setTextValidate('')
                          mutate({
                            table: tableName,
                            project_id: projectId,
                            data,
                          })
                        } else {
                          setTextValidate(
                            '* Vui lòng nhập 1 trường tìm kiếm với phương thức ONLY',
                          )
                        }
                      }
                    }
                  })}
                >
                  <div className="mr-[42px] flex items-center gap-x-3">
                    <SelectDropdown
                      isClearable={false}
                      name="key"
                      control={control}
                      value={key}
                      customOnChange={e => {
                        const result = keySelect.find(item => item.value === e)
                        setKey(result)
                      }}
                      options={keySelect}
                    />
                    <InputField
                      className="h-[37px]"
                      error={formState.errors['limit']}
                      registration={register('limit')}
                      type="number"
                      min={1}
                      placeholder={t('cloud:db_template.add_db.limit')}
                    />
                    {/* <Switch
                          onCheckedChange={checked =>
                            setIsShow(checked)
                          }
                          checked={isShow}
                        /> */}
                    <Switch
                      onCheckedChange={checked => setSearchExact(checked)}
                      checked={searchExact}
                    />
                    <span className="relative w-3/4">
                      {t('cloud:db_template.add_db.search_exact')}
                    </span>
                    <Button
                      className="rounded-md"
                      variant="trans"
                      size="square"
                      startIcon={
                        <SearchIcon
                          width={16}
                          height={16}
                          viewBox="0 0 16 16"
                        />
                      }
                      form="search-subcription"
                      type="submit"
                    />
                  </div>
                </form>
              </div>
              {textValidate && (
                <div className="mt-2 text-red-500">{textValidate}</div>
              )}
              {data?.data?.columns && (
                <DataBaseTable
                  isShow={isShow}
                  columnsProp={data?.data?.columns}
                  data={filteredComboboxData}
                  onClose={refetchData}
                  onSearch={onSearch}
                />
              )}
              {isOpenCreateColumn && (
                <CreateColumn
                  isSearch={isShow}
                  isValidate={textValidate}
                  close={closeCreateColumn}
                  open={openCreateColumn}
                  isOpen={isOpenCreateColumn}
                  onClose={refetchData}
                />
              )}
              {isOpenCreateRow && (
                <CreateRows
                  onClose={refetchData}
                  columnsProp={data?.data?.columns || []}
                  close={closeCreateRow}
                  open={openCreateRow}
                  isOpen={isOpenCreateRow}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ContentLayout>
  )
}
