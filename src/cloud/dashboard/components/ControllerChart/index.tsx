import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import storage from '@/utils/storage'
import { toast } from 'sonner'

import { type SendMessage } from 'react-use-websocket/dist/lib/types'
import { type DashboardWS } from '../../types'

export function ControllerButton({
  data,
  sendMessage,
  lastJsonMessage,
}: {
  data: string
  sendMessage: SendMessage
  lastJsonMessage: DashboardWS
}) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id

  const { input, service_name, thing_id } = JSON.parse(data).executorCmds[0]

  function handleSendMessage() {
    sendMessage(
      JSON.stringify({
        executorCmds: [
          {
            project_id: projectId,
            thing_id,
            service_name,
            input,
          },
        ],
      }),
    )
  }

  useEffect(() => {
    if (lastJsonMessage != null) {
      if (
        lastJsonMessage?.errorCode === 0 &&
        !Array.isArray(lastJsonMessage.data)
      ) {
        toast.success(
          t('cloud:dashboard.detail_dashboard.add_widget.controller.success')
            .replace('{{SERVICE_NAME}}', service_name)
            .replace('{{DATA}}', lastJsonMessage.data.data),
        )
      }
    }
  }, [lastJsonMessage])

  return (
    <div className="relative h-full">
      <div
        className="absolute left-[50%] top-1/2 z-10 mt-[35px] h-[110px] w-[120px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-b-[30px] border-solid border-[#990033] bg-[#ff0066] p-0 transition-all active:mt-[55px] active:h-[85px] active:rounded-[100px] active:border-b-0"
        onClick={handleSendMessage}
      >
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 text-body-xs text-white">
          {service_name}
        </p>
      </div>
      <div className="absolute left-1/2 top-1/2 mt-[65px] h-[120px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-[100px] border-b-[20px] border-solid border-gray-500 bg-gray-300 p-0 transition-all"></div>
    </div>
  )
}
