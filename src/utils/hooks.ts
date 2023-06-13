import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useWebSocket, { ReadyState } from 'react-use-websocket'

import { useNotificationStore } from '~/stores/notifications'
import storage, { type UserStorage } from './storage'

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [matches, query])

  return matches
}

export const mediaQueryPoint = {
  xs: 399.98,
  sm: 575.98,
  md: 767.98,
  lg: 1023.98,
  xl: 1279.98,
  '2xl': 1535.98,
}

export const useDisclosure = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(state => !state), [])

  return { isOpen, open, close, toggle }
}

export const useWS = () => {
  const { t } = useTranslation()

  const { token } = storage.getToken() as UserStorage
  const WS_URL = `${
    import.meta.env.VITE_WS_URL as string
  }/websocket/telemetry?auth-token=${encodeURIComponent(`Bearer ${token}`)}`

  const { addNotification } = useNotificationStore()

  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
  } = useWebSocket(WS_URL, {
    onError: () =>
      addNotification({
        type: 'error',
        title: t('ws:connect_error'),
      }),
    shouldReconnect: closeEvent => true,
    reconnectAttempts: 10,
    // attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
    reconnectInterval: attemptNumber =>
      Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
  })

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState]

  return [
    { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState },
    connectionStatus,
  ] as const
}

export function useCopyId() {
  const { t } = useTranslation()
  const { addNotification } = useNotificationStore()

  async function handleCopyId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_map.copy_success'),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return handleCopyId
}
