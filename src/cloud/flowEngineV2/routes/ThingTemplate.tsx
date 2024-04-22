import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { Button } from '@/components/Button'

import TitleBar from '@/components/Head/TitleBar'
import { ExportTable } from '@/components/Table/components/ExportTable'
import storage from '@/utils/storage'
import { useDeleteMultipleThings } from '../api/thingAPI/deleteMultipleThings'
import { CreateThing, ThingTable } from '../components/Attributes'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function ThingTemplate() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const projectId = storage.getProject()?.id

  // search query for api call
  const searchField = useRef('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()

  const [offset, setOffset] = useState(0)
  const {
    data: thingData,
    isPreviousData,
    isLoading: isLoadingData,
  } = useGetEntityThings({
    projectId,
    type: 'thing',
    offset,
    config: { keepPreviousData: true },
    search_field: searchField.current,
    search_str: searchQuery,
  })

  const {
    mutate: mutateDeleteMultipleThings,
    isLoading,
    isSuccess: isSuccessDeleteMultipleThings,
  } = useDeleteMultipleThings()

  useEffect(() => {
    if (isSuccessDeleteMultipleThings) {
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleThings])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:custom_protocol.thing.name'),
      t('cloud:custom_protocol.thing.template_name'),
      t('cloud:custom_protocol.thing.number_thing'),
      t('cloud:project_manager.add_project.description'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    thingData?.data?.list?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('cloud:custom_protocol.thing.name')]: curr.name,
            [t('cloud:custom_protocol.thing.template_name')]:
              curr.template_name,
            [t('cloud:custom_protocol.thing.number_thing')]: curr.total_service,
            [t('cloud:project_manager.add_project.description')]:
              curr.description,
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:custom_protocol.thing.title')} />
      <div className="relative flex grow flex-col gap-10 px-9 py-3 shadow-lg">
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
                {
                  value: 'id',
                  label: t('cloud:custom_protocol.thing.id'),
                },
              ]}
              setIsSearchData={setIsSearchData}
              closeSearch={true}
            />
            <CreateThing thingType="thing" />
          </div>
        </div>
        <ThingTable
          data={thingData?.data?.list ?? []}
          offset={offset}
          setOffset={setOffset}
          total={thingData?.data?.total ?? 0}
          isPreviousData={isPreviousData}
          isLoading={isLoadingData}
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
          title={t('cloud:custom_protocol.thing.delete')}
          body={t('cloud:custom_protocol.thing.delete_multiple_thing_confirm')}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          handleSubmit={() =>
            mutateDeleteMultipleThings(
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
