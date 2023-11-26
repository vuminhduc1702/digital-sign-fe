import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import * as z from 'zod'
import type RGL from 'react-grid-layout'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useSpinDelay } from 'spin-delay'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Spinner } from '~/components/Spinner'
import TitleBar from '~/components/Head/TitleBar'
import { Button } from '~/components/Button/Button'
import { useDisclosure, useWS } from '~/utils/hooks'
import { useGetDashboardsById, useUpdateDashboard } from '../api'
import {
  BarChart,
  CardChart,
  ControllerButton,
  GaugeChart,
  LineChart,
  Map,
  PieChart,
  TableChart,
} from '../components'
import {
  type ControllerBtn,
  CreateWidget,
  type Widget,
  type WidgetCategoryType,
  CreateControllerButton,
  UpdateWidget,
} from '../components/Widget'
import { Drawer } from '~/components/Drawer'
import storage, { type UserStorage } from '~/utils/storage'
import { cn } from '~/utils/misc'
import { useNotificationStore } from '~/stores/notifications'

import {
  aggSchema,
  type DashboardWS,
  type WidgetType,
  type TimeSeries,
  type LatestData,
} from '../types'
import { type WebSocketMessage } from 'react-use-websocket/dist/lib/types'
import { WS_URL } from '~/config'

import {
  DeleteIcon,
  ChartCircle,
  ChartControl,
  ChartData,
  ChartGaugeIcon,
  ChartGraph,
  ChartLine,
  ChartMap,
  ChartTableData,
  EditBtnIcon,
  PlusIcon,
} from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { StarFilledIcon } from '@radix-ui/react-icons'

const widgetAggSchema = z.object({
  label: z.string(),
  value: aggSchema,
})
export type WidgetAgg = z.infer<typeof widgetAggSchema>
export type WidgetAttrDeviceType = Array<{
  id: string
  attr: string
  deviceName: string
  deviceId: string
}>

