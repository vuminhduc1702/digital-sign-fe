import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import TitleBar from '@/components/Head/TitleBar'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { type DeviceAttrLog } from '../api/attrAPI'
import { AttrTable, CreateAttr } from '../components/Attributes'
import { AttrLogTable } from '../components/Attributes/AttrLogTable'
import { DeviceBreadcrumbs } from '../components/Device'

import { Button } from '@/components/Button'

import { DeviceListIcon, DeviceLogIcon } from '@/components/SVGIcons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs'
import { convertEpochToDate, convertType } from '@/utils/transformFunc'
import { useGetAttrs } from '../api/attrAPI'
import { useDeleteMultipleAttrs } from '../api/attrAPI/deleteMultipleAttrs'
import { useAttrLog } from '../api/attrAPI/getAttrLog'
import { MQTTMessageLogTable } from '../components/Attributes/MQTTMessageLogTable'
import { useMQTTLog } from '../api/attrAPI/getMQTTLog'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function DeviceDetail() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const deviceId = params.deviceId as string
  const projectId = params.projectId as string
  const entityTypeAttr = 'DEVICE'
  const [searchQueryAttrs, setSearchQueryAttrs] = useState('')
  const [searchQueryMQTTLog, setSearchQueryMQTTLog] = useState('')
  const [searchQueryAttrsLog, setSearchQueryAttrsLog] = useState('')
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()
  const [isSearchDataAttrs, setIsSearchDataAttrs] = useState<boolean>(false)
  const [isSearchDataMQTTLog, setIsSearchDataMQTTLog] = useState<boolean>(false)
  const [isSearchDataAttrsLog, setIsSearchDataAttrsLog] =
    useState<boolean>(false)

  // Attrs Data
  const {
    data: attrsData,
    isLoading: isLoadingAttrs,
    isPreviousData: isPreviousDataAttrs,
  } = useGetAttrs({
    entityType: entityTypeAttr,
    entityId: deviceId,
  })

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeaderAttrs = useMemo(
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
  const formatExcelAttrs: Array<{ [key: string]: unknown }> | undefined =
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
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleAttrs])

  // Attr Log
  const [attrLogOffset, setDeviceAttrOffset] = useState(0)
  const {
    data: attrLogData,
    isLoading: isLoadingDeviceAttr,
    isPreviousData: isPreviousDataDeviceAttr,
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
  const formatExcelAttrLog: Array<{ [key: string]: string }> | undefined =
    attrLogData?.logs?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKeyAttrLog.includes(index.toString())) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('cloud:org_manage.org_manage.table.last_update_ts')]:
              convertEpochToDate(curr.ts / 1000),
            [t('cloud:org_manage.org_manage.table.attr_key')]:
              curr.attribute_key,
            [t('cloud:org_manage.org_manage.table.value')]: curr.value,
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: string }>,
    )

  // MQTT Log
  const {
    data: mqttLogData,
    isLoading: isLoadingMQTTLogData,
    isPreviousData: isPreviousDataMQTTLog,
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
  const formatExcelMQTTLog: Array<{ [key: string]: string }> | undefined =
    mqttLogData?.messages?.reduce(
      (acc, curr, index) => {
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
      },
      [] as Array<{ [key: string]: string }>,
    )

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
          <div className="relative flex grow flex-col gap-10 px-9 py-3 shadow-lg">
            <div className="flex justify-between">
              <div className="flex w-full items-center justify-between gap-x-3">
                <SearchField
                  setSearchValue={setSearchQueryAttrs}
                  setIsSearchData={setIsSearchDataAttrs}
                  closeSearch={true}
                />
                <CreateAttr entityId={deviceId} entityType="DEVICE" />
              </div>
            </div>
            <AttrTable
              data={attrsData?.attributes ?? []}
              entityId={deviceId}
              entityType="DEVICE"
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              isPreviousData={isPreviousDataAttrs}
              isLoading={isLoadingAttrs}
              pdfHeader={pdfHeaderAttrs}
              formatExcel={formatExcelAttrs}
              isSearchData={searchQueryAttrs.length > 0 && isSearchDataAttrs}
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
        </TabsContent>
        <TabsContent value="attr_log" className="mt-2 flex grow flex-col">
          <div className="relative flex grow flex-col gap-10 px-9 py-3 shadow-lg">
            <div className="flex justify-between">
              <div className="mr-[42px] flex items-center gap-x-3">
                <SearchField
                  setSearchValue={setSearchQueryMQTTLog}
                  setIsSearchData={setIsSearchDataMQTTLog}
                  closeSearch={true}
                />
              </div>
            </div>
            <AttrLogTable
              data={attrLogData?.logs ?? []}
              offset={attrLogOffset}
              setOffset={setDeviceAttrOffset}
              total={attrLogData?.total ?? 0}
              isPreviousData={isPreviousDataDeviceAttr}
              isLoading={isLoadingDeviceAttr}
              entityId={deviceId}
              entityType="DEVICE"
              rowSelection={rowSelectionAttrLog}
              setRowSelection={setRowSelectionAttrLog}
              pdfHeader={pdfHeaderAttrLog}
              formatExcel={formatExcelAttrLog}
              isSearchData={
                searchQueryAttrsLog.length > 0 && isSearchDataAttrsLog
              }
            />
          </div>
        </TabsContent>
        <TabsContent
          value="MQTT_history_info_list"
          className="mt-2 flex grow flex-col"
        >
          <div className="relative flex grow flex-col gap-10 px-9 py-3 shadow-lg">
            <div className="flex justify-between">
              <div className="mr-[42px] flex items-center gap-x-3">
                <SearchField
                  setSearchValue={setSearchQueryAttrsLog}
                  setIsSearchData={setIsSearchDataAttrsLog}
                  closeSearch={true}
                />
              </div>
            </div>
            <MQTTMessageLogTable
              data={mqttLogData?.messages ?? []}
              entityId={deviceId}
              entityType="DEVICE"
              rowSelection={rowSelectionMQTTLog}
              setRowSelection={setRowSelectionMQTTLog}
              isPreviousData={isPreviousDataMQTTLog}
              isLoading={isLoadingMQTTLogData}
              pdfHeader={pdfHeaderMQTTLog}
              formatExcel={formatExcelMQTTLog}
              isSearchData={
                searchQueryMQTTLog.length > 0 && isSearchDataMQTTLog
              }
            />
          </div>
        </TabsContent>
      </Tabs>
      {isOpenDeleteMulti ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.org_manage.table.delete_attr_full')}
          body={t(
            'cloud:org_manage.org_manage.table.delete_multiple_attr_confirm',
          )}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
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
