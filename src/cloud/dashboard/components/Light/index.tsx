import lightBlinkingIcon from '@/assets/icons/light-blinking.svg'
import lightOffIcon from '@/assets/icons/light-off.svg'
import lightOnICon from '@/assets/icons/light-on.svg'
import { useEffect, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '@/components/Spinner'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type z } from 'zod'
import { type DataSeries, type LatestData } from '../../types'
import { type widgetSchema } from '../Widget'

type PieWidgetDataType = {
  keyId: string
  id: string
  label: string
  value: string
  [key: string]: string | number
}

export const LightChart = ({
  data,
  widgetInfo,
}: {
  data: DataSeries
  widgetInfo: z.infer<typeof widgetSchema>
}) => {
  const [dataLight, setDataLight] = useState<PieWidgetDataType[]>([])

  useEffect(() => {
    if (data?.data && widgetInfo) {
      const dataList = data.data
      const deviceList = data.device
      const parseResult = extractData(dataList, deviceList)
      setDataLight(dataManipulation(parseResult))
    }
  }, [data, widgetInfo])

  function extractData(dataList: LatestData, deviceList: any[]) {
    const parseResult: Array<{
      name: string
      deviceName: string
      deviceId: string
      value: any
    }> = []
    for (let i = 0; i < deviceList.length; i++) {
      for (const [key, value] of Object.entries(dataList[i])) {
        parseResult.push({
          name: key,
          deviceName: deviceList[i].entityName,
          deviceId: deviceList[i].id,
          value: dataList?.[i]?.[key]?.value,
        })
      }
    }
    return parseResult
  }

  function dataManipulation(parseResult: any[]) {
    return parseResult.map((item, index) => ({
      keyId: index,
      id: item.name + ' (' + item.deviceName + ')',
      label: item.name + ' (' + item.deviceName + ')',
      value: item.value,
    }))
  }

  const showSpinner = useSpinDelay(dataLight.length === 0, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <>
      {dataLight.length > 0 ? (
        <div className="ml-2 mt-8 flex items-center gap-10">
          {dataLight?.map(item => (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex cursor-pointer flex-col items-center justify-between gap-y-4 rounded-md bg-white p-8 shadow-[0_5px_15px_rgba(149,157,165,0.2)]">
                    <img
                      src={
                        item.value === 'true'
                          ? lightOnICon
                          : item.value === 'false'
                            ? lightOffIcon
                            : item.value === 'blinking'
                              ? lightBlinkingIcon
                              : lightOnICon
                      }
                      alt="light icon"
                      className="h-10 w-10"
                    />
                    {item.id}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="">
                    {item.value === 'true'
                      ? 'Đèn sáng'
                      : item.value === 'false'
                        ? 'Đèn tắt'
                        : item.value === 'blinking'
                          ? 'Đèn nhấp nháy'
                          : ''}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      )}
    </>
  )
}
