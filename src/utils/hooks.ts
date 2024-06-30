import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'
import i18n from '@/i18n'
import storage from './storage'
import { PATHS } from '@/routes/PATHS'
import { useProjectIdStore } from '@/stores/project'

export const useDisclosure = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(state => !state), [])

  return { isOpen, open, close, toggle }
}

export const MAX_FILE_SIZE = 5000000
export const ACCEPTED_FILE_TYPES = ['application/pdf']
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
type UploadImage = {
  project_id: string
  file: z.infer<typeof uploadImageSchema>
}
export type UploadImageDTO = {
  data: UploadImage
}
export function useResetDefaultImage(
  defaultImage: string,
  defaultFileName: string,
) {
  const avatarRef = useRef<HTMLImageElement>(null)
  const [uploadImageErr, setUploadImageErr] = useState('')

  const {
    control: controlUploadImage,
    setValue: setValueUploadImage,
    getValues: getValueUploadImage,
    formState: formStateUploadImage,
    resetField: resetFieldUploadImage,
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })

  function handleResetDefaultImage() {
    resetFieldUploadImage('file')
    setUploadImageErr('')
    if (avatarRef.current != null) {
      avatarRef.current.src = defaultImage
    }
    fetch(defaultImage)
      .then(res => res.blob())
      .then(blob => {
        const defaultFile = new File([blob], defaultFileName, blob)
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
