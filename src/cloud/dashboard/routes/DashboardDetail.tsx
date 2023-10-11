import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import * as z from 'zod'
import RGL, { WidthProvider } from 'react-grid-layout'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'
import { useCallback, useEffect, useRef, useState } from 'react'
import TitleBar from '~/components/Head/TitleBar'
import { Button } from '~/components/Button/Button'
import { useDisclosure, useWS } from '~/utils/hooks'
import { useGetDashboardsById, useUpdateDashboard } from '../api'
import { LineChart } from '../components'
import { CreateWidget, type WidgetConfig } from '../components/Widget'
import { Drawer } from '~/components/Drawer'
import storage, { type UserStorage } from '~/utils/storage'

import {
  aggSchema,
  type DashboardWS,
  type WidgetType,
  type TimeSeries,
} from '../types'
import { type WebSocketMessage } from 'react-use-websocket/dist/lib/types'

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
const WS_URL = `${
  import.meta.env.VITE_WS_URL as string
}/websocket/telemetry?auth-token=${encodeURIComponent(`Bearer ${token}`)}`

const ReactGridLayout = WidthProvider(RGL)
const layout: RGL.Layout[] = [
  { i: 'a', x: 0, y: 0, w: 5, h: 5 },
  { i: 'b', x: 5, y: 0, w: 5, h: 5 },
  { i: 'c', x: 0, y: 5, w: 5, h: 5 },
  { i: 'd', x: 5, y: 5, w: 5, h: 5 },
]

