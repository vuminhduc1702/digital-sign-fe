import { useEffect, useMemo, useRef, useState } from 'react'
import type RGL from 'react-grid-layout'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useSpinDelay } from 'spin-delay'
import { Button } from '@/components/ui/button'
import TitleBar from '@/components/Head/TitleBar'
import { Spinner } from '@/components/Spinner'
import { toast } from 'sonner'
import { useDisclosure, useWS } from '@/utils/hooks'
import { cn } from '@/utils/misc'
import storage, { type UserStorage } from '@/utils/storage'
import { useGetDashboardsById, useUpdateDashboard } from '../api'
import {
  BarChart,
  CardChart,
  ControllerButton,
  GaugeChart,
  LineChart,
  MapChart,
  PieChart,
  TableChart,
  LightChart,
} from '../components'
import {
  CreateControllerButton,
  CreateWidget,
  UpdateControllerButton,
  UpdateWidget,
  type Widget,
  type WidgetCategoryType,
} from '../components/Widget'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  ComboBoxSelectDeviceDashboard,
  type MapData,
} from '../components/ComboBoxSelectDeviceDashboard'
import { useGetDevices } from '@/cloud/orgManagement/api/deviceAPI'
import lightOnICon from '@/assets/icons/light-on.svg'

import { WS_URL } from '@/config'
import {
  type DataSeries,
  type DashboardWS,
  type LatestData,
  type TimeSeries,
  type WidgetType,
} from '../types'
import { type Device } from '@/cloud/orgManagement'
import { type EntityId, type MapSeries } from '../types'

import { StarFilledIcon } from '@radix-ui/react-icons'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import {
  ChartCircle,
  ChartControl,
  ChartData,
  ChartGaugeIcon,
  ChartGraph,
  ChartLine,
  ChartMap,
  ChartTableData,
  DeleteIcon,
  DragIcon,
  EditBtnIcon,
  PlusIcon,
} from '@/components/SVGIcons'
import BD_01 from '@/assets/images/landingpage/BD_01.png'
import BD_02 from '@/assets/images/landingpage/BD_02.png'
import DB_03 from '@/assets/images/landingpage/BD_03.png'
import BD_04 from '@/assets/images/landingpage/BD_04.png'
import BD_05 from '@/assets/images/landingpage/BD_05.png'
import BD_06 from '@/assets/images/landingpage/BD_06.png'
import BD_07 from '@/assets/images/landingpage/BD_07.png'
import BD_08 from '@/assets/images/landingpage/BD_08.png'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import BD_09 from '@/assets/images/landingpage/BD_09.png'
import { queryClient } from '@/lib/react-query'

export type WidgetAttrDeviceType = Array<{
  id: string
  attr: string
  deviceName: string
  deviceId: string
}>

const { token } = storage.getToken()
export const WEBSOCKET_URL = `${WS_URL}/websocket/telemetry?auth-token=${encodeURIComponent(
  `Bearer ${token}`,
)}`

