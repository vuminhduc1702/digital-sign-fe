import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '@/components/Form'
import {
  useUpdateFirmware,
  type UpdateFirmwareDTO,
} from '../../api/firmwareAPI'

import { useGetTemplates } from '@/cloud/deviceTemplate/api'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import storage from '@/utils/storage'
import { entityFirmWareSchema } from './CreateFirmware'

import { HiOutlineXMark } from 'react-icons/hi2'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'

type UpdateFirmWareProps = {
  firmwareId: string
  name: string
  description: string
  tag: string
  version: string
  close: () => void
  isOpen: boolean
  template_name: string
  template_id: string
}
export function UpdateFirmWare({
  firmwareId,
  name,
  description,
  tag,
  version,
  template_name,
  template_id,
  close,
  isOpen,
}: UpdateFirmWareProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const cancelButtonRef = useRef(null)
  const [templateValue, setTemplateValue] = useState<SelectOption>({
    label: template_name,
    value: template_id,
  })

  const { data } = useGetTemplates({ projectId })

  const firmwareData = data?.templates?.map(template => ({
    label: template?.name,
    value: template?.id,
  })) || [{ label: '', value: '' }]

  const { mutate, isLoading, isSuccess } = useUpdateFirmware()
  const { register, formState, control, handleSubmit, getValues } = useForm<
    UpdateFirmwareDTO['data']
  >({
    resolver: entityFirmWareSchema && zodResolver(entityFirmWareSchema),
    defaultValues: { name, description, tag, version, template_id },
  })
  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {t('cloud:firmware.add_firmware.edit_firmware')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <form
            id="update-firm-ware"
            className="mt-2 flex w-full flex-col justify-between space-y-6"
            onSubmit={handleSubmit(values => {
              mutate({
                data: {
                  name: values.name,
                  description: values.description,
                  tag: values.tag,
                  version: values.version,
                  template_id: values.template_id,
                },
                firmwareId,
              })
            })}
          >
            <>
              <SelectDropdown
                isClearable={false}
                label={t('cloud:firmware.add_firmware.template')}
                name="template_id"
                control={control}
                options={firmwareData}
                defaultValue={firmwareData.find(
                  firm => firm.value === getValues('template_id'),
                )}
                error={formState?.errors?.template_id}
              />

              <InputField
                label={t('cloud:firmware.add_firmware.name')}
                error={formState.errors['name']}
                registration={register('name')}
              />
              <InputField
                label={t('cloud:firmware.add_firmware.version')}
                error={formState.errors['version']}
                registration={register('version')}
              />
              <InputField
                label={t('cloud:firmware.add_firmware.tag')}
                error={formState.errors['tag']}
                registration={register('tag')}
              />
              <InputField
                label={t('cloud:firmware.add_firmware.description')}
                error={formState.errors['description']}
                registration={register('description')}
              />
            </>
          </form>
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
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </div>
      </div>
    </Dialog>
  )
}