export function DashboardDetail() {
  const { t } = useTranslation()

  const DBNAME = localStorage.getItem('dbname')

  const params = useParams()
  const dashboardId = params.dashboardId as string

  const { close, open, isOpen } = useDisclosure()
  const [isEditMode, setIsEditMode] = useState(false)
  const [widgetType, setWidgetType] = useState<WidgetType>('TIMESERIES')
  const [isShowCreateWidget, setIsShowCreateWidget] = useState(false)

  const { mutate: mutateUpdateDashboard, isLoading: updateDashboardIsLoading } =
    useUpdateDashboard()

  const { data: detailDashboard } = useGetDashboardsById({
    id: dashboardId,
  })

  const [widgetData, setWidgetData] = useState<WidgetConfig>()
  // console.log('widgetData', widgetData)

  const [{ sendMessage, lastJsonMessage, readyState }, connectionStatus] =
    useWS<DashboardWS>(WS_URL)

  const handleSendMessage = useCallback(
    (message: WebSocketMessage) => sendMessage(message),
    [],
  )

  const newValuesRef = useRef<TimeSeries | null>(null)
  const prevValuesRef = useRef<TimeSeries | null>(null)

  useEffect(() => {
    if (detailDashboard?.configuration.widgets != null) {
      const widgetIdList = Object.keys(
        detailDashboard?.configuration?.widgets as unknown as WidgetConfig,
      )
      if (widgetIdList.length > 0) {
        widgetIdList.map(widgetId => {
          handleSendMessage(
            detailDashboard?.configuration?.widgets?.[widgetId]?.datasource
              ?.init_message,
          )
          handleSendMessage(
            detailDashboard?.configuration?.widgets?.[widgetId]?.datasource
              ?.realtime_message,
          )

          // const ws = new WebSocket(WS_URL)
          // ws.onopen = event => {
          //   ws.send(
          //     detailDashboard?.configuration?.widgets?.[widgetId]?.datasource
          //       ?.init_message,
          //   )
          //   ws.send(
          //     detailDashboard?.configuration?.widgets?.[widgetId]?.datasource
          //       ?.realtime_message,
          //   )
          // }
          // ws.onmessage = function (event) {
          //   const json = JSON.parse(event.data)
          // }
        })
      }
    }
  }, [detailDashboard?.configuration.widgets, handleSendMessage])

  const realtimeValues = combinedObject(
    lastJsonMessage?.data?.map(device => device?.timeseries),
  )
  useEffect(() => {
    if (realtimeValues != null && Object.keys(realtimeValues).length !== 0) {
      prevValuesRef.current = newValuesRef.current || realtimeValues
      if (newValuesRef.current != null) {
        for (const key in realtimeValues) {
          if (
            JSON.stringify(prevValuesRef.current[key]) !==
              JSON.stringify(newValuesRef.current[key]) ||
            JSON.stringify(prevValuesRef.current[key]) !==
              JSON.stringify(realtimeValues[key])
          ) {
            newValuesRef.current[key] = [
              ...prevValuesRef.current[key],
              ...realtimeValues[key],
            ]
          } else {
            prevValuesRef.current = realtimeValues
          }
        }
      } else {
        newValuesRef.current = realtimeValues
      }
    }
  }, [realtimeValues])

  function combinedObject(data: Array<TimeSeries | null>) {
    let combinedObject: TimeSeries | null = {}
    if (data != null) {
      combinedObject = data.reduce((result, obj) => {
        for (const key in obj) {
          if (obj[key] !== null) {
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
      <TitleBar title={'Dashboard ' + DBNAME} />
      <div className="flex grow flex-col justify-between bg-secondary-500 shadow-lg">
        {detailDashboard?.configuration.widgets ? (
          connectionStatus === 'Open' ? (
            <ReactGridLayout
              layout={layout}
              rowHeight={50}
              isDraggable={isEditMode ? true : false}
              isResizable={isEditMode ? true : false}
              margin={[20, 20]}
            >
              <div key="a" className="bg-secondary-500">
                <LineChart data={newValuesRef.current} />
              </div>
            </ReactGridLayout>
          ) : (
            <div className="flex grow items-center justify-center">
              <Spinner showSpinner={showSpinner} size="xl" />
            </div>
          )
        ) : (
          <div className="grid grow place-content-center text-h1">
            {t('cloud:dashboard.add_dashboard.note')}
          </div>
        )}

        {isEditMode ? (
          <div className="flex justify-end p-3">
            <Button
              className="ml-2 rounded border-none p-3"
              variant="secondary"
              size="square"
              onClick={() => setIsEditMode(false)}
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

                const attrData = widgetData?.attributeConfig.map(item => ({
                  type: 'TIME_SERIES',
                  key: item.attribute_key,
                }))
                const initMessage = {
                  entityDataCmds: [
                    {
                      query: {
                        entityFilter: {
                          type: 'entityList',
                          entityType: 'DEVICE',
                          entityIds: widgetData?.device ?? [],
                        },
                        pageLink: {
                          pageSize: 1,
                          page: 0,
                          sortOrder: {
                            key: {
                              type: 'ENTITY_FIELD',
                              key: 'ts',
                            },
                            direction: 'DESC',
                          },
                        },
                        entityFields: [
                          {
                            type: 'ENTITY_FIELD',
                            key: 'name',
                          },
                        ],
                        latestValues: attrData,
                      },
                      id: widgetData?.id ?? '',
                    },
                  ],
                }

                const lastestMessage = {
                  entityDataCmds: [
                    {
                      latestCmd: {
                        keys: [
                          {
                            type: 'TIME_SERIES',
                            key: 'test',
                          },
                          {
                            type: 'TIME_SERIES',
                            key: 'test1',
                          },
                        ],
                      },
                      id: widgetData?.id ?? '',
                    },
                  ],
                }

                const realtimeMessage = {
                  entityDataCmds: [
                    {
                      tsCmd: {
                        keys: widgetData?.attributeConfig.map(
                          item => item.attribute_key,
                        ),
                        startTs: Date.parse(
                          widgetData?.widgetSetting?.startDate?.toISOString() ||
                            new Date().toISOString(),
                        ),
                        interval: widgetData?.widgetSetting?.interval,
                        limit: 10,
                        offset: 0,
                        agg: widgetData?.widgetSetting?.agg,
                      },
                      id: widgetData?.id ?? '',
                    },
                  ],
                }

                const historyMessage = {
                  entityDataCmds: [
                    {
                      historyCmd: {
                        keys: [],
                        startTs: null,
                        endTs: null,
                        interval: 10000,
                        limit: 100,
                        offset: 0,
                        agg: '',
                      },
                      id: widgetData?.id ?? '',
                    },
                  ],
                }

                mutateUpdateDashboard({
                  data: {
                    title: detailDashboard?.title ?? '',
                    configuration: {
                      description:
                        detailDashboard?.configuration?.description ?? '',
                      widgets: {
                        [widgetData?.id ?? '']: {
                          title: widgetData?.title ?? '',
                          datasource: {
                            init_message: JSON.stringify(initMessage),
                            lastest_message: JSON.stringify(lastestMessage),
                            realtime_message: JSON.stringify(realtimeMessage),
                            history_message: JSON.stringify(historyMessage),
                          },
                          attribute_config: [
                            {
                              attribute_key:
                                widgetData?.attributeConfig?.[0]?.attribute_key,
                              color: widgetData?.attributeConfig?.[0]?.color,
                              decimal:
                                widgetData?.attributeConfig?.[0]?.decimal,
                              label: widgetData?.attributeConfig?.[0]?.label,
                              unit: widgetData?.attributeConfig?.[0]?.unit,
                            },
                          ],
                          config: {
                            aggregation:
                              widgetData?.widgetSetting?.agg ?? 'NONE',
                            timewindow: {
                              interval:
                                widgetData?.widgetSetting?.interval ?? 1000,
                            },
                            chartsetting: {
                              start_date:
                                new Date(
                                  widgetData?.widgetSetting
                                    ?.startDate as unknown as number,
                                ).getTime() ?? 0,
                              end_date:
                                new Date(
                                  widgetData?.widgetSetting
                                    ?.endDate as unknown as number,
                                ).getTime() ?? 0,
                              widget_type:
                                widgetData?.widgetSetting?.widgetType ??
                                'TIMESERIES',
                              data_type:
                                widgetData?.widgetSetting?.dataType ??
                                'realtime',
                            },
                          },
                        },
                      },
                    },
                  },
                  dashboardId,
                })
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
                  isOpen={isShowCreateWidget}
                  close={() => setIsShowCreateWidget(false)}
                  handleSubmitWidget={values => {
                    console.log('values chart: ', values)
                    setIsShowCreateWidget(false)
                    setWidgetData(values)
                  }}
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
                          setWidgetType('TIMESERIES')
                          setIsShowCreateWidget(true)
                          close()
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
                          setWidgetType('TIMESERIES')
                          setIsShowCreateWidget(true)
                          close()
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
                        className="w-full bg-secondary-400 active:bg-primary-300"
                        variant="secondaryLight"
                        onClick={() => {
                          setWidgetType('LASTEST')
                          setIsShowCreateWidget(true)
                          close()
                        }}
                      >
                        <span>
                          {t('cloud:dashboard.detail_dashboard.add_widget.map')}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        size="square"
                        className="w-full bg-secondary-400"
                        variant="secondaryLight"
                        onClick={() => {
                          setWidgetType('LASTEST')
                          setIsShowCreateWidget(true)
                          close()
                        }}
                      >
                        <span>
                          {t(
                            'cloud:dashboard.detail_dashboard.add_widget.pie_chart',
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
