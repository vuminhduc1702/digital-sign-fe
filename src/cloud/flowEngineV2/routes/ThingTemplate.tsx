import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { InputField } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { useDeleteMultipleThings } from '../api/thingAPI/deleteMultipleThings'
import { CreateThing, ThingTable } from '../components/Attributes'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

export function ThingTemplate() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const projectId = storage.getProject()?.id

  // search query for api call
  const [searchQuery, setSearchQuery] = useState('')

  const [offset, setOffset] = useState(0)
  const {
    data: thingData,
    isPreviousData,
    isSuccess,
  } = useGetEntityThings({
    projectId,
    type: 'thing',
    offset,
    config: { keepPreviousData: true },
  })

  const {
    mutate: mutateDeleteMultipleThings,
    isLoading,
    isSuccess: isSuccessDeleteMultipleThings,
  } = useDeleteMultipleThings()
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
  const aoo: Array<{ [key: string]: string }> | undefined =
    thingData?.data?.list?.reduce((acc, curr, index) => {
      if (rowSelectionKey.includes(curr.id)) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:custom_protocol.thing.name')]: curr.name,
          [t('cloud:custom_protocol.thing.template_name')]: curr.template_name,
          [t('cloud:custom_protocol.thing.number_thing')]: curr.total_service,
          [t('cloud:project_manager.add_project.description')]:
            curr.description,
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:custom_protocol.thing.title')} />
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
                isDone={isSuccessDeleteMultipleThings}
                icon="danger"
                title={t('cloud:custom_protocol.thing.delete')}
                body={t(
                  'cloud:custom_protocol.thing.delete_multiple_thing_confirm',
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
                      mutateDeleteMultipleThings(
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
            <CreateThing thingType="thing" />
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
        <ThingTable
          data={thingData?.data?.list ?? []}
          offset={offset}
          setOffset={setOffset}
          total={thingData?.data?.total ?? 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}
