import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import * as z from 'zod'

import { useNotificationStore } from '~/stores/notifications'
import i18n from '~/i18n'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'
import { type UploadImageDTO } from '~/layout/OrgManagementLayout/api'

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

export const useWS = <T>(url: string, sendMessageCallback: () => void) => {
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
    onClose: () => {
      if (window.location.pathname.split('/')[4] != null) {
        sendMessageCallback()
      }
    },
    heartbeat: {
      message: JSON.stringify({ ping: 'ping' }),
      returnMessage: JSON.stringify({ pong: 'ok' }), // If a returnMessage is defined, it will be ignored so that it won't be set as the lastJsonMessage
      timeout: 60 * 1000, // 1 minute, if no response is received, the connection will be closed
      interval: 25 * 1000, // every 25 seconds, a ping message will be sent
    },
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

  async function handleCopyId(id: string, typeCopy?: string) {
    try {
      if (id == null || id === '') {
        addNotification({
          type: 'info',
          title: t('noti:empty_id'),
        })
      } else {
        await navigator.clipboard.writeText(id)
        addNotification({
          type: 'success',
          title:
            typeCopy === 'token'
              ? t('cloud:org_manage.org_map.copy_token_success')
              : t('cloud:org_manage.org_map.copy_success'),
        })
      }
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

export const MAX_FILE_SIZE = 5000000
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const uploadImageSchema = z.object({
  file: z
    .instanceof(File, {
      message: i18n.t('cloud:org_manage.org_manage.add_org.choose_avatar'),
    })
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      i18n.t('validate:image_max_size'),
    )
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('validate:image_type'),
    ),
})
export function useResetDefaultImage(defaultImage: string) {
  const avatarRef = useRef<HTMLImageElement>(null)
  const [uploadImageErr, setUploadImageErr] = useState('')

  const {
    control: controlUploadImage,
    setValue: setValueUploadImage,
    getValues: getValueUploadImage,
    formState: formStateUploadImage,
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })

  function handleResetDefaultImage() {
    setUploadImageErr('')
    if (avatarRef.current != null) {
      avatarRef.current.src = defaultImage
    }
    fetch(defaultImage)
      .then(res => res.blob())
      .then(blob => {
        const defaultFile = new File([blob], 'default.png', blob)
        const formData = new FormData()
        formData.append('file', defaultFile)
        setValueUploadImage(
          'file',
          formData.get('file') as unknown as { file: File },
        )
      })
  }

  return {
    handleResetDefaultImage,
    avatarRef,
    uploadImageErr,
    setUploadImageErr,
    controlUploadImage,
    setValueUploadImage,
    getValueUploadImage,
    formStateUploadImage,
  }
}