export const wsInterval = [
  { label: 'Second', value: 1000 },
  { label: 'Minute', value: 60 * 1000 },
  { label: 'Hour', value: 60 * 60 * 1000 },
  { label: 'Day', value: 24 * 60 * 60 * 1000 },
  { label: 'Week', value: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Month', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'Year', value: 365 * 24 * 60 * 60 * 1000 },
]

export const widgetAgg: WidgetAgg[] = [
  { label: 'None', value: 'NONE' },
  { label: 'Avg', value: 'AVG' },
  { label: 'Min', value: 'MIN' },
  { label: 'Max', value: 'MAX' },
  { label: 'Sum', value: 'SUM' },
  { label: 'Count', value: 'COUNT' },
]

const { token } = storage.getToken() as UserStorage
export const WEBSOCKET_URL = `${WS_URL}/websocket/telemetry?auth-token=${encodeURIComponent(
  `Bearer ${token}`,
)}`

export function DashboardDetail() {
  const { t } = useTranslation()
  const { addNotification } = useNotificationStore()

  const params = useParams()
  const dashboardId = params.dashboardId as string

  const { close, open, isOpen } = useDisclosure()
  const [isEditMode, setIsEditMode] = useState(false)
  const [widgetType, setWidgetType] = useState<WidgetType>('TIMESERIES')
  const [widgetCategory, setWidgetCategory] =
    useState<WidgetCategoryType>('LINE')
  const [isMultipleAttr, setIsMultipleAttr] = useState(true)
  const [isMultipleDevice, setIsMultipleDevice] = useState(true)
  const [isShowCreateWidget, setIsShowCreateWidget] = useState(false)
  const [isShowCreateControllerBtn, setIsShowCreateControllerBtn] =
    useState(false)
  const [isStar, setIsStar] = useState(false)
  const [layoutDashboard, setLayoutDashboard] = useState<RGL.Layout[]>([])

  const { mutate: mutateUpdateDashboard, isLoading: updateDashboardIsLoading } =
    useUpdateDashboard()

  const { data: detailDashboard, refetch: detailDashboardRefetch } =
    useGetDashboardsById({
      id: dashboardId,
      config: {
        staleTime: 0,
      },
    })
  const widgetDetailDB = detailDashboard?.configuration?.widgets

  const [widgetList, setWidgetList] = useState<Widget>({})
  // console.log('widgetList', widgetList)

  const ReactGridLayout = useMemo(() => WidthProvider(Responsive), [])

  const [{ sendMessage, lastJsonMessage, readyState }, connectionStatus] =
    useWS<DashboardWS>(WEBSOCKET_URL)
  // console.log('lastJsonMessage', lastJsonMessage)
  const handleSendMessage = useCallback(
    (message: WebSocketMessage) => sendMessage(message),
    [],
  )

  useEffect(() => {
    if (widgetDetailDB != null) {
      setWidgetList(widgetDetailDB)
    }
  }, [widgetDetailDB])

  useEffect(() => {
    if (detailDashboard?.dashboard_setting?.starred != null) {
      setIsStar(detailDashboard?.dashboard_setting?.starred)
    }
  }, [detailDashboard?.dashboard_setting?.starred])

  useEffect(() => {
    if (lastJsonMessage != null && lastJsonMessage?.errorCode !== 0) {
      addNotification({
        type: 'error',
        title: lastJsonMessage.errorMsg,
      })
    }
    // if (lastJsonMessage != null && lastJsonMessage?.data?.length > 1) {
    //   setWidgetAttrDeviceData(
    //     lastJsonMessage?.data
    //       ?.map(item => {
    //         const {
    //           entityId: { entityName, id },
    //           timeseries,
    //         } = item
    //         if (timeseries != null) {
    //           const attributes = Object.keys(timeseries).filter(
    //             attr => timeseries[attr] !== null,
    //           )
    //           return attributes.map(attr => {
    //             const attrId = uuidv4()
    //             return {
    //               id: attrId,
    //               attr,
    //               deviceName: entityName,
    //               deviceId: id,
    //             }
    //           })
    //         }
    //         return []
    //       })
    //       .flat(),
    //   )
    // }
  }, [lastJsonMessage])

  useEffect(() => {
    Object.values(widgetList).forEach(widget => {
      const dataSource = widget?.datasource
      if (dataSource?.init_message !== '' && dataSource?.init_message != null) {
        handleSendMessage(dataSource.init_message)
      }
      if (
        dataSource?.realtime_message !== '' &&
        dataSource?.realtime_message != null
      ) {
        handleSendMessage(dataSource?.realtime_message)
      }
      if (
        dataSource?.history_message !== '' &&
        dataSource?.history_message != null
      ) {
        handleSendMessage(dataSource?.history_message)
      }
      if (
        dataSource?.lastest_message !== '' &&
        dataSource?.lastest_message != null
      ) {
        handleSendMessage(dataSource?.lastest_message)
      }
    })
  }, [handleSendMessage, widgetList, Object.keys(widgetList).length])

  function combinedObject(data: any[]) {
    let combinedObject: TimeSeries = {}
    if (data != null) {
      combinedObject = data.reduce((result, obj) => {
        for (const key in obj) {
          if (obj[key] != null && result != null) {
            if (!result[key]) {
              result[key] = []
            }
            result[key] = result[key].concat(obj[key])
          }
        }
        return result
      }, {})
    }

    return combinedObject
  }

  const showSpinner = useSpinDelay(connectionStatus === 'Connecting', {
    delay: 150,
    minDuration: 300,
  })

  return (
    <div className="relative flex grow flex-col">
      <TitleBar
        title={`${t('cloud:dashboard.title')}: ${detailDashboard?.title}`}
      />
      <StarFilledIcon
        className={cn('absolute left-2 top-2 h-5 w-5 cursor-pointer', {
          'text-amber-400': isStar,
          'text-white': !isStar,
          'cursor-not-allowed': !isEditMode,
        })}
        onClick={() => {
          if (isEditMode) {
            setIsStar(!isStar)
          }
        }}
      />
      <div className="flex grow flex-col justify-between bg-secondary-500 shadow-lg">
        {widgetDetailDB == null &&
        Object.keys(widgetList).length === 0 &&
        connectionStatus === 'Open' ? (
          <div className="grid grow place-content-center text-h1">
            {t('cloud:dashboard.add_dashboard.note')}
          </div>
        ) : null}

        {connectionStatus === 'Open' ? (
          <ReactGridLayout
            margin={[20, 20]}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={e => setLayoutDashboard(e)}
          >
            {(widgetDetailDB != null || Object.keys(widgetList).length > 0) &&
              Object.keys(widgetList).map((widgetId, index) => {
                const widgetInfo = widgetDetailDB?.[widgetId]
                const realtimeValues: TimeSeries =
                  lastJsonMessage?.id === widgetId
                    ? combinedObject(
                        lastJsonMessage?.data?.map(
                          device => device.timeseries as TimeSeries,
                        ),
                      )
                    : {}
                const lastestValues: TimeSeries =
                  lastJsonMessage?.id === widgetId
                    ? combinedObject(
                        lastJsonMessage?.data?.map(
                          device => device.latest.TIME_SERIES as LatestData,
                        ),
                      )
                    : {}
                const lastestValueOneDevice: LatestData =
                  lastJsonMessage?.id === widgetId
                    ? (lastJsonMessage?.data?.[0]?.latest
                        ?.TIME_SERIES as LatestData)
                    : {}

                return (
                  <div
                    key={widgetId}
                    data-grid={
                      detailDashboard?.dashboard_setting?.layout != null &&
                      detailDashboard?.dashboard_setting?.layout?.length > 0 &&
                      Object.keys(widgetDetailDB).length ===
                        Object.keys(widgetList).length
                        ? detailDashboard?.dashboard_setting?.layout?.find(
                            layout => layout.i === widgetId,
                          )
                        : {
                            // x: index % 2 === 0 ? 0 : 4,
                            x: index % 2 === 0 ? 0 : 6,
                            y: 0,
                            w:
                              widgetList?.[widgetId]?.description === 'CARD'
                                ? 3
                                : 6,
                            h:
                              widgetList?.[widgetId]?.description === 'CARD'
                                ? 1
                                : 3,
                          }
                    }
                    className={cn(
                      'relative bg-secondary-500',
                      isEditMode && 'cursor-grab',
                    )}
                    data-iseditmode={isEditMode}
                  >
                    <p className="absolute ml-2 mt-2">
                      {widgetList?.[widgetId]?.title ?? ''}
                    </p>
                    {widgetList?.[widgetId]?.description === 'LINE' ? (
                      <LineChart
                        data={realtimeValues}
                        widgetInfo={widgetInfo}
                      />
                    ) : widgetList?.[widgetId]?.description === 'BAR' ? (
                      <BarChart data={realtimeValues} widgetInfo={widgetInfo} />
                    ) : widgetList?.[widgetId]?.description === 'PIE' ? (
                      <PieChart data={lastestValues} />
                    ) : widgetList?.[widgetId]?.description === 'MAP' ? (
                      <Map data={lastestValues} isEditMode={isEditMode} />
                    ) : widgetList?.[widgetId]?.description === 'GAUGE' ? (
                      <GaugeChart data={lastestValueOneDevice} />
                    ) : widgetList?.[widgetId]?.description === 'TABLE' ? (
                      <TableChart
                        data={realtimeValues}
                        className="h-full p-5"
                      />
                    ) : widgetList?.[widgetId]?.description === 'CARD' ? (
                      <CardChart data={lastestValueOneDevice} />
                    ) : widgetList?.[widgetId]?.description === 'CONTROLLER' ? (
                      <ControllerButton
                        data={
                          widgetList?.[widgetId]?.datasource
                            ?.controller_message as string
                        }
                      />
                    ) : null}
                    {isEditMode ? (
                      <div className="absolute right-0 top-0 mr-2 mt-2 flex gap-x-2">
                        <UpdateWidget widgetInfo={widgetInfo} />
                        <DeleteIcon
                          width={20}
                          height={20}
                          className="cursor-pointer text-secondary-700 hover:text-primary-400"
                          viewBox="0 0 20 20"
                          onClick={() => {
                            if (widgetList?.hasOwnProperty(widgetId)) {
                              const { [widgetId]: deletedKey, ...newObject } =
                                widgetList
                              setWidgetList(newObject)
                            }
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                )
              })}
          </ReactGridLayout>
        ) : (
          <div className="flex grow items-center justify-center">
            <Spinner showSpinner={showSpinner} size="xl" />
          </div>
        )}

        {isEditMode ? (
          <div className="absolute bottom-0 right-0 flex p-3">
            <Button
              className="ml-2 rounded border-none p-3"
              variant="secondary"
              size="square"
              onClick={() => {
                setWidgetList(widgetDetailDB ?? {})
                detailDashboardRefetch()
                setLayoutDashboard(
                  detailDashboard?.dashboard_setting?.layout as RGL.Layout[],
                )
                setIsEditMode(false)
                setIsStar(detailDashboard?.dashboard_setting?.starred || false)
              }}
              startIcon={
                <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
              }
            >
              {t('btn:back')}
            </Button>
            <Button
              className="ml-2 rounded border-none p-3"
              form="update-dashboard"
              type="submit"
              size="square"
              isLoading={updateDashboardIsLoading}
              onClick={() => {
                setIsEditMode(false)

                if (detailDashboard != null) {
                  mutateUpdateDashboard({
                    data: {
                      title: detailDashboard?.title,
                      configuration: {
                        description:
                          detailDashboard?.configuration?.description,
                        widgets: widgetList,
                      },
                      dashboard_setting: {
                        layout: layoutDashboard,
                        starred: isStar,
                        last_viewed: new Date(),
                      },
                    },
                    dashboardId,
                  })
                }
              }}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            >
              {t('btn:confirm')}
            </Button>
            <Button
              className="ml-2 rounded p-3"
              size="square"
              variant="trans"
              onClick={() => open()}
              startIcon={
                <PlusIcon
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  className="text-black"
                />
              }
            >
              {t('cloud:dashboard.config_chart.title')}
            </Button>
            {isShowCreateWidget ? (
              <CreateWidget
                widgetType={widgetType}
                widgetCategory={widgetCategory}
                isMultipleAttr={isMultipleAttr}
                isMultipleDevice={isMultipleDevice}
                isOpen={isShowCreateWidget}
                close={() => setIsShowCreateWidget(false)}
                setWidgetList={setWidgetList}
              />
            ) : isShowCreateControllerBtn ? (
              <CreateControllerButton
                widgetCategory={widgetCategory}
                isOpen={isShowCreateControllerBtn}
                close={() => setIsShowCreateControllerBtn(false)}
                setWidgetList={setWidgetList}
              />
            ) : (
              <Drawer
                isOpen={isOpen}
                onClose={close}
                title={t('cloud:dashboard.detail_dashboard.add_widget.create')}
                renderFooter={() => (
                  <>
                    <Button
                      className="rounded border-none"
                      variant="secondary"
                      size="lg"
                      onClick={close}
                      startIcon={
                        <img
                          src={btnCancelIcon}
                          alt="Submit"
                          className="h-5 w-5"
                        />
                      }
                    />
                  </>
                )}
              >
                <div className="flex w-full gap-x-8">
                  <div className="w-full space-y-6">
                    <Button
                      type="button"
                      size="square"
                      className="flex w-full justify-between border-none bg-secondary-400 px-4"
                      variant="secondaryLight"
                      onClick={() => {
                        close()
                        setIsShowCreateWidget(true)
                        setWidgetType('TIMESERIES')
                        setWidgetCategory('LINE')
                        setIsMultipleAttr(true)
                        setIsMultipleDevice(true)
                      }}
                    >
                      <ChartLine height={58} width={58} viewBox="0 0 58 58" />
                      <span className="flex items-center">
                        {t(
                          'cloud:dashboard.detail_dashboard.add_widget.line_chart',
                        )}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="square"
                      className="flex w-full justify-between border-none bg-secondary-400 px-4"
                      variant="secondaryLight"
                      onClick={() => {
                        close()
                        setIsShowCreateWidget(true)
                        setWidgetType('TIMESERIES')
                        setWidgetCategory('BAR')
                        setIsMultipleAttr(true)
                        setIsMultipleDevice(true)
                      }}
                    >
                      <ChartGraph height={58} width={58} viewBox="0 0 58 58" />
                      <span className="flex items-center">
                        {t(
                          'cloud:dashboard.detail_dashboard.add_widget.horizontal_bar_chart',
                        )}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="square"
                      className="flex w-full justify-between border-none bg-secondary-400 px-4"
                      variant="secondaryLight"
                      onClick={() => {
                        close()
                        setIsShowCreateWidget(true)
                        setWidgetType('TIMESERIES')
                        setWidgetCategory('TABLE')
                        setIsMultipleAttr(true)
                        setIsMultipleDevice(true)
                      }}
                    >
                      <ChartTableData
                        height={58}
                        width={58}
                        viewBox="0 0 58 58"
                      />
                      <span className="flex items-center">
                        {t(
                          'cloud:dashboard.detail_dashboard.add_widget.data_table',
                        )}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="square"
                      className="flex w-full justify-between border-none bg-secondary-400 px-4"
                      variant="secondaryLight"
                      onClick={() => {
                        close()
                        setIsShowCreateControllerBtn(true)
                        setWidgetCategory('CONTROLLER')
                      }}
                    >
                      <ChartControl
                        height={58}
                        width={58}
                        viewBox="0 0 58 58"
                      />
                      <span className="flex items-center">
                        {t(
                          'cloud:dashboard.detail_dashboard.add_widget.controller.title',
                        )}
                      </span>
                    </Button>
                  </div>
                  <div className="w-full space-y-6">
                    <Button
                      type="button"
                      size="square"
                      className="flex w-full justify-between border-none bg-secondary-400 px-4"
                      variant="secondaryLight"
                      onClick={() => {
                        close()
                        setIsShowCreateWidget(true)
                        setWidgetType('LASTEST')
                        setWidgetCategory('PIE')
                        setIsMultipleAttr(true)
                        setIsMultipleDevice(true)
                      }}
                    >
                      <ChartCircle height={58} width={58} viewBox="0 0 58 58" />
                      <span className="flex items-center">
                        {t(
                          'cloud:dashboard.detail_dashboard.add_widget.pie_chart',
                        )}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="square"
                      className="flex w-full justify-between border-none bg-secondary-400 px-4 active:bg-primary-300"
                      variant="secondaryLight"
                      onClick={() => {
                        close()
                        setIsShowCreateWidget(true)
                        setWidgetType('LASTEST')
                        setWidgetCategory('GAUGE')
                        setIsMultipleAttr(false)
                        setIsMultipleDevice(false)
                      }}
                    >
                      <ChartGaugeIcon
                        height={58}
                        width={58}
                        viewBox="0 0 58 58"
                      />
                      <span className="flex items-center">
                        {t('cloud:dashboard.detail_dashboard.add_widget.gauge')}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="square"
                      className="flex w-full justify-between border-none bg-secondary-400 px-4"
                      variant="secondaryLight"
                      onClick={() => {
                        close()
                        setIsShowCreateWidget(true)
                        setWidgetType('LASTEST')
                        setWidgetCategory('CARD')
                        setIsMultipleAttr(false)
                        setIsMultipleDevice(false)
                      }}
                    >
                      <ChartData height={58} width={58} viewBox="0 0 58 58" />
                      <span className="flex items-center">
                        {t(
                          'cloud:dashboard.detail_dashboard.add_widget.data_chart',
                        )}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="square"
                      className="flex w-full justify-between border-none bg-secondary-400 px-4 active:bg-primary-300"
                      variant="secondaryLight"
                      onClick={() => {
                        close()
                        setIsShowCreateWidget(true)
                        setWidgetType('LASTEST')
                        setWidgetCategory('MAP')
                        setIsMultipleAttr(true)
                        setIsMultipleDevice(true)
                      }}
                    >
                      <ChartMap height={58} width={58} viewBox="0 0 58 58" />
                      <span className="flex items-center">
                        {t('cloud:dashboard.detail_dashboard.add_widget.map')}
                      </span>
                    </Button>
                  </div>
                </div>
              </Drawer>
            )}
          </div>
        ) : (
          <div className="absolute bottom-0 right-0 p-3">
            <Button
              className="rounded"
              form="update-dashboard"
              size="square"
              variant="primary"
              isLoading={updateDashboardIsLoading}
              onClick={() => setIsEditMode(true)}
              startIcon={
                <EditBtnIcon
                  width={20}
                  height={20}
                  className="text-white"
                  viewBox="0 0 20 20"
                />
              }
            >
              {t('cloud:dashboard.add_dashboard.edit_full')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
