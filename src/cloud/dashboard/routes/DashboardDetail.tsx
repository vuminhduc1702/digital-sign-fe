import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import * as z from 'zod'
import RGL, { WidthProvider } from 'react-grid-layout'
import { useSpinDelay } from 'spin-delay'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Spinner } from '~/components/Spinner'
import TitleBar from '~/components/Head/TitleBar'
import { Button } from '~/components/Button/Button'
import { useDisclosure, useWS } from '~/utils/hooks'
import { useGetDashboardsById, useUpdateDashboard } from '../api'
import { LineChart } from '../components'
import {
  CreateWidget,
  type Widget,
  type WidgetCategoryType,
} from '../components/Widget'
import { Drawer } from '~/components/Drawer'
import storage, { type UserStorage } from '~/utils/storage'
import { cn } from '~/utils/misc'
import { useDashboardNameStore } from '~/stores/dashboard'

import {
  aggSchema,
  type DashboardWS,
  type WidgetType,
  type TimeSeries,
} from '../types'
import { type WebSocketMessage } from 'react-use-websocket/dist/lib/types'
import { WS_URL } from '~/config'

import { EditBtnIcon, PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

const widgetAggSchema = z.object({
  label: z.string(),
  value: aggSchema,
})
export type WidgetAgg = z.infer<typeof widgetAggSchema>

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
const WEBSOCKET_URL = `${WS_URL}/websocket/telemetry?auth-token=${encodeURIComponent(
  `Bearer ${token}`,
)}`

export function DashboardDetail() {
  const { t } = useTranslation()
  // console.log('rerender parent')

  const dashboardName = useDashboardNameStore(state => state.dashboardName)

  const params = useParams()
  const dashboardId = params.dashboardId as string

  const { close, open, isOpen } = useDisclosure()
  const [isEditMode, setIsEditMode] = useState(false)
  const [widgetType, setWidgetType] = useState<WidgetType>('TIMESERIES')
  const [widgetCategory, setWidgetCategory] =
    useState<WidgetCategoryType>('LINE')
  const [isMultipleAttr, setIsMultipleAttr] = useState(true)
  const [isShowCreateWidget, setIsShowCreateWidget] = useState(false)

  const ReactGridLayout = useMemo(() => WidthProvider(RGL), [])
  const layout: RGL.Layout[] = [
    { i: '0', x: 0, y: 0, w: 5, h: 5 },
    { i: '1', x: 5, y: 0, w: 5, h: 5 },
    { i: '2', x: 0, y: 5, w: 5, h: 5 },
    { i: '3', x: 5, y: 5, w: 5, h: 5 },
  ]

  const { mutate: mutateUpdateDashboard, isLoading: updateDashboardIsLoading } =
    useUpdateDashboard()

  const { data: detailDashboard, refetch: detailDashboardRefetch } =
    useGetDashboardsById({
      id: dashboardId,
      config: {
        staleTime: 0,
      },
    })

  const widgetListRef = useRef<Widget>({})
  // console.log('widgetListRef', widgetListRef.current)
  const [widgetList, setWidgetList] = useState<Widget>({})
  console.log('widgetList', widgetList)

  const [{ sendMessage, lastJsonMessage, readyState }, connectionStatus] =
    useWS<DashboardWS>(WEBSOCKET_URL)

  const handleSendMessage = useCallback(
    (message: WebSocketMessage) => sendMessage(message),
    [],
  )

  useEffect(() => {
    if (detailDashboard?.configuration?.widgets != null) {
      widgetListRef.current = detailDashboard?.configuration?.widgets

      const widgetIdList = Object.keys(detailDashboard?.configuration?.widgets)
      if (widgetIdList.length > 0) {
        widgetIdList.map(widgetId => {
          handleSendMessage(
            detailDashboard?.configuration?.widgets?.[widgetId]?.datasource
              .init_message,
          )
          handleSendMessage(
            detailDashboard?.configuration?.widgets?.[widgetId]?.datasource
              .realtime_message,
          )
        })
      }
    } else if (
      detailDashboard?.configuration?.widgets == null &&
      Object.keys(widgetList).length > 0
    ) {
      widgetListRef.current = widgetList

      const widgetIdList = Object.keys(widgetList)
      if (widgetIdList.length > 0) {
        widgetIdList.map(widgetId => {
          handleSendMessage(widgetList?.[widgetId]?.datasource.init_message)
          handleSendMessage(widgetList?.[widgetId]?.datasource.realtime_message)
        })
      }
    }
  }, [detailDashboard?.configuration?.widgets, handleSendMessage, widgetList])

  function combinedObject(data: Array<TimeSeries>) {
    let combinedObject: TimeSeries = {}
    if (data != null) {
      combinedObject = data.reduce((result, obj) => {
        for (const key in obj) {
          if (obj[key] !== null && result != null) {
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

  const showSpinner = useSpinDelay(connectionStatus !== 'Open', {
    delay: 150,
    minDuration: 300,
  })

  return (
    <div className="flex grow flex-col">
      <TitleBar title={`${t('cloud:dashboard.title')}: ${dashboardName}`} />
      <div className="flex grow flex-col justify-between bg-secondary-500 shadow-lg">
        {detailDashboard?.configuration?.widgets == null &&
        Object.keys(widgetList).length === 0 ? (
          <div className="grid grow place-content-center text-h1">
            {t('cloud:dashboard.add_dashboard.note')}
          </div>
        ) : null}

        {(detailDashboard?.configuration?.widgets != null ||
          Object.keys(widgetList).length > 0) &&
          Object.keys(
            Object.keys(widgetList).length === 0
              ? detailDashboard?.configuration?.widgets
              : { ...detailDashboard?.configuration?.widgets, ...widgetList },
          ).map((widgetId, index) => {
            const widgetFromDetailDBByID =
              Object.keys(widgetList).length === 0
                ? detailDashboard?.configuration?.widgets?.[widgetId]
                : {
                    ...detailDashboard?.configuration?.widgets?.[widgetId],
                    ...widgetList[widgetId],
                  }
            console.log('widgetFromDetailDBByID', widgetFromDetailDBByID)

            const realtimeValues: TimeSeries =
              lastJsonMessage?.id === widgetId
                ? combinedObject(
                    lastJsonMessage?.data?.map(device => device.timeseries),
                  )
                : {}

            return connectionStatus === 'Open' ? (
              <ReactGridLayout
                // layout={layout}
                rowHeight={500}
                cols={2}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                margin={[20, 20]}
                // onLayoutChange={e => console.log(e)}
              >
                <div
                  key={index}
                  className={cn(
                    'relative bg-secondary-500',
                    isEditMode && 'cursor-grab',
                  )}
                  data-iseditmode={isEditMode}
                >
                  <p className="absolute ml-2 mt-2">
                    {widgetFromDetailDBByID?.title ?? ''}
                  </p>
                  {widgetFromDetailDBByID?.type === 'LINE' ? (
                    <LineChart data={realtimeValues} />
                  ) : null}
                </div>
              </ReactGridLayout>
            ) : (
              <div className="flex grow items-center justify-center">
                <Spinner showSpinner={showSpinner} size="xl" />
              </div>
            )
          })}

        {/* {detailDashboard?.configuration?.widgets == null &&
          Object.keys(widgetList).length > 0 &&
          Object.keys(widgetList).map((widgetId, index) => {
            const widgetFromDetailDBByID = widgetList[widgetId]

            const realtimeValues: TimeSeries =
              lastJsonMessage?.id === widgetId
                ? combinedObject(
                    lastJsonMessage?.data?.map(device => device.timeseries),
                  )
                : {}

            return connectionStatus === 'Open' ? (
              <ReactGridLayout
                // layout={layout}
                rowHeight={500}
                cols={2}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                margin={[20, 20]}
                // onLayoutChange={e => console.log(e)}
              >
                <div
                  key={index}
                  className={cn(
                    'relative bg-secondary-500',
                    isEditMode && 'cursor-grab',
                  )}
                  data-iseditmode={isEditMode}
                >
                  <p className="absolute ml-2 mt-2">
                    {widgetFromDetailDBByID?.title ?? ''}
                  </p>
                  {widgetFromDetailDBByID?.type === 'LINE' ? (
                    <LineChart data={realtimeValues} />
                  ) : null}
                </div>
              </ReactGridLayout>
            ) : (
              <div className="flex grow items-center justify-center">
                <Spinner showSpinner={showSpinner} size="xl" />
              </div>
            )
          })} */}

        {isEditMode ? (
          <div className="flex justify-end p-3">
            <Button
              className="ml-2 rounded border-none p-3"
              variant="secondary"
              size="square"
              onClick={() => {
                setIsEditMode(false)
                detailDashboardRefetch()
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
                  if (Object.keys(widgetListRef.current).length !== 0) {
                    mutateUpdateDashboard({
                      data: {
                        title: detailDashboard?.title,
                        configuration: {
                          description:
                            detailDashboard?.configuration?.description,
                          widgets: widgetListRef.current,
                        },
                      },
                      dashboardId,
                    })
                  } else {
                    mutateUpdateDashboard({
                      data: {
                        title: detailDashboard?.title,
                        configuration: detailDashboard?.configuration,
                      },
                      dashboardId,
                    })
                  }
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
              <div>
                <CreateWidget
                  widgetType={widgetType}
                  widgetCategory={widgetCategory}
                  isMultipleAttr={isMultipleAttr}
                  isOpen={isShowCreateWidget}
                  close={() => setIsShowCreateWidget(false)}
                  widgetListRef={widgetListRef}
                  setWidgetList={setWidgetList}
                />
              </div>
            ) : (
              <div>
                <Drawer
                  isOpen={isOpen}
                  onClose={close}
                  title={t(
                    'cloud:dashboard.detail_dashboard.add_widget.create',
                  )}
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
                  <div className="flex w-full gap-x-4">
                    <div className="w-full space-y-3">
                      <Button
                        type="button"
                        size="square"
                        className="w-full bg-secondary-400"
                        variant="secondaryLight"
                        onClick={() => {
                          close()
                          setIsShowCreateWidget(true)
                          setWidgetType('TIMESERIES')
                          setWidgetCategory('LINE')
                          setIsMultipleAttr(true)
                        }}
                      >
                        <span>
                          {t(
                            'cloud:dashboard.detail_dashboard.add_widget.line_chart',
                          )}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        size="square"
                        className="w-full bg-secondary-400"
                        variant="secondaryLight"
                        onClick={() => {
                          close()
                          setIsShowCreateWidget(true)
                          setWidgetType('LASTEST')
                          setWidgetCategory('BAR')
                          setIsMultipleAttr(true)
                        }}
                      >
                        <span>
                          {t(
                            'cloud:dashboard.detail_dashboard.add_widget.horizontal_bar_chart',
                          )}
                        </span>
                      </Button>
                    </div>
                    <div className="w-full space-y-3">
                      <Button
                        type="button"
                        size="square"
                        className="w-full bg-secondary-400"
                        variant="secondaryLight"
                        onClick={() => {
                          close()
                          setIsShowCreateWidget(true)
                          setWidgetType('LASTEST')
                          setWidgetCategory('PIE')
                          setIsMultipleAttr(true)
                        }}
                      >
                        <span>
                          {t(
                            'cloud:dashboard.detail_dashboard.add_widget.pie_chart',
                          )}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        size="square"
                        className="w-full bg-secondary-400 active:bg-primary-300"
                        variant="secondaryLight"
                        onClick={() => {
                          close()
                          setIsShowCreateWidget(true)
                          setWidgetType('LASTEST')
                          setWidgetCategory('GAUGE')
                          setIsMultipleAttr(false)
                        }}
                      >
                        <span>
                          {t(
                            'cloud:dashboard.detail_dashboard.add_widget.gauge',
                          )}
                        </span>
                      </Button>
                    </div>
                    <div className="w-full space-y-3">
                      <Button
                        type="button"
                        size="square"
                        className="w-full bg-secondary-400"
                        variant="secondaryLight"
                        onClick={() => {
                          close()
                          setIsShowCreateWidget(true)
                          setWidgetType('LASTEST')
                          setWidgetCategory('RTDATA')
                          setIsMultipleAttr(false)
                        }}
                      >
                        <span>
                          {t(
                            'cloud:dashboard.detail_dashboard.add_widget.data_chart',
                          )}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        size="square"
                        className="w-full bg-secondary-400 active:bg-primary-300"
                        variant="secondaryLight"
                        onClick={() => {
                          close()
                          setIsShowCreateWidget(true)
                          setWidgetType('LASTEST')
                          setWidgetCategory('MAP')
                          setIsMultipleAttr(true)
                        }}
                      >
                        <span>
                          {t('cloud:dashboard.detail_dashboard.add_widget.map')}
                        </span>
                      </Button>
                    </div>
                    <div className="w-full space-y-3">
                      <Button
                        type="button"
                        size="square"
                        className="w-full bg-secondary-400"
                        variant="secondaryLight"
                        onClick={() => {
                          close()
                          setIsShowCreateWidget(true)
                          setWidgetType('LASTEST')
                          setWidgetCategory('TABLE')
                          setIsMultipleAttr(true)
                        }}
                      >
                        <span>
                          {t(
                            'cloud:dashboard.detail_dashboard.add_widget.data_table',
                          )}
                        </span>
                      </Button>
                    </div>
                  </div>
                </Drawer>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-end p-3">
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
