import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'
import { useGetAdapters } from '../api/adapter'
import { AdapterTable, CreateAdapter } from '../components'
import { ContentLayout } from '~/layout/ContentLayout'

import { type Adapter } from '../types'
import { flattenData } from '~/utils/misc'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useDeleteMultipleAdapters } from '../api/adapter/deleteMultipleAdapter'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'

export function CustomProtocolManage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

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

  // flatten the data
  const { acc: adapterFlattenData, extractedPropertyKeys } = flattenData(
    adapterData?.adapters,
    [
      'id',
      'name',
      'protocol',
      'thing_id',
      'handle_service',
      'host',
      'port',
      'content_type',
      'configuration',
      'schema',
    ],
  )
  const {
    mutate: mutateDeleteMultipleAdapters,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAdapters,
  } = useDeleteMultipleAdapters()
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
  const aoo: Array<{ [key: string]: string }> | undefined =
    adapterFlattenData?.reduce((acc, curr, index) => {
      if (rowSelectionKey.includes(curr.id)) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:dashboard.table.name')]: curr.name,
          [t('cloud:custom_protocol.adapter.table.protocol')]: curr.protocol,
          [t('cloud:custom_protocol.adapter.table.thing_id')]: curr.thing_id,
          [t('cloud:custom_protocol.adapter.table.handle_service')]:
            curr.handle_service,
          [t('cloud:custom_protocol.adapter.table.host')]: curr.host,
          [t('cloud:custom_protocol.adapter.table.port')]: curr.port,
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

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
          <div className="flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <ConfirmationDialog
                isDone={isSuccessDeleteMultipleAdapters}
                icon="danger"
                title={t('cloud:dashboard.table.delete_dashboard_full')}
                body={t(
                  'cloud:dashboard.table.delete_multiple_dashboard_confirm',
                )}
                triggerButton={
                  <div className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                    <div>Xoá:</div>
                    <div>{Object.keys(rowSelection).length}</div>
                  </div>
                }
                confirmButton={
                  <Button
                    isLoading={isLoading}
                    type="button"
                    size="md"
                    className="bg-primary-400"
                    onClick={() =>
                      mutateDeleteMultipleAdapters(
                        {
                          data: { ids: rowSelectionKey },
                        },
                        { onSuccess: () => setRowSelection({}) },
                      )
                    }
                    startIcon={
                      <img
                        src={btnSubmitIcon}
                        alt="Submit"
                        className="h-5 w-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateAdapter />
            {/* dummyInput */}
          </div>
        </div>
        <AdapterTable
          data={adapterFlattenData}
          offset={offset}
          setOffset={setOffset}
          total={adapterData?.total ?? 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </ContentLayout>
  )
}
