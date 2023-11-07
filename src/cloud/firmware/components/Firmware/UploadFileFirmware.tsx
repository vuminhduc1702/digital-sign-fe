import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { type UpdateFirmwareDTO } from '../../api/firmwareAPI'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { UploadIcon } from '@radix-ui/react-icons'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { cn } from '~/utils/misc'
import {
  type UploadFileFirmWareDTO,
  useUploadFileFireWare,
} from '../../api/firmwareAPI/uploadFileFirmware'
import * as z from 'zod'
import i18n from '~/i18n'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
type UploadFileFirmWareProps = {
  firmwareId: string
  close: () => void
  isOpen: boolean
}

export const uploadFileSchema = z.object({
  file: z.instanceof(File, { message: i18n.t('cloud:firmware.choose_file') }),
})
export function UploadFileFirmWare({
  firmwareId,
  close,
  isOpen,
}: UploadFileFirmWareProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  const [file, setFile] = useState<File | null>(null)

  const { mutate, isLoading, isSuccess } = useUploadFileFireWare()
  const { register, formState, control, setError, setValue, handleSubmit } =
    useForm<UploadFileFirmWareDTO>({
      resolver: uploadFileSchema && zodResolver(uploadFileSchema),
    })
  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:firmware.add_firmware.upload_firmware')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          {/* <Form<UploadFileFirmWareDTO, typeof uploadFileSchema> */}
          <form
            id="update-firm-ware"
            className="mt-2 flex w-full flex-col justify-between space-y-6"
            onSubmit={handleSubmit(values => {
              const formData = new FormData()
              formData.append('file', file)
              file &&
                mutate({
                  file: formData,
                  firmwareId,
                })
            })}
            // schema={uploadFileSchema}
          >
            {/* {({ register, formState, control, setValue, setError }) => {
              return ( */}
            <>
              <div className="flex items-center justify-center rounded-md border border-dashed border-rose-300 bg-red-50">
                <label
                  htmlFor="file"
                  className="flex cursor-pointer items-center justify-center gap-3 px-2 py-6"
                >
                  <UploadIcon className="h-6 w-6 text-primary-400" />
                  <div>
                    {file ? (
                      <div className="flex cursor-pointer items-center justify-center gap-1">
                        <span>Name: {file.name}</span>
                      </div>
                    ) : (
                      'Upload File'
                    )}
                  </div>
                </label>
                {file && (
                  <button
                    className="rounded-md text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                    onClick={() => {
                      setValue('file', null)
                      setFile(null)
                    }}
                  >
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
                <InputField
                  id="file"
                  type="file"
                  onChange={e => {
                    if (e.target.files) {
                      setFile(e.target.files[0])
                      setValue('file', e.target.files[0])
                      setError('file', { message: '' })
                    }
                  }}
                />
              </div>
              <p className="text-body-sm text-primary-400">
                {formState?.errors?.file?.message}
              </p>
            </>
          </form>
          {/* )
            }}
          </Form> */}
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
            }
            ref={cancelButtonRef}
          />
          <Button
            isLoading={isLoading}
            form="update-firm-ware"
            type="submit"
            size="md"
            className={cn('bg-primary-400', {
              'cursor-pointer': file,
              'cursor-not-allowed': !file,
            })}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </div>
      </div>
    </Dialog>
  )
}
