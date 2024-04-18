import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { Button } from '@/components/Button'

import TitleBar from '@/components/Head/TitleBar'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { CreateDevice, DeviceTable } from '../components/Device'
import { useGetDevices } from '../api/deviceAPI'
import storage from '@/utils/storage'
import { convertEpochToDate } from '@/utils/transformFunc'
import { useDeleteMultipleDevices } from '../api/deviceAPI/deleteMultipleDevices'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function DeviceManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const params = useParams()
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()
  const [isSearchData, setIsSearchData] = useState<boolean>(false)

  const orgId = params.orgId as string
  const projectId = storage.getProject()?.id
  const {
    data: deviceData,
    isPreviousData: isPreviousDataDevice,
    isLoading: isLoadingDevice,
  } = useGetDevices({
    orgId,
    projectId,
    offset,
    config: { keepPreviousData: true },
  })

  const {
    mutate: mutateDeleteMultipleDevices,
    isLoading,
    isSuccess: isSuccessDeleteMultipleDevices,
  } = useDeleteMultipleDevices()

  useEffect(() => {
    if (isSuccessDeleteMultipleDevices) {
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleDevices])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.device_manage.table.name'),
      t('cloud:org_manage.device_manage.table.group'),
      t('cloud:org_manage.device_manage.table.status'),
      t('sidebar:cloud.device_template'),
      t('cloud:org_manage.device_manage.table.key'),
      t('cloud:org_manage.device_manage.table.created_at'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    deviceData?.devices?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1 + offset).toString(),
            [t('cloud:org_manage.device_manage.table.name')]: curr.name,
            [t('cloud:org_manage.device_manage.table.group')]: curr.group_name,
            [t('cloud:org_manage.device_manage.table.status')]: curr.status,
            [t('sidebar:cloud.device_template')]: curr.template_name,
            [t('cloud:org_manage.device_manage.table.key')]: curr.key,
            [t('cloud:org_manage.device_manage.table.created_at')]:
              convertEpochToDate(curr.created_time),
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.device_manage.header')} />
      <div className="relative flex grow flex-col gap-5 px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex w-full items-center justify-between gap-x-3">
            <SearchField
              setSearchValue={setSearchQuery}
              setIsSearchData={setIsSearchData}
              closeSearch={true}
            />
            <CreateDevice />
          </div>
        </div>
        <DeviceTable
          data={deviceData?.devices ?? []}
          offset={offset}
          setOffset={setOffset}
          total={deviceData?.total ?? 0}
          isPreviousData={isPreviousDataDevice}
          isLoading={isLoadingDevice}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          pdfHeader={pdfHeader}
          formatExcel={formatExcel}
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
      {isOpenDeleteMulti ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.device_manage.table.delete_device_full')}
          body={t(
            'cloud:org_manage.device_manage.table.delete_multiple_device_confirm',
          )}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          handleSubmit={() =>
            mutateDeleteMultipleDevices(
              {
                data: { ids: rowSelectionKey },
              },
              { onSuccess: () => setRowSelection({}) },
            )
          }
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
