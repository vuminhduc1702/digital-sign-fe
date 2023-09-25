// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import { useTranslation } from 'react-i18next'
// import { ReadyState } from 'react-use-websocket'

import { PlusIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { FormDrawer } from "~/components/Form";
import TitleBar from "~/components/Head/TitleBar";
import { ContentLayout } from "~/layout/ContentLayout";
import { useCreateDashboard } from "../api";

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

import { CreateDashboardItem } from "../components/DashboardTable/CreateDashboardItem";

// import { Button } from '~/components/Button'
// import { Calendar } from '~/components/Calendar'
// import SelectMenu, { type ListObj } from '~/components/SelectMenu/SelectMenu'
// import { Spinner } from '~/components/Spinner'
// import { useWS } from '~/utils/hooks'
// import { LineChart } from '../components'

// import { type ValueWS, type WS, type WSAgg } from '../types'

// const wsInterval = [
//   { label: 'Second', value: 1000 },
//   { label: 'Minute', value: 60 * 1000 },
//   { label: 'Hour', value: 60 * 60 * 1000 },
//   { label: 'Day', value: 24 * 60 * 60 * 1000 },
//   { label: 'Week', value: 7 * 24 * 60 * 60 * 1000 },
//   { label: 'Month', value: 30 * 24 * 60 * 60 * 1000 },
//   { label: 'Year', value: 365 * 24 * 60 * 60 * 1000 },
// ]

// const wsAgg: WSAgg[] = [
//   { label: 'None', value: 'NONE' },
//   { label: 'Avg', value: 'AVG' },
//   { label: 'Min', value: 'MIN' },
//   { label: 'Max', value: 'MAX' },
//   { label: 'Sum', value: 'SUM' },
//   { label: 'Count', value: 'COUNT' },
// ]

// export function DashboardDetail() {
//   const { t } = useTranslation()

//   const [date, setDate] = useState<Date | undefined>(new Date())
//   const parseDate = useMemo(
//     () => Date.parse(date?.toISOString() || new Date().toISOString()),
//     [date],
//   )

//   const [interval, setInterval] = useState<ListObj<number>>(wsInterval[0])
//   const [agg, setAgg] = useState<WSAgg>(wsAgg[0])

//   const initMessage = JSON.stringify({
//     entityDataCmds: [
//       {
//         query: {
//           entityFilter: {
//             type: 'entityList',
//             entityType: 'DEVICE',
//             entityIds: [
//               '2841c536-3023-4840-93c6-e3e4d4b2e6f1',
//               '7b78f659-b5fe-4d26-86b0-91b60aebf876',
//             ],
//           },
//           pageLink: {
//             pageSize: 1,
//             page: 0,
//             sortOrder: {
//               key: {
//                 type: 'ENTITY_FIELD',
//                 key: 'ts',
//               },
//               direction: 'DESC',
//             },
//           },
//           entityFields: [
//             {
//               type: 'ENTITY_FIELD',
//               key: 'name',
//             },
//           ],
//           latestValues: [
//             {
//               type: 'TIME_SERIES',
//               key: 'test',
//             },
//             {
//               type: 'TIME_SERIES',
//               key: 'test1',
//             },
//           ],
//         },
//         id: 1,
//       },
//     ],
//   })

//   const lastestMessage = JSON.stringify({
//     entityDataCmds: [
//       {
//         latestCmd: {
//           keys: [
//             {
//               type: 'TIME_SERIES',
//               key: 'test',
//             },
//             {
//               type: 'TIME_SERIES',
//               key: 'test1',
//             },
//           ],
//         },
//         id: 1,
//       },
//     ],
//   })

//   const liveMessage = JSON.stringify({
//     entityDataCmds: [
//       {
//         tsCmd: {
//           keys: ['test', 'test1'],
//           startTs: parseDate,
//           interval: interval.value,
//           limit: 10,
//           offset: 0,
//           agg: agg.value,
//         },
//         id: 1,
//       },
//     ],
//   })

//   const [{ sendMessage, lastJsonMessage, readyState }, connectionStatus] =
//     useWS<WS>()

//   const liveValues: ValueWS[] =
//     lastJsonMessage?.data?.[0]?.timeseries?.test || []
//   const prevValuesRef = useRef<ValueWS[]>([])
//   const newValuesRef = useRef<ValueWS[]>([])
//   useEffect(() => {
//     prevValuesRef.current = newValuesRef.current || liveValues
//   }, [liveValues[0]])
//   if (prevValuesRef.current && agg.value === 'NONE') {
//     newValuesRef.current = [...prevValuesRef.current, ...liveValues]
//   } else newValuesRef.current = liveValues

//   const handleInit = useCallback(() => sendMessage(initMessage), [])
//   const handleLastest = useCallback(() => sendMessage(lastestMessage), [])
//   const handleLive = useCallback(
//     () => sendMessage(liveMessage),
//     [parseDate, interval, agg],
//   )

//   useEffect(() => {
//     if (readyState === ReadyState.OPEN) {
//       handleInit()
//     }
//   }, [handleInit, readyState])

//   function testClick(){
//     return console.info('asdf')
//   }

//   return (
//     <>
//       <div className="flex flex-col gap-x-3">
//         <div className="space-y-3">
//           <Calendar
//             className="rounded-md border"
//             mode="single"
//             selected={date}
//             onSelect={setDate}
//           />
//           <div className="flex gap-x-3">
//             <Button
//               className="h-5 w-10"
//               size="lg"
//               onClick={handleLastest}
//               disabled={readyState !== ReadyState.OPEN}
//             >
//               Lastest
//             </Button>
//             <Button
//               className="h-5 w-10"
//               size="lg"
//               onClick={handleLive}
//               disabled={readyState !== ReadyState.OPEN}
//             >
//               Live
//             </Button>
//           </div>
//           <SelectMenu
//             label={t('ws:filter.interval')}
//             data={wsInterval.map(interval => ({
//               label: interval.label,
//               value: interval.value,
//             }))}
//             selected={interval}
//             setSelected={setInterval}
//           />
//           <SelectMenu
//             label={t('ws:filter.data_aggregation')}
//             data={wsAgg.map(agg => ({
//               label: agg.label,
//               value: agg.value,
//             }))}
//             selected={agg}
//             setSelected={setAgg}
//           />
//         </div>
//       </div>
//       {
//         <Button onClick={testClick}>Test</Button>
//       }
//       {connectionStatus !== 'Connecting' ? (
//         <>
//           <LineChart data={newValuesRef.current} />
//           {/* <GaugeChart data={parseFloat(lastestValue)} /> */}
//           {/* <Map position={[21.068174, 105.81182]} /> */}
//           {/* <BarChart data={lastJsonMessage?.data || []} /> */}
//         </>
//       ) : (
//         <div className="flex grow items-center justify-center">
//           <Spinner showSpinner size="xl" />
//         </div>
//       )}
//     </>
//   )
// }

export function DashboardDetail() {
  const { t } = useTranslation()

  const editMode = true;

  const { mutate, isLoading, isSuccess } = useCreateDashboard()
  
  return (
    <>
      <ContentLayout title={t('sidebar:cloud.dashboard')}>
        <div className="flex grow flex-col">
          <TitleBar title={t('dashboard:title') ?? 'Dashboard'} />
          {/* <div className="flex items-center gap-x-3">
            
          </div> */}
          {editMode ? (
            <div className="flex">
              <Button
                className="rounded border-none"
                variant="secondary"
                size="lg"
                onClick={close}
                startIcon={
                  <img src={btnCancelIcon} alt="Submit" className="h-1 w-1" />
                }
              />
              <Button
                className="rounded border-none"
                form="update-dashboard"
                type="submit"
                size="lg"
                isLoading={isLoading}
                startIcon={
                  <img src={btnSubmitIcon} alt="Submit" className="h-1 w-1" />
                }
              />
              <CreateDashboardItem />
            </div>
          ) : (
            <>

            </>
          )}
        </div>
      </ContentLayout>
    </>
  )
}