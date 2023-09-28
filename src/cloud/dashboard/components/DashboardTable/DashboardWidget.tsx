import { useTranslation } from 'react-i18next'
import { useCreateDashboard } from '../../api/createDashboard'
import { Button } from '~/components/Button/Button'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CreateConfigChart,
  type CreateConfigChartDTO,
} from './CreateConfigChart'
import {
  type CreateWidgetItemDTO,
  useCreateWidgetItem,
} from '../../api/createWidgetItem'
import { Form, FormDrawer, InputField } from '~/components/Form'
import { EditBtnIcon, PlusIcon } from '~/components/SVGIcons'
import GridLayout from 'react-grid-layout'
import storage from '~/utils/storage'
import { type ValueWS, type WS, type WSAgg, type Widget } from '../../types'
import { type ListObj } from '~/components/SelectMenu'
import { useWS } from '~/utils/hooks'
import { LineChart } from '../LineChart'
import { v4 as uuidv4 } from 'uuid'
import { useUpdateDashboard } from '../../api/updateDashboard'
import { useGetDashboardsById } from '../../api'
import { useParams } from 'react-router-dom'
import { DashboardDetail } from '../../routes/DashboardDetail'
import { type WebSocketMessage } from 'react-use-websocket/dist/lib/types'

export function DashboardWidget() {
  const { t } = useTranslation()

  const params = useParams()
  const dashboardId = params.dashboardId as string
  const projectId = params.projectId as string

  const [widgetType, setWidgetType] = useState('')
  const { mutate: mutateDashboard } = useCreateDashboard()
  const {
    mutate: mutateUpdateDashboard,
    isLoading,
    isSuccess,
  } = useUpdateDashboard()
  const { data: detailDashboard } = useGetDashboardsById({
    id: dashboardId,
    config: { suspense: false },
  })
  const [selectedWidget, setWidgetChecked] = useState('')
  const [showingConfigDialog, setShowingConfigDialog] = useState(false)
  const [chartData, setChartData] = useState<CreateConfigChartDTO>()

  const { isLoading: isLoadingThing, isSuccess: isSuccessThing } =
    useCreateWidgetItem()
  const [editMode, toggleEdit] = useState(false)

  // const layout = [{}]
  // { i: "blue-eyes-dragon", x: 0, y: 0, w: 1, h: 1 },
  // { i: "dark-magician", x: 1, y: 0, w: 1, h: 1 },
  // { i: "kuriboh", x: 2, y: 0, w: 1, h: 1 },
  // { i: "spell-caster", x: 3, y: 0, w: 1, h: 1 },
  // { i: "summoned-skull", x: 4, y: 0, w: 1, h: 1 }

  const wsInterval = [
    { label: 'Second', value: 1000 },
    { label: 'Minute', value: 60 * 1000 },
    { label: 'Hour', value: 60 * 60 * 1000 },
    { label: 'Day', value: 24 * 60 * 60 * 1000 },
    { label: 'Week', value: 7 * 24 * 60 * 60 * 1000 },
    { label: 'Month', value: 30 * 24 * 60 * 60 * 1000 },
    { label: 'Year', value: 365 * 24 * 60 * 60 * 1000 },
  ]

  const wsAgg: WSAgg[] = [
    { label: 'None', value: 'NONE' },
    { label: 'Avg', value: 'AVG' },
    { label: 'Min', value: 'MIN' },
    { label: 'Max', value: 'MAX' },
    { label: 'Sum', value: 'SUM' },
    { label: 'Count', value: 'COUNT' },
  ]

  const [interval, setInterval] = useState<ListObj<number>>(wsInterval[0])
  const [agg, setAgg] = useState<WSAgg>(wsAgg[0])

  const [date, setDate] = useState<Date | undefined>(new Date())
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
          interval: interval.value,
          limit: 10,
          offset: 0,
          agg: agg.value,
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

  const liveValues: ValueWS[] =
    lastJsonMessage?.data?.[0]?.timeseries?.test || []
  const prevValuesRef = useRef<ValueWS[]>([])
  const newValuesRef = useRef<ValueWS[]>([])
  useEffect(() => {
    prevValuesRef.current = newValuesRef.current || liveValues
  }, [liveValues[0]])
  if (prevValuesRef.current && agg.value === 'NONE') {
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
    [parseDate, interval, agg],
  )
  const handleHistory = useCallback(() => sendMessage(historyMessage), [])
  const handleRealtime = useCallback(() => sendMessage(realtimeMessage), [])

  return (
    <>
      {/* {
        <GridLayout style={editMode ? { background: '#f0f0f0' } : {}} layout={layout} cols={8} rowHeight={300} width={1560} maxRows={1} isDraggable={editMode ? true : false}>
          <WidgetItem title='Blue eye dragon'></WidgetItem>
          
        </GridLayout>
      } */}
      {detailDashboard?.configuration.widgets ? (
        <LineChart data={newValuesRef.current} />
      ) : (
        <div>Vui lòng tạo widget</div>
      )}

      {editMode ? (
        <div className="flex justify-end">
          <Button
            className="ml-2 rounded border-none p-3"
            variant="secondary"
            size="square"
            onClick={() => toggleEdit(false)}
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
            isLoading={isLoading}
            onClick={() => {
              toggleEdit(false)
              const widgetId = uuidv4()
              const latestData = chartData?.dataConfigChart.map((item: any) => {
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
                        type: 'timeseries',
                        title: 'Test',
                        datasource: {
                          init: {
                            query: {
                              entityFilter: {
                                type: 'entityList',
                                entityType: 'DEVICE',
                                entityIds: chartData?.device,
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
                          },
                        },
                        config: {},
                      },
                    },
                  },
                },
                dashboardId: dashboardId,
              })
              const widgetInitId = Object.keys(
                detailDashboard?.configuration?.widgets as unknown as Widget,
              )[0].toString()
              const setInitMessage = {
                id: widgetInitId,
                data: chartData?.device.map((deviceId: string) => {
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
          {showingConfigDialog ? (
            <div>
              <CreateConfigChart
                widgetType={widgetType}
                close={() => setShowingConfigDialog(false)}
                isOpen={true}
                handleSubmitChart={values => {
                  console.log('values chart: ', values)
                  setShowingConfigDialog(false)
                  setChartData(values)
                }}
              />
            </div>
          ) : (
            <div>
              <FormDrawer
                isDone={isSuccess}
                title={t('cloud:dashboard.detail_dashboard.add_widget.create')}
                triggerButton={
                  <Button
                    className="ml-2 h-9 rounded-md"
                    variant="trans"
                    size="lg"
                    style={{ width: '6rem' }}
                    startIcon={
                      <PlusIcon width={15} height={16} viewBox="0 0 16 16" />
                    }
                  >
                    Widget
                  </Button>
                }
              >
                <Form<CreateWidgetItemDTO['data']>
                  id="create-dashboard"
                  onSubmit={values => {
                    mutateDashboard({
                      data: {
                        title: values.title,
                        project_id: projectId,
                        configuration: {
                          description: values.description,
                        },
                      },
                    })
                  }}
                >
                  {({ register, formState }) => (
                    <div className="flex gap-x-4">
                      <div className="col-6 w-full">
                        <Button
                          type="button"
                          size="square"
                          className="mb-4 bg-secondary-400"
                          variant="secondaryLight"
                          style={{ width: '100%' }}
                          onClick={() => {
                            setShowingConfigDialog(true)
                            setWidgetType('timeseries')
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
                          className="mb-4 bg-secondary-400"
                          variant="secondaryLight"
                          style={{ width: '100%' }}
                          onClick={() => {
                            setShowingConfigDialog(true)
                            setWidgetType('')
                          }}
                        >
                          <span>
                            {t(
                              'cloud:dashboard.detail_dashboard.add_widget.horizontal_bar_chart',
                            )}
                          </span>
                        </Button>
                      </div>
                      <div className="col-6 w-full">
                        <Button
                          type="button"
                          size="square"
                          className="mb-4 bg-secondary-400"
                          variant="secondaryLight"
                          style={{ width: '100%' }}
                          onClick={() => {
                            setShowingConfigDialog(true)
                            setWidgetType('')
                          }}
                        >
                          <span>
                            {t(
                              'cloud:dashboard.detail_dashboard.add_widget.map',
                            )}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          size="square"
                          className="mb-4 bg-secondary-400"
                          variant="secondaryLight"
                          style={{ width: '100%' }}
                          onClick={() => {
                            setShowingConfigDialog(true)
                            setWidgetType('')
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
                  )}
                </Form>
              </FormDrawer>
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
            isLoading={isLoading}
            onClick={() => toggleEdit(true)}
            startIcon={
              <EditBtnIcon
                width={20}
                height={20}
                className="text-white"
                viewBox="0 0 20 20"
              />
            }
          >
            Edit
          </Button>
        </div>
      )}
    </>
  )
}
