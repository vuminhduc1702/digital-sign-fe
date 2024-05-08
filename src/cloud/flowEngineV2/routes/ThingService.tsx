import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '@/components/Head/TitleBar'
import {
  CreateThingService,
  ThingServiceTable,
} from '../components/ThingService'
import { useGetServiceThings } from '@/cloud/customProtocol/api/serviceThing'
import { SearchField } from '@/components/Input'
import { useDeleteMultipleThings } from '../api/thingAPI/deleteMultipleThings'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useDisclosure } from '@/utils/hooks'
import { Button } from '@/components/Button'

export function ThingServices() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [offset, setOffset] = useState(0)
  const searchField = useRef('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)

  const params = useParams()

  const thingId = params.thingId as string

  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()

  // no offset call
  const {
    data: thingData,
    isLoading: isLoadingThing,
    isPreviousData: isPreviousDataThing,
  } = useGetServiceThings({
    thingId,
    search_field: searchField.current,
    search_str: searchQuery,
  })

  const {
    mutate: mutateDeleteMultipleThingServices,
    isLoading,
    isSuccess: isSuccessDeleteMultipleThingServices,
  } = useDeleteMultipleThings()

  useEffect(() => {
    if (isSuccessDeleteMultipleThingServices) {
      closeDeleteMulti()
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
  const formatExcel = thingData?.data?.reduce(
    (acc, curr, index) => {
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
      <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex w-full items-center justify-between gap-x-3">
            <SearchField
              setSearchValue={setSearchQuery}
              searchField={searchField}
              fieldOptions={[
                {
                  value: 'name',
                  label: t('cloud:custom_protocol.thing.name'),
                },
              ]}
              setIsSearchData={setIsSearchData}
              closeSearch={true}
            />
            <CreateThingService thingServiceData={thingData?.data} />
          </div>
        </div>
        <ThingServiceTable
          data={thingData?.data ?? []}
          offset={offset}
          setOffset={setOffset}
          total={0}
          isPreviousData={isPreviousDataThing}
          isLoading={isLoadingThing}
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
          title={t('cloud:org_manage.device_manage.table.delete_device_full')}
          body={t(
            'cloud:org_manage.device_manage.table.delete_multiple_device_confirm',
          )}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          isSuccessDelete={isSuccessDeleteMultipleThingServices}
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
