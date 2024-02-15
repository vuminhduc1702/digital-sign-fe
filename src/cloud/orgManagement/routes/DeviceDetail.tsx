import { useMemo, useRef, useState } from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import { DeviceBreadcrumbs } from '../components/Device'
import {
  AttrTable,
  CreateAttr,
  ComboBoxAttrLog,
  ComboBoxSelectAttr,
} from '../components/Attributes'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { type DeviceAttrLog } from '../api/attrAPI'
import { AttrLogTable } from '../components/Attributes/AttrLogTable'

import { type Attribute } from '~/types'

import { DeviceListIcon, DeviceLogIcon } from '~/components/SVGIcons'
import { ComboBoxMQTTLog } from '../components/Attributes/ComboBoxSelectMQTTLog'
import { type MQTTMessage } from '../api/attrAPI/getMQTTLog'
import { MQTTMessageLogTable } from '../components/Attributes/MQTTMessageLogTable'
import { useDeleteMultipleAttrs } from '../api/attrAPI/deleteMultipleAttrs'
import { convertEpochToDate, convertType } from '~/utils/transformFunc'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'

export function DeviceDetail() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const deviceId = params.deviceId as string

  const [filteredAttrComboboxData, setFilteredAttrComboboxData] = useState<
    Attribute[]
  >([])
  const [filteredAttrLogComboboxData, setFilteredAttrLogComboboxData] =
    useState<DeviceAttrLog[]>([])
  const [filteredMQTTLogComboboxData, setFilteredMQTTLogComboboxData] =
    useState<MQTTMessage[]>([])

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
  const attrKeys = filteredAttrComboboxData.reduce((acc, curr, index) => {
    if (rowSelectionKey.includes(index.toString())) {
      acc.push(curr.attribute_key)
    }
    return acc
  }, [])
  const aoo = filteredAttrComboboxData.reduce((acc, curr, index) => {
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
  }, [])

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar className="normal-case" title={<DeviceBreadcrumbs />} />
      <Tab.Group>
        <Tab.List className="bg-secondary-500 mt-2 flex gap-x-10 px-10">
          <Tab
            className={({ selected }) =>
              clsx(
                'text-body-sm hover:text-primary-400 py-2.5 focus:outline-none',
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
                'text-body-sm hover:text-primary-400 py-2.5 focus:outline-none',
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
                'text-body-sm hover:text-primary-400 py-2.5 focus:outline-none',
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
                              className="h-5 w-5"
                            />
                          }
                        />
                      }
                    />
                  )}
                  <CreateAttr entityId={deviceId} entityType="DEVICE" />
                  <ComboBoxSelectAttr
                    entityId={deviceId}
                    entityType="DEVICE"
                    setFilteredComboboxData={setFilteredAttrComboboxData}
                  />
                </div>
              </div>
              <AttrTable
                data={filteredAttrComboboxData}
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
                  <ComboBoxAttrLog
                    setFilteredComboboxData={setFilteredAttrLogComboboxData}
                  />
                </div>
              </div>
              <AttrLogTable
                data={filteredAttrLogComboboxData}
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
                  <ComboBoxMQTTLog
                    setFilteredComboboxData={setFilteredMQTTLogComboboxData}
                  />
                </div>
              </div>
              <MQTTMessageLogTable
                data={filteredMQTTLogComboboxData}
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
