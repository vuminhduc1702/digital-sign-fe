import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import {
  CreateThingService,
  ThingServiceTable,
} from '../components/ThingService'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { SearchField } from '~/components/Input'
import { useDeleteMultipleThings } from '../api/thingAPI/deleteMultipleThings'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { useDisclosure } from '~/utils/hooks'

export function ThingServices() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const params = useParams()

  const thingId = params.thingId as string

  const { close, open, isOpen } = useDisclosure()

  // no offset call
  const {
    data: thingData,
    isPreviousData,
    isSuccess,
  } = useGetServiceThings({
    thingId,
    config: { keepPreviousData: true },
  })

  const {
    mutate: mutateDeleteMultipleThingServices,
    isLoading,
    isSuccess: isSuccessDeleteMultipleThingServices,
  } = useDeleteMultipleThings()

  useEffect(() => {
    if (isSuccessDeleteMultipleThingServices) {
      close()
    }
  }, [isSuccessDeleteMultipleThingServices])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:custom_protocol.service.name'),
      t('cloud:custom_protocol.thing.description'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const aoo: Array<{ [key: string]: string }> | undefined =
    thingData?.data?.reduce(
      (acc, curr, index) => {
        console.log(curr)
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1 + offset).toString(),
            [t('cloud:custom_protocol.service.name')]: curr.name,
            [t('cloud:custom_protocol.thing.description')]: curr.description,
          }
        }
        return acc
      },
      [] as Array<{ [key: string]: string }>,
    )

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar
        title={t('cloud:custom_protocol.service.title_thing_service')}
      />
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
            <CreateThingService thingServiceData={thingData?.data} />
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        <ThingServiceTable
          data={thingData?.data ?? []}
          offset={offset}
          // setOffset={setOffset}
          total={0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.device_manage.table.delete_device_full')}
          body={t(
            'cloud:org_manage.device_manage.table.delete_multiple_device_confirm',
          )}
          close={close}
          isOpen={isOpen}
          handleSubmit={() =>
            mutateDeleteMultipleThingServices(
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
