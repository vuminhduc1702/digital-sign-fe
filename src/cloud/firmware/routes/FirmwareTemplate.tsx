import { useMemo, useRef, useState } from 'react'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import storage from '~/utils/storage'

import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { convertEpochToDate } from '~/utils/transformFunc'
import { useGetFirmwares } from '../api/firmwareAPI'
import { useDeleteMultipleFirmware } from '../api/firmwareAPI/deleteMultipleFirmwares'
import { CreateFirmWare, FirmWareTable } from '../components/Firmware'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

export function FirmwareTemplate() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const projectId = storage.getProject()?.id
  const {
    data: firmwareData,
    isPreviousData,
    isSuccess,
  } = useGetFirmwares({
    projectId,
    config: { keepPreviousData: true },
    offset,
  })

  const {
    mutate: mutateDeleteMultipleFirmware,
    isLoading,
    isSuccess: isSuccessDeleteMultipleFirmware,
  } = useDeleteMultipleFirmware()
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
  const aoo: Array<{ [key: string]: string }> | undefined =
    firmwareData?.data?.reduce((acc, curr, index) => {
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
    }, [] as Array<{ [key: string]: string }>)

  return (
    <>
      <TitleBar title={t('cloud:firmware.title')} />
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
                isDone={isSuccessDeleteMultipleFirmware}
                icon="danger"
                title={t('cloud:firmware.table.delete_firmware')}
                body={t(
                  'cloud:firmware.table.delete_multiple_firmware_confirm',
                )}
                triggerButton={
                  <div className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                    <div>{t('btn:delete')}:</div>
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
                      mutateDeleteMultipleFirmware(
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
                        className="size-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateFirmWare />
            {/* dummyInput */}
            <InputField
              type="text"
              placeholder={t('table:search')}
              value={searchQuery}
              onChange={e => {
                const value = e.target.value
                setSearchQuery(value)
              }}
              endIcon={
                <div className="absolute top-1/2 right-2 -translate-y-1/2 transform flex justify-center">
                  {searchQuery.length > 0 && (
                    <XMarkIcon
                      className="h-[16px] w-[16px] mr-[5px] transform cursor-pointer opacity-50 flex align-center justify-center cursor-pointer"
                      onClick={() => setSearchQuery('')}
                    />
                  )}
                  <SearchIcon
                    className="cursor-pointer flex justify-between align-center"
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                  />
                </div>
              }
            />
          </div>
        </div>
        <FirmWareTable
          data={firmwareData?.data ?? []}
          offset={offset}
          setOffset={setOffset}
          total={firmwareData?.total ?? 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </>
  )
}
