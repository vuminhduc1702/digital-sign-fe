import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { type DeviceAttrLog } from '../api/attrAPI'
import { AttrTable, CreateAttr } from '../components/Attributes'
import { AttrLogTable } from '../components/Attributes/AttrLogTable'
import { DeviceBreadcrumbs } from '../components/Device'

import { Button } from '~/components/Button'

import { DeviceListIcon, DeviceLogIcon } from '~/components/SVGIcons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/Tabs'
import { convertEpochToDate, convertType } from '~/utils/transformFunc'
import { useGetAttrs } from '../api/attrAPI'
import { useDeleteMultipleAttrs } from '../api/attrAPI/deleteMultipleAttrs'
import { useAttrLog } from '../api/attrAPI/getAttrLog'
import { MQTTMessageLogTable } from '../components/Attributes/MQTTMessageLogTable'
import { useMQTTLog } from '../api/attrAPI/getMQTTLog'
import { SearchField } from '~/components/Input'
import { useDisclosure } from '~/utils/hooks'
import { ConfirmDialog } from '~/components/ConfirmDialog'

export function DeviceDetail() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const deviceId = params.deviceId as string
  const projectId = params.projectId as string
  const entityTypeAttr = 'DEVICE'
  const [searchQueryAttrs, setSearchQueryAttrs] = useState('')
  const [searchQueryMQTTLog, setSearchQueryMQTTLog] = useState('')
  const { close, open, isOpen } = useDisclosure()

  // Attrs Data
  const {
    data: attrsData,
    isPreviousData: isPreviousAttrsData,
    isSuccess: isSuccessAttrsData,
  } = useGetAttrs({
    entityType: entityTypeAttr,
    entityId: deviceId,
  })

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
  const aoo: Array<{ [key: string]: unknown }> | undefined =
    attrsData?.attributes?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(index.toString())) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('cloud:org_manage.org_manage.table.attr_key')]:
              curr.attribute_key,
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
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  // delete attrs
  const {
    mutate: mutateDeleteMultipleAttrs,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAttrs,
  } = useDeleteMultipleAttrs()

  useEffect(() => {
    if (isSuccessDeleteMultipleAttrs) {
      close()
    }
  }, [isSuccessDeleteMultipleAttrs])

  // Attr Log
  const [attrLogOffset, setDeviceAttrOffset] = useState(0)
  const {
    data: attrLogData,
    isPreviousData: isPreviousDeviceAttrData,
    isSuccess: isSuccessDeviceAttrData,
  } = useAttrLog({
    entityId: deviceId,
    entityType: 'DEVICE',
    offset: attrLogOffset,
    config: {
      suspense: false,
    },
  })

  const [rowSelectionAttrLog, setRowSelectionAttrLog] = useState({})
  const pdfHeaderAttrLog = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.table.last_update_ts'),
      t('cloud:org_manage.org_manage.table.attr_key'),
      t('cloud:org_manage.org_manage.table.value'),
    ],
    [],
  )
  const rowSelectionKeyAttrLog = Object.keys(rowSelectionAttrLog)
  const attrLogAoo: Array<{ [key: string]: string }> | undefined =
    attrLogData?.logs?.reduce((acc, curr, index) => {
      if (rowSelectionKeyAttrLog.includes(index.toString())) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:org_manage.org_manage.table.last_update_ts')]:
            convertEpochToDate(curr.ts / 1000),
          [t('cloud:org_manage.org_manage.table.attr_key')]: curr.attribute_key,
          [t('cloud:org_manage.org_manage.table.value')]: curr.value,
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

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

  const [rowSelectionMQTTLog, setRowSelectionMQTTLog] = useState({})
  const pdfHeaderMQTTLog = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.table.last_update_ts'),
      t('cloud:org_manage.device_manage.table.payload_as_string'),
      t('cloud:org_manage.device_manage.table.topic'),
    ],
    [],
  )
  const rowSelectionKeyMQTTLog = Object.keys(rowSelection)
  const MQTTLogAoo: Array<{ [key: string]: string }> | undefined =
    mqttLogData?.messages?.reduce((acc, curr, index) => {
      if (rowSelectionKeyMQTTLog.includes(index.toString())) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:org_manage.org_manage.table.last_update_ts')]:
            convertEpochToDate(curr.ts / 1000),
          [t('cloud:org_manage.device_manage.table.payload_as_string')]:
            curr.payload_as_string,
          [t('cloud:org_manage.device_manage.table.topic')]: curr.topic,
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar className="normal-case" title={<DeviceBreadcrumbs />} />
      <Tabs defaultValue="attr_list" className="mt-2 flex grow flex-col">
        <TabsList className="mt-2 w-full bg-secondary-500">
          <TabsTrigger value="attr_list">
            <div className="flex items-center gap-x-2">
              <DeviceListIcon width={16} height={16} viewBox="0 0 20 16" />
              <p>
                {t('cloud:org_manage.device_manage.device_detail.attr_list')}
              </p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="attr_log">
            <div className="flex items-center gap-x-2">
              <DeviceLogIcon width={16} height={16} viewBox="0 0 16 14" />
              <p>
                {t('cloud:org_manage.device_manage.device_detail.attr_log')}
              </p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="MQTT_history_info_list">
            <div className="flex items-center gap-x-2">
              <DeviceListIcon width={16} height={16} viewBox="0 0 20 16" />
              <p>
                {t(
                  'cloud:org_manage.device_manage.device_detail.MQTT_history_info_list',
                )}
              </p>
            </div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attr_list" className="mt-2 flex grow flex-col">
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
                <CreateAttr entityId={deviceId} entityType="DEVICE" />
                <SearchField
                  searchQuery={searchQueryAttrs}
                  setSearchQuery={setSearchQueryAttrs}
                />
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
        </TabsContent>
        <TabsContent value="attr_log" className="mt-2 flex grow flex-col">
          <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
            <div className="flex justify-between">
              <ExportTable
                refComponent={ref}
                rowSelection={rowSelectionAttrLog}
                aoo={attrLogAoo}
                pdfHeader={pdfHeaderAttrLog}
              />
              <div className="mr-[42px] flex items-center gap-x-3">
                <SearchField
                  searchQuery={searchQueryAttrsLog}
                  setSearchQuery={setSearchQueryAttrsLog}
                />
              </div>
            </div>
            <AttrLogTable
              data={attrLogData?.logs ?? []}
              offset={attrLogOffset}
              setOffset={setDeviceAttrOffset}
              total={attrLogData?.total ?? 0}
              isPreviousData={isPreviousDeviceAttrData}
              entityId={deviceId}
              entityType="DEVICE"
              rowSelection={rowSelectionAttrLog}
              setRowSelection={setRowSelectionAttrLog}
            />
          </div>
        </TabsContent>
        <TabsContent
          value="MQTT_history_info_list"
          className="mt-2 flex grow flex-col"
        >
          <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
            <div className="flex justify-between">
              <ExportTable
                refComponent={ref}
                rowSelection={rowSelectionMQTTLog}
                aoo={MQTTLogAoo}
                pdfHeader={pdfHeaderMQTTLog}
              />
              <div className="mr-[42px] flex items-center gap-x-3">
                <SearchField
                  searchQuery={searchQueryMQTTLog}
                  setSearchQuery={setSearchQueryMQTTLog}
                />
              </div>
            </div>
            <MQTTMessageLogTable
              data={mqttLogData?.messages ?? []}
              entityId={deviceId}
              entityType="DEVICE"
              rowSelection={rowSelectionMQTTLog}
              setRowSelection={setRowSelectionMQTTLog}
            />
          </div>
        </TabsContent>
      </Tabs>
      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.org_manage.table.delete_attr_full')}
          body={t(
            'cloud:org_manage.org_manage.table.delete_multiple_attr_confirm',
          )}
          close={close}
          isOpen={isOpen}
          handleSubmit={() =>
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
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
