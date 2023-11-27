import { type WebSocketMessage } from 'react-use-websocket/dist/lib/types'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useWS } from '~/utils/hooks'
import { WEBSOCKET_URL } from '../../routes/DashboardDetail'
import storage from '~/utils/storage'
import { useNotificationStore } from '~/stores/notifications'

import { type BaseWSRes } from '~/types'

type ControllerWSRes = {
  data: {
    code: 0 | 1
    message: string
    data?: any
  }
} & BaseWSRes

export function ControllerButton(data: { data: string }) {
  const { t } = useTranslation()
  const { addNotification } = useNotificationStore()

  const { id: projectId } = storage.getProject()

  const [{ sendMessage, lastJsonMessage, readyState }, connectionStatus] =
    useWS<ControllerWSRes>(WEBSOCKET_URL)
  // console.log('lastJsonMessage controller', lastJsonMessage)

  const handleSendMessage = useCallback(
    (message: WebSocketMessage) => sendMessage(message),
    [],
  )

  const { input, service_name, thing_id } = JSON.parse(Object.values(data)[0])
    .executorCmds[0]

  useEffect(() => {
    if (lastJsonMessage != null) {
      if (lastJsonMessage?.errorCode === 0) {
        addNotification({
          type: 'success',
          title: t(
            'cloud:dashboard.detail_dashboard.add_widget.controller.success',
          )
            .replace('{{SERVICE_NAME}}', service_name)
            .replace('{{DATA}}', lastJsonMessage.data.data),
        })
      }
    }
  }, [lastJsonMessage])

  return (
    <div className="relative h-full">
      <div
        className="absolute left-[50%] top-1/2 z-10 mt-[35px] h-[110px] w-[120px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-b-[30px] border-solid border-[#990033] bg-[#ff0066] p-0 transition-all active:mt-[55px] active:h-[85px] active:rounded-[100px] active:border-b-0"
        onClick={() =>
          handleSendMessage(
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
      >
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 text-body-xs text-white">
          {service_name}
        </p>
      </div>
      <div className="absolute left-1/2 top-1/2 mt-[65px] h-[120px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-[100px] border-b-[20px] border-solid border-gray-500 bg-gray-300 p-0 transition-all"></div>
    </div>
  )
}
