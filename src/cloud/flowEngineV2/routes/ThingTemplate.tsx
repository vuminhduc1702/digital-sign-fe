import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import storage from '~/utils/storage'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { CreateThing, ThingTable } from '../components/Attributes'
import TitleBar from '~/components/Head/TitleBar'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { type EntityThing } from '~/cloud/customProtocol'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { Button } from '~/components/Button'
import { useDeleteMultipleThings } from '../api/thingAPI/deleteMultipleThings'
import { flattenData } from '~/utils/misc'
import { InputField } from '~/components/Form'

export function ThingTemplate() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const projectId = storage.getProject()?.id

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
  const { acc: thingFlattenData, extractedPropertyKeys } = flattenData(
    thingData?.data?.list,
    [
      'id',
      'name',
      'type',
      'project_id',
      'template_name',
      'create_ts',
      'description',
      'total_service',
    ],
  )

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
    thingFlattenData.reduce((acc, curr, index) => {
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
                        className="h-5 w-5"
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
              placeholder="Search"
              onChange={e => {
                const value = e.target.value
                setSearchQuery(value)
              }}
            />
          </div>
        </div>
        <ThingTable
          data={thingFlattenData}
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
