import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import { ContentLayout } from '~/layout/ContentLayout'
import storage from '~/utils/storage'
import { useGetAdapters } from '../api/adapter'
import { AdapterTable, CreateAdapter } from '../components'

import { Button } from '~/components/Button'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useDeleteMultipleAdapters } from '../api/adapter/deleteMultipleAdapter'
import { SearchField } from '~/components/Input'
import { useDisclosure } from '~/utils/hooks'
import { ConfirmDialog } from '~/components/ConfirmDialog'

export function CustomProtocolManage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { close, open, isOpen } = useDisclosure()

  const projectId = storage.getProject()?.id
  const {
    data: adapterData,
    isPreviousData,
    isSuccess,
  } = useGetAdapters({
    projectId,
    offset,
    config: { keepPreviousData: true },
  })

  const {
    mutate: mutateDeleteMultipleAdapters,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAdapters,
  } = useDeleteMultipleAdapters()

  useEffect(() => {
    if (isSuccessDeleteMultipleAdapters) {
      close()
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
  const aoo: Array<{ [key: string]: unknown }> | undefined =
    adapterData?.adapters
      ? adapterData?.adapters?.reduce((acc, curr, index) => {
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
        }, [] as Array<{ [key: string]: unknown }>)
      : []

  return (
    <ContentLayout title={t('cloud:custom_protocol.title')}>
      <TitleBar title={t('cloud:custom_protocol.adapter.header')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable
            refComponent={ref}
            rowSelection={rowSelection}
            aoo={aoo}
            pdfHeader={pdfHeader}
          />
          <div className="mr-[42px] flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <div
                onClick={open}
                className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white"
              >
                <div>{t('btn:delete')}:</div>
                <div>{Object.keys(rowSelection).length}</div>
              </div>
            )}
            <CreateAdapter />
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        <AdapterTable
          data={adapterData?.adapters ?? []}
          offset={offset}
          setOffset={setOffset}
          total={adapterData?.total ?? 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:dashboard.table.delete_dashboard_full')}
          body={t('cloud:dashboard.table.delete_multiple_dashboard_confirm')}
          close={close}
          isOpen={isOpen}
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
      ) : null}
    </ContentLayout>
  )
}
