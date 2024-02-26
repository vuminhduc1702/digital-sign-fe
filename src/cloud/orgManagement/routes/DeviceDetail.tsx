import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import { DeviceBreadcrumbs } from '../components/Device'
import { AttrTable, CreateAttr } from '../components/Attributes'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { AttrLogTable } from '../components/Attributes/AttrLogTable'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { DeviceListIcon, DeviceLogIcon } from '~/components/SVGIcons'
import { MQTTMessageLogTable } from '../components/Attributes/MQTTMessageLogTable'
import { useDeleteMultipleAttrs } from '../api/attrAPI/deleteMultipleAttrs'
import { convertEpochToDate, convertType } from '~/utils/transformFunc'
import { useGetAttrs } from '../api/attrAPI'
import { useAttrLog } from '../api/attrAPI/getAttrLog'
import { useMQTTLog } from '../api/attrAPI/getMQTTLog'

export function DeviceDetail() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const deviceId = params.deviceId as string
  const projectId = params.projectId as string
  const entityTypeAttr = 'DEVICE'

  const {
    data: attrsData,
    isPreviousData: isPreviousAttrsData,
    isSuccess: isSuccessAttrsData,
  } = useGetAttrs({
    entityType: entityTypeAttr,
    entityId: deviceId,
  })

  // Attr Log
  const [deviceAttrOffset, setDeviceAttrOffset] = useState(0)
  const {
    data: deviceAttrData,
    isPreviousData: isPreviousDeviceAttrData,
    isSuccess: isSuccessDeviceAttrData,
  } = useAttrLog({
    entityId: deviceId,
    entityType: 'DEVICE',
    offset: deviceAttrOffset,
    config: {
      suspense: false,
    },
  })

  // MQTT Log
  const {
    data: mqttLogData,
    isPreviousData: isPreviousMQTTLogData,
    isSuccess: isSuccessDeviceLogData,
  } = useMQTTLog({
    device_id: deviceId,
    project_id: projectId,
    config: {
      suspense: false,
    },
  })

  const {
    mutate: mutateDeleteMultipleAttrs,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAttrs,
  } = useDeleteMultipleAttrs()
  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.table.attr_key'),
      t('cloud:org_manage.org_manage.table.value_type'),
      t('cloud:org_manage.org_manage.table.value'),
      t('cloud:org_manage.org_manage.table.logged'),
      t('cloud:org_manage.org_manage.table.last_update_ts'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const attrKeys = attrsData?.attributes.reduce((acc, curr, index) => {
    if (rowSelectionKey.includes(index.toString())) {
      acc.push(curr.attribute_key)
    }
    return acc
  }, [])
  const aoo: Array<{ [key: string]: string }> | undefined =
    attrsData?.attributes?.reduce((acc, curr, index) => {
      if (rowSelectionKey.includes(index.toString())) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:org_manage.org_manage.table.attr_key')]: curr.attribute_key,
          [t('cloud:org_manage.org_manage.table.value_type')]: convertType(
            curr.value_type,
          ),
          [t('cloud:org_manage.org_manage.table.value')]: curr.value,
          [t('cloud:org_manage.org_manage.table.logged')]: curr.logged,
          [t('cloud:org_manage.org_manage.table.last_update_ts')]:
            convertEpochToDate(curr.last_update_ts / 1000),
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar className="normal-case" title={<DeviceBreadcrumbs />} />
      <Tab.Group>
        <Tab.List className="mt-2 flex gap-x-10 bg-secondary-500 px-10">
          <Tab
            className={({ selected }) =>
              clsx(
                'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                { 'text-primary-400': selected },
              )
            }
          >
            <div className="flex items-center gap-x-2">
              <DeviceListIcon width={16} height={16} viewBox="0 0 20 16" />
              <p>
                {t('cloud:org_manage.device_manage.device_detail.attr_list')}
              </p>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                { 'text-primary-400': selected },
              )
            }
          >
            <div className="flex items-center gap-x-2">
              <DeviceLogIcon width={16} height={16} viewBox="0 0 16 14" />
              <p>
                {t('cloud:org_manage.device_manage.device_detail.attr_log')}
              </p>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                { 'text-primary-400': selected },
              )
            }
          >
            <div className="flex items-center gap-x-2">
              <DeviceListIcon width={16} height={16} viewBox="0 0 20 16" />
              <p>
                {t(
                  'cloud:org_manage.device_manage.device_detail.MQTT_history_info_list',
                )}
              </p>
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2 flex grow flex-col">
          <Tab.Panel
            className={clsx('flex grow flex-col bg-white focus:outline-none')}
          >
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
                      isDone={isSuccessDeleteMultipleAttrs}
                      icon="danger"
                      title={t(
                        'cloud:org_manage.org_manage.table.delete_attr_full',
                      )}
                      body={t(
                        'cloud:org_manage.org_manage.table.delete_multiple_attr_confirm',
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
                            mutateDeleteMultipleAttrs(
                              {
                                data: {
                                  keys: attrKeys,
                                  entity_type: 'DEVICE',
                                  entity_id: deviceId,
                                },
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
                  <CreateAttr entityId={deviceId} entityType="DEVICE" />
                  {/* dummyInput */}
                </div>
              </div>
              <AttrTable
                data={attrsData?.attributes ?? []}
                entityId={deviceId}
                entityType="DEVICE"
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            </div>
          </Tab.Panel>
          <Tab.Panel
            className={clsx('flex grow flex-col bg-white focus:outline-none')}
          >
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable refComponent={ref} />
                <div className="flex items-center gap-x-3">
                  {/* dummyInput */}
                </div>
              </div>
              <AttrLogTable
                data={deviceAttrData?.logs ?? []}
                offset={deviceAttrOffset}
                setOffset={setDeviceAttrOffset}
                total={deviceAttrData?.total ?? 0}
                isPreviousData={isPreviousDeviceAttrData}
                entityId={deviceId}
                entityType="DEVICE"
              />
            </div>
          </Tab.Panel>
          <Tab.Panel
            className={clsx('flex grow flex-col bg-white focus:outline-none')}
          >
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable refComponent={ref} />
                <div className="flex items-center gap-x-3">
                  {/* dummyInput */}
                </div>
              </div>
              <MQTTMessageLogTable
                data={mqttLogData?.messages ?? []}
                entityId={deviceId}
                entityType="DEVICE"
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
