import { useMemo, useRef, useState, useEffect } from 'react'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import storage from '@/utils/storage'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'

import TitleBar from '@/components/Head/TitleBar'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { convertEpochToDate } from '@/utils/transformFunc'
import { useGetFirmwares } from '../api/firmwareAPI'
import { useDeleteMultipleFirmware } from '../api/firmwareAPI/deleteMultipleFirmwares'
import { CreateFirmWare, FirmWareTable } from '../components/Firmware'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function FirmwareTemplate() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const projectId = storage.getProject()?.id
  const {
    data: firmwareData,
    isPreviousData,
    isLoading: isLoadingFirmware,
  } = useGetFirmwares({
    projectId,
    config: { keepPreviousData: true },
    offset,
  })

  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()

  const {
    mutate: mutateDeleteMultipleFirmware,
    isLoading,
    isSuccess: isSuccessDeleteMultipleFirmware,
  } = useDeleteMultipleFirmware()

  useEffect(() => {
    if (isSuccessDeleteMultipleFirmware) {
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleFirmware])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:firmware.table.template'),
      t('cloud:firmware.table.name'),
      t('cloud:firmware.table.tag'),
      t('cloud:firmware.table.version'),
      t('cloud:firmware.table.create_time'),
      t('cloud:firmware.table.created_by'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    firmwareData?.data?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('cloud:firmware.table.template')]: curr.template_name,
            [t('cloud:firmware.table.name')]: curr.name,
            [t('cloud:firmware.table.tag')]: curr.tag,
            [t('cloud:firmware.table.version')]: curr.version,
            [t('cloud:firmware.table.create_time')]: convertEpochToDate(
              curr.created_time,
            ),
            [t('cloud:firmware.table.created_by')]: curr.email,
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <div className="flex grow flex-col">
      <TitleBar title={t('cloud:firmware.title')} />
      <div className="relative flex grow flex-col gap-10 px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex w-full items-center justify-between gap-x-3">
            <SearchField
              setSearchValue={setSearchQuery}
              setIsSearchData={setIsSearchData}
              closeSearch={true}
            />
            <CreateFirmWare />
          </div>
        </div>
        <FirmWareTable
          data={firmwareData?.data ?? []}
          offset={offset}
          setOffset={setOffset}
          total={firmwareData?.total ?? 0}
          isPreviousData={isPreviousData}
          isLoading={isLoadingFirmware}
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
      {isOpenDeleteMulti ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:firmware.table.delete_firmware')}
          body={t('cloud:firmware.table.delete_multiple_firmware_confirm')}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          handleSubmit={() =>
            mutateDeleteMultipleFirmware(
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
