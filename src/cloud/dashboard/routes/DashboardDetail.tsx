import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import * as z from 'zod'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TitleBar from '~/components/Head/TitleBar'
import { Button } from '~/components/Button/Button'
import GridLayout from 'react-grid-layout'
import storage from '~/utils/storage'
import { useDisclosure, useWS } from '~/utils/hooks'
import { useGetDashboardsById, useUpdateDetailDashboard } from '../api'
import { LineChart } from '../components'
import { CreateWidget, type WidgetConfig } from '../components/Widget'
import { Drawer } from '~/components/Drawer'

import {
  type WS,
  type WSWidgetData,
  type Widget,
  type WidgetType,
} from '../types'
import { type WebSocketMessage } from 'react-use-websocket/dist/lib/types'

import { EditBtnIcon, PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

const widgetAggSchema = z.object({
  label: z.string(),
  value: z.enum(['NONE', 'AVG', 'MIN', 'MAX', 'SUM', 'COUNT'] as const),
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

export function DashboardDetail() {
  const { t } = useTranslation()

  const DBNAME = localStorage.getItem('dbname')

  const params = useParams()
  const dashboardId = params.dashboardId as string

  const { close, open, isOpen } = useDisclosure()

  const [widgetType, setWidgetType] = useState<WidgetType>('TIMESERIES')
  const { mutate: mutateUpdateDashboard, isLoading: updateDashboardIsLoading } =
    useUpdateDetailDashboard()
  const { data: detailDashboard } = useGetDashboardsById({
    id: dashboardId,
    config: { suspense: false },
  })
  const [isShowCreateWidget, setIsShowCreateWidget] = useState(false)
  const [widgetData, setWidgetData] = useState<WidgetConfig>()

  const [isEditMode, setIsEditMode] = useState(false)

  const [date, setDate] = useState<Date>(new Date())
  const parseDate = useMemo(
    () => Date.parse(date?.toISOString() || new Date().toISOString()),
    [date],
  )

  const lastestMessage = JSON.stringify({
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
        id: 1,
      },
    ],
  })

  const liveMessage = JSON.stringify({
    entityDataCmds: [
      {
        tsCmd: {
          keys: ['test', 'test1'],
          startTs: parseDate,
          interval: widgetData?.widgetSetting?.interval,
          limit: 10,
          offset: 0,
          agg: widgetData?.widgetSetting?.agg,
        },
        id: 1,
      },
    ],
  })

  const historyMessage = JSON.stringify({
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
        id: 1,
      },
    ],
  })

  const realtimeMessage = JSON.stringify({
    entityDataCmds: [
      {
        tsCmd: {
          keys: [],
          startTs: null,
          interval: '',
          limit: 100,
          offset: 0,
          agg: '',
        },
        id: 1,
      },
    ],
  })

  const [{ sendMessage, lastJsonMessage, readyState }, connectionStatus] =
    useWS<WS>()

  const liveValues: WSWidgetData[] =
    lastJsonMessage?.data?.[0]?.timeseries?.test || []
  const prevValuesRef = useRef<WSWidgetData[]>([])
  const newValuesRef = useRef<WSWidgetData[]>([])
  useEffect(() => {
    prevValuesRef.current = newValuesRef.current || liveValues
  }, [liveValues[0]])
  if (prevValuesRef.current && widgetData?.widgetSetting?.agg === 'NONE') {
    newValuesRef.current = [...prevValuesRef.current, ...liveValues]
  } else newValuesRef.current = liveValues
  // const [initWSMessage, setInitMessage] = useState({})
  const handleInit = useCallback(
    (message: WebSocketMessage) => sendMessage(message),
    [],
  )
  const handleLastest = useCallback(() => sendMessage(lastestMessage), [])
  const handleLive = useCallback(
    () => sendMessage(liveMessage),
    [
      parseDate,
      widgetData?.widgetSetting?.interval,
      widgetData?.widgetSetting?.agg,
    ],
  )
  const handleHistory = useCallback(() => sendMessage(historyMessage), [])
  const handleRealtime = useCallback(() => sendMessage(realtimeMessage), [])

  return (
    <div className="flex grow flex-col">
      <TitleBar title={'Dashboard ' + DBNAME} />
      <div className="flex grow flex-col justify-between px-5 py-3 shadow-lg">
        {/* <GridLayout
          style={editMode ? { background: '#f0f0f0' } : {}}
          layout={layout}
          cols={8}
          rowHeight={300}
          width={1560}
          maxRows={1}
          isDraggable={editMode ? true : false}
        >
          <WidgetItem title="Blue eye dragon"></WidgetItem>
        </GridLayout> */}
        {detailDashboard?.configuration.widgets ? (
          <LineChart data={newValuesRef.current} />
        ) : (
          <div>{t('cloud:dashboard.add_dashboard.note')}</div>
        )}

        {isEditMode ? (
          <div className="flex justify-end">
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
                const widgetId = uuidv4()
                const latestData = widgetData?.attributeConfig.map(item => {
                  return {
                    type: 'TIME_SERIES',
                    key: item.attr,
                  }
                })
                mutateUpdateDashboard({
                  data: {
                    configuration: {
                      widgets: {
                        [widgetId]: {
                          type: 'TIMESERIES',
                          title: 'Test',
                          datasource: {
                            init: {
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
                                latestValues: latestData,
                              },
                              id: widgetId,
                            },
                          },
                        },
                      },
                    },
                  },
                  dashboardId,
                })
                const widgetInitId = Object.keys(
                  detailDashboard?.configuration?.widgets as unknown as Widget,
                )[0].toString()
                const setInitMessage = {
                  id: widgetInitId,
                  data: widgetData?.device.map((deviceId: string) => {
                    return {
                      entityId: {
                        entityType: 'DEVICE',
                        id: deviceId,
                      },
                      latest: {},
                    }
                  }),
                }
                handleInit(JSON.stringify(setInitMessage))
                handleHistory()
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
                    <div className="col-6 w-full space-y-3">
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
                    <div className="col-6 w-full space-y-3">
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
          <div className="flex justify-end">
            <Button
              className="mx-2 rounded"
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
