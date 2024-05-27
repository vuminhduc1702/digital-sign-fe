import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import TitleBar from '@/components/Head/TitleBar'
import storage from '@/utils/storage'
import { useGetAdapters } from '../api/adapter'
import { AdapterTable, CreateAdapter } from '../components'
import { ContentLayout } from '@/layout/ContentLayout'

import { type Adapter } from '../types'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { useDeleteMultipleAdapters } from '../api/adapter/deleteMultipleAdapter'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/Form'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SearchField } from '@/components/Input'

export function CustomProtocolManage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)
  const searchField = useRef('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()
  const {
    close: closeAdapter,
    open: openAdapter,
    isOpen: isOpenAdapter,
  } = useDisclosure()

  const projectId = storage.getProject()?.id
  const {
    data: adapterData,
    isLoading: isLoadingAdapter,
    isPreviousData: isPreviousDataAdapter,
  } = useGetAdapters({
    projectId,
    offset,
    search_field: searchField.current,
    search_str: searchQuery,
  })

  const {
    mutate: mutateDeleteMultipleAdapters,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAdapters,
  } = useDeleteMultipleAdapters()

  useEffect(() => {
    if (isSuccessDeleteMultipleAdapters) {
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleAdapters])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:custom_protocol.adapter.table.name'),
      t('cloud:custom_protocol.adapter.table.protocol'),
      t('cloud:custom_protocol.adapter.table.thing_id'),
      t('cloud:custom_protocol.adapter.table.handle_service'),
      t('cloud:custom_protocol.adapter.table.host'),
      t('cloud:custom_protocol.adapter.table.port'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    adapterData?.adapters
      ? adapterData?.adapters?.reduce(
          (acc, curr, index) => {
            if (rowSelectionKey.includes(curr.id)) {
              const temp = {
                [t('table:no')]: (index + 1).toString(),
                [t('cloud:dashboard.table.name')]: curr.name,
                [t('cloud:custom_protocol.adapter.table.protocol')]:
                  curr.protocol,
                [t('cloud:custom_protocol.adapter.table.thing_id')]:
                  curr.thing_id,
                [t('cloud:custom_protocol.adapter.table.handle_service')]:
                  curr.handle_service,
                [t('cloud:custom_protocol.adapter.table.host')]: curr.host,
                [t('cloud:custom_protocol.adapter.table.port')]: curr.port,
              }
              acc.push(temp)
            }
            return acc
          },
          [] as Array<{ [key: string]: unknown }>,
        )
      : []

  return (
    <ContentLayout title={t('sidebar:cloud.custom_protocol')}>
      <div className="flex grow flex-col">
        <TitleBar title={t('cloud:custom_protocol.adapter.header')} />
        <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
          <div className="flex justify-between">
            <div className="flex w-full items-center justify-between gap-x-3">
              <SearchField
                setSearchValue={setSearchQuery}
                searchField={searchField}
                fieldOptions={[
                  {
                    value: 'name,id',
                    label: t('search:all'),
                  },
                  {
                    value: 'name',
                    label: t('cloud:custom_protocol.adapter.name'),
                  },
                  {
                    value: 'id',
                    label: t('cloud:custom_protocol.adapter.id'),
                  },
                ]}
                setIsSearchData={setIsSearchData}
                closeSearch={true}
              />
              <Button
                className="h-[38px] rounded border-none"
                onClick={openAdapter}
              >
                {t('cloud:custom_protocol.adapter.button')}
              </Button>
            </div>
          </div>
          <AdapterTable
            data={adapterData?.adapters ?? []}
            offset={offset}
            setOffset={setOffset}
            total={adapterData?.total ?? 0}
            isPreviousData={isPreviousDataAdapter}
            isLoading={isLoadingAdapter}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            pdfHeader={pdfHeader}
            formatExcel={formatExcel}
            isSearchData={searchQuery.length > 0 && isSearchData}
            utilityButton={
              Object.keys(rowSelection).length > 0 && (
                <div className="flex items-center">
                  <Button
                    size="sm"
                    onClick={openDeleteMulti}
                    className="h-full min-w-[60px] rounded-none border-none hover:opacity-80"
                  >
                    <div>{t('btn:delete')}:</div>
                    <div>{Object.keys(rowSelection).length}</div>
                  </Button>
                </div>
              )
            }
          />
        </div>
        <CreateAdapter close={closeAdapter} isOpen={isOpenAdapter} />
        <ConfirmDialog
          icon="danger"
          title={t('cloud:dashboard.table.delete_dashboard_full')}
          body={t('cloud:dashboard.table.delete_multiple_dashboard_confirm')}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          isSuccessDelete={isSuccessDeleteMultipleAdapters}
          handleSubmit={() =>
            mutateDeleteMultipleAdapters(
              {
                data: { ids: rowSelectionKey },
              },
              { onSuccess: () => setRowSelection({}) },
            )
          }
          isLoading={isLoading}
        />
      </div>
    </ContentLayout>
  )
}