export function DashboardDetail() {
  const { t } = useTranslation()

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
  const [refetchDataState, setRefetchDataState] = useState(false)

  const { mutate: mutateUpdateDashboard, isLoading: updateDashboardIsLoading } =
    useUpdateDashboard()

  const { data: detailDashboard, refetch: detailDashboardRefetch } =
    useGetDashboardsById({
      id: dashboardId,
      config: {
        staleTime: 1000,
      },
    })
  const widgetDetailDB = useMemo(
    () => detailDashboard?.configuration?.widgets ?? {},
    [detailDashboard?.configuration?.widgets],
  )

  const [widgetList, setWidgetList] = useState<Widget>({})

  const ReactGridLayout = useMemo(() => WidthProvider(Responsive), [])

  const isSendInitMessageRef = useRef(true)
  const isSendMessageSubscribeRef = useRef(true)

  const [{ sendMessage, lastJsonMessage, readyState }, connectionStatus] =
    useWS<DashboardWS>(
      WEBSOCKET_URL,
      () => {
        isSendInitMessageRef.current = true
        isSendMessageSubscribeRef.current = true
        handleSendInitMessage()
        handleSendMessage()
      },
      refetchDataState,
    )

  const [rerenderLayout, setRerenderLayout] = useState(false)

  const projectId = storage.getProject()?.id

  function findOrgs() {
    let result: string[] = []
    for (const key in widgetList) {
      if (widgetList[key].datasource.org_id !== null) {
        const orgId = widgetList[key].datasource?.org_id?.slice(
          widgetList?.[key]?.datasource?.org_id?.indexOf('"') + 1,
          widgetList?.[key]?.datasource?.org_id?.lastIndexOf('"'),
        )
        if (!result.includes(orgId)) {
          result.push(orgId)
        }
      }
    }
    return result
  }

  const findOrgsVar = findOrgs()

  const { data: deviceData, isPreviousData: isPreviousDeviceData } =
    useGetDevices({
      orgIds: findOrgsVar,
      projectId,
      config: {
        retry: 5,
        retryDelay: 5000,
      },
    })

  function triggerRerenderLayout() {
    setRerenderLayout(true)
    setTimeout(() => {
      setRerenderLayout(false)
      refetchData()
    }, 100)
  }

  useEffect(() => {
    if (Object.keys(widgetDetailDB).length !== 0) {
      setWidgetList(widgetDetailDB)
    }
  }, [widgetDetailDB])

  useEffect(() => {
    if (detailDashboard?.dashboard_setting?.starred != null) {
      setIsStar(detailDashboard?.dashboard_setting?.starred)
    }
  }, [detailDashboard?.dashboard_setting?.starred])

  useEffect(() => {
    if (lastJsonMessage != null) {
      if (lastJsonMessage?.errorCode !== 0) {
        toast.error(lastJsonMessage.errorMsg)
      }

      if (
        lastJsonMessage?.errorCode === 0 &&
        !Array.isArray(lastJsonMessage.data)
      ) {
        toast.success(
          t('cloud:dashboard.detail_dashboard.add_widget.controller.success'),
        )
      }
    }
  }, [lastJsonMessage])

  function handleSendInitMessage() {
    Object.values(widgetList).forEach(widget => {
      const dataSource = widget?.datasource
      if (dataSource?.init_message !== '' && dataSource?.init_message != null) {
        sendMessage(dataSource.init_message)
      }
    })
  }

  useEffect(() => {
    if (isSendInitMessageRef.current && !rerenderLayout) {
      handleSendInitMessage()
    }
    isSendInitMessageRef.current = true
  }, [widgetList])

  async function handleSendMessage() {
    if (
      lastJsonMessage?.requestType != null &&
      lastJsonMessage?.requestType === 'INIT' &&
      isSendMessageSubscribeRef.current
    ) {
      Object.values(widgetList).forEach(widget => {
        const realtimeMessage = widget?.datasource?.realtime_message
        const historyMessage = widget?.datasource?.history_message
        const lastestMessage = widget?.datasource?.lastest_message
        if (realtimeMessage !== '' && realtimeMessage != null) {
          sendMessage(realtimeMessage)
        }
        if (historyMessage !== '' && historyMessage != null) {
          sendMessage(historyMessage)
        }
        if (lastestMessage !== '' && lastestMessage != null) {
          sendMessage(lastestMessage)
        }
      })
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSendMessage()
    }, 150)

    isSendMessageSubscribeRef.current = true

    return () => {
      clearTimeout(timeoutId)
    }
  }, [widgetList, lastJsonMessage])

  function combinedObject(data: any[]) {
    let combinedObject: any = {}
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
    delay: 500,
    minDuration: 300,
  })

  const showSpinnerResetLayout = useSpinDelay(rerenderLayout, {
    delay: 150,
    minDuration: 300,
  })

  function refetchData() {
    setRefetchDataState(prev => !prev)
  }

  function getDeviceInfo(deviceId: string) {
    const deviceInfo = deviceData?.devices.find(
      device => device.id === deviceId,
    )
    return deviceInfo
  }

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
        {Object.keys(widgetDetailDB).length === 0 &&
        Object.keys(widgetList).length === 0 &&
        connectionStatus === 'Open' ? (
          <div className="grid grow place-content-center text-h1">
            {t('cloud:dashboard.add_dashboard.note')}
          </div>
        ) : null}

        {showSpinner ? (
          <div className="flex grow items-center justify-center">
            <Spinner showSpinner={showSpinner} size="xl" />
          </div>
        ) : rerenderLayout ? (
          <div className="flex grow items-center justify-center">
            <Spinner showSpinner={showSpinnerResetLayout} size="xl" />
          </div>
        ) : (
          <ReactGridLayout
            margin={[20, 20]}
            isDraggable={isEditMode}
            draggableHandle=".drag-handle"
            isResizable={isEditMode}
            onLayoutChange={e => {
              setLayoutDashboard(e)
            }}
          >
            {(Object.keys(widgetDetailDB).length !== 0 ||
              Object.keys(widgetList).length > 0) &&
              Object.keys(widgetList).map((widgetId, index) => {
                const widgetInfo = {
                  ...widgetList?.[widgetId],
                  attribute_config: widgetList?.[
                    widgetId
                  ]?.attribute_config?.map(item => ({
                    ...item,
                    deviceName: getDeviceInfo(item.label)?.name,
                  })),
                }
                const realtimeValues: TimeSeries =
                  lastJsonMessage?.id === widgetId
                    ? combinedObject(
                        lastJsonMessage?.data?.map(device => {
                          const modifiedTimeseries: {
                            [key: string]: (typeof device.timeseries)[key]
                          } = {}
                          for (const key in device?.timeseries) {
                            const newKey =
                              key +
                              ' - ' +
                              device?.entityId?.entityName +
                              ' - ' +
                              device?.entityId?.id
                            modifiedTimeseries[newKey] = device?.timeseries[key]
                          }
                          return modifiedTimeseries
                        }),
                      )
                    : {}
                const lastestValueOneDevice: LatestData =
                  lastJsonMessage?.id === widgetId
                    ? (lastJsonMessage?.data?.[0]?.latest
                        ?.TIME_SERIES as LatestData)
                    : {}
                const lastestValues: MapSeries =
                  lastJsonMessage?.id === widgetId
                    ? combinedObject(
                        lastJsonMessage?.data?.map(device => ({
                          data: device.latest.TIME_SERIES as LatestData,
                          device: device.entityId,
                        })),
                      )
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
                            // w: 1,
                            // h: 1,
                            w: widgetInfo?.description === 'CARD' ? 3 : 6,
                            h: widgetInfo?.description === 'CARD' ? 1 : 3,
                          }
                    }
                    className={cn('relative bg-secondary-500')}
                    data-iseditmode={isEditMode}
                  >
                    <p
                      className={`absolute ml-2
                      ${widgetInfo?.description === 'MAP' ? 'mt-4' : 'mt-2'}
                    `}
                    >
                      {widgetInfo?.title ?? ''}
                    </p>
                    {widgetInfo?.description === 'LINE' ? (
                      <LineChart
                        data={realtimeValues}
                        widgetInfo={widgetInfo}
                        refetchData={refetchData}
                        refreshBtn={
                          widgetInfo?.config?.chartsetting.data_type ===
                          'HISTORY'
                        }
                      />
                    ) : widgetInfo?.description === 'BAR' ? (
                      <BarChart
                        data={realtimeValues}
                        widgetInfo={widgetInfo}
                        refetchData={refetchData}
                        refreshBtn={
                          widgetInfo?.config?.chartsetting.data_type ===
                          'HISTORY'
                        }
                      />
                    ) : widgetInfo?.description === 'PIE' ? (
                      <PieChart data={lastestValues} widgetInfo={widgetInfo} />
                    ) : widgetInfo?.description === 'MAP' ? (
                      <MapChart
                        data={lastestValues}
                        widgetInfo={widgetInfo}
                        isEditMode={isEditMode}
                      />
                    ) : widgetInfo?.description === 'GAUGE' ? (
                      <GaugeChart
                        data={lastestValueOneDevice}
                        widgetInfo={widgetInfo}
                      />
                    ) : widgetInfo?.description === 'TABLE' ? (
                      <TableChart
                        data={realtimeValues}
                        widgetInfo={widgetInfo}
                        className="h-full p-5"
                        refetchData={refetchData}
                        refreshBtn={
                          widgetInfo?.config?.chartsetting.data_type ===
                          'HISTORY'
                        }
                      />
                    ) : widgetInfo?.description === 'CARD' ? (
                      <CardChart
                        data={lastestValueOneDevice}
                        widgetInfo={widgetInfo}
                      />
                    ) : widgetInfo?.description === 'CONTROLLER' ? (
                      <ControllerButton
                        data={
                          widgetInfo?.datasource?.controller_message as string
                        }
                        sendMessage={sendMessage}
                      />
                    ) : widgetInfo?.description === 'LIGHT' ? (
                      <LightChart
                        data={lastestValues}
                        widgetInfo={widgetInfo}
                      />
                    ) : null}
                    {isEditMode ? (
                      <div
                        className={`absolute right-0 top-0 mr-2 flex gap-x-2
                      ${widgetInfo?.description === 'MAP' ? 'mt-4' : 'mt-2'}
                    `}
                      >
                        <DragIcon
                          width={20}
                          height={20}
                          viewBox="0 0 20 20"
                          className="drag-handle cursor-grab text-secondary-700 hover:text-primary-400 active:cursor-grabbing"
                        />
                        {widgetInfo?.description === 'CONTROLLER' ? (
                          <UpdateControllerButton
                            widgetInfo={widgetInfo}
                            setWidgetList={setWidgetList}
                            widgetId={widgetId}
                          />
                        ) : (
                          <UpdateWidget
                            widgetInfo={widgetInfo}
                            setWidgetList={setWidgetList}
                            widgetId={widgetId}
                          />
                        )}
                        <DeleteIcon
                          width={20}
                          height={20}
                          className="cursor-pointer text-secondary-700 hover:text-primary-400"
                          viewBox="0 0 20 20"
                          onClick={() => {
                            if (widgetList?.hasOwnProperty(widgetId)) {
                              isSendInitMessageRef.current = false
                              isSendMessageSubscribeRef.current = false
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
        )}

        {isEditMode ? (
          <div className="sticky bottom-0 ml-auto flex">
            <Button
              className="ml-2 rounded border-none"
              variant="secondary"
              size="square"
              onClick={() => {
                setWidgetList(widgetDetailDB)
                detailDashboardRefetch()
                setLayoutDashboard(
                  detailDashboard?.dashboard_setting?.layout as RGL.Layout[],
                )
                setIsEditMode(false)
                setIsStar(detailDashboard?.dashboard_setting?.starred || false)
                triggerRerenderLayout()
              }}
              startIcon={
                <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
              }
            >
              {t('btn:back')}
            </Button>
            <Button
              className="ml-2 rounded border-none"
              form="update-dashboard"
              type="submit"
              size="square"
              isLoading={updateDashboardIsLoading}
              onClick={() => {
                setIsEditMode(false)
                close && close()
                // resize bug?
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
              className="ml-2 rounded"
              size="square"
              variant="muted"
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
              <Sheet open={isOpen} onOpenChange={close} modal={false}>
                <SheetContent
                  onInteractOutside={e => {
                    e.preventDefault()
                  }}
                  className={cn(
                    'flex h-full max-w-xl flex-col justify-between',
                  )}
                >
                  <SheetHeader>
                    <SheetTitle>
                      {t('cloud:dashboard.detail_dashboard.add_widget.create')}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
                    <div className="flex w-full gap-x-8">
                      <div className="w-full space-y-6">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4"
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
                                <ChartLine
                                  height={58}
                                  width={58}
                                  viewBox="0 0 58 58"
                                />
                                <span className="flex items-center">
                                  {t(
                                    'cloud:dashboard.detail_dashboard.add_widget.line_chart',
                                  )}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="">
                                <img src={BD_01} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4"
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
                                <ChartGraph
                                  height={58}
                                  width={58}
                                  viewBox="0 0 58 58"
                                />
                                <span className="flex items-center">
                                  {t(
                                    'cloud:dashboard.detail_dashboard.add_widget.horizontal_bar_chart',
                                  )}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="">
                                <img src={DB_03} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {' '}
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4"
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
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="">
                                <img src={BD_04} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4"
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
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="">
                                <img src={BD_05} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4"
                                variant="secondaryLight"
                                onClick={() => {
                                  close()
                                  setIsShowCreateWidget(true)
                                  setWidgetType('LASTEST')
                                  setWidgetCategory('LIGHT')
                                  setIsMultipleAttr(true)
                                  setIsMultipleDevice(true)
                                }}
                              >
                                <img
                                  src={lightOnICon}
                                  alt="light icon"
                                  className="h-[58px] w-[58px]"
                                />
                                <span className="flex items-center">
                                  {t(
                                    'cloud:dashboard.detail_dashboard.add_widget.light',
                                  )}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="">
                                <img src={BD_09} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="w-full space-y-6">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4"
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
                                <ChartCircle
                                  height={58}
                                  width={58}
                                  viewBox="0 0 58 58"
                                />
                                <span className="flex items-center">
                                  {t(
                                    'cloud:dashboard.detail_dashboard.add_widget.pie_chart',
                                  )}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="">
                                <img src={BD_02} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4 active:bg-primary-300"
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
                                  {t(
                                    'cloud:dashboard.detail_dashboard.add_widget.gauge',
                                  )}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="p-[8px]">
                                <img src={BD_06} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4"
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
                                <ChartData
                                  height={58}
                                  width={58}
                                  viewBox="0 0 58 58"
                                />
                                <span className="flex items-center">
                                  {t(
                                    'cloud:dashboard.detail_dashboard.add_widget.data_chart',
                                  )}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="">
                                <img src={BD_07} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                size="square"
                                className="flex w-[245px] justify-between border-none bg-secondary-400 px-4 active:bg-primary-300"
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
                                <ChartMap
                                  height={58}
                                  width={58}
                                  viewBox="0 0 58 58"
                                />
                                <span className="flex items-center">
                                  {t(
                                    'cloud:dashboard.detail_dashboard.add_widget.map',
                                  )}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="">
                                <img src={BD_08} alt="" className="w-[200px]" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>

                  <SheetFooter>
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
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            )}
          </div>
        ) : (
          <div className="sticky bottom-0 ml-auto ">
            <Button
              className="rounded"
              size="square"
              variant="primary"
              isLoading={updateDashboardIsLoading}
              disabled={updateDashboardIsLoading}
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
