import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { type JsonValue } from 'react-use-websocket/dist/lib/types'

import { useNotificationStore } from '~/stores/notifications'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'

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

export const useWS = <T extends JsonValue | null>(url: string) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
  } = useWebSocket<T>(url, {
    onError: () =>
      addNotification({
        type: 'error',
        title: t('ws:connect_error'),
      }),
    shouldReconnect: closeEvent => true,
    reconnectAttempts: 5,
    // attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
    reconnectInterval: attemptNumber =>
      Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
  })

  type ConnectionStatus =
    | 'Connecting'
    | 'Open'
    | 'Closing'
    | 'Closed'
    | 'Uninstantiated'
  const status: { [key: number]: ConnectionStatus } = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }
  const connectionStatus: ConnectionStatus = status[readyState]

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

export function useDefaultCombobox(
  comboboxType: 'org' | 'device',
): OrgMapType | undefined {
  const { t } = useTranslation()

  switch (comboboxType) {
    case 'org':
      return {
        id: '',
        level: '1',
        name: t('search:no_org'),
        description: '',
        parent_name: '',
        children: [],
        image: '',
        org_id: '',
      }
  }
}
