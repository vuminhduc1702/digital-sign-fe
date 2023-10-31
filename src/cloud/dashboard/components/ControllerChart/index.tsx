import { type WebSocketMessage } from 'react-use-websocket/dist/lib/types'
import { useCallback } from 'react'

import { useWS } from '~/utils/hooks'
import { WEBSOCKET_URL } from '../../routes/DashboardDetail'
import storage from '~/utils/storage'

type ControllerWSRes = {
  data: {
    code: 0 | 1
    message: string
  }
  errorCode: number
  errorMsg: string
}

export function ControllerButton() {
  const { id: projectId } = storage.getProject()

  const [{ sendMessage, lastJsonMessage, readyState }, connectionStatus] =
    useWS<ControllerWSRes>(WEBSOCKET_URL)
  console.log('lastJsonMessage controller', lastJsonMessage)

  const handleSendMessage = useCallback(
    (message: WebSocketMessage) => sendMessage(message),
    [],
  )

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
                  thing_id: '346495d3-e22c-4888-a113-6dddc9ba67b4',
                  service_name: 'wsService',
                  input: {
                    temp2: 34,
                  },
                },
              ],
            }),
          )
        }
      ></div>
      <div className="absolute left-1/2 top-1/2 mt-[65px] h-[120px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-[100px] border-b-[20px] border-solid border-gray-500 bg-gray-300 p-0 transition-all"></div>
    </div>
  )
}
