import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import {
  useUpdateFirmware,
  type UpdateFirmwareDTO,
} from '../../api/firmwareAPI'

import { XMarkIcon } from '@heroicons/react/24/outline'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetTemplates } from '~/cloud/deviceTemplate/api'
import { Dialog, DialogTitle } from '~/components/Dialog'
import storage from '~/utils/storage'
import { entityFirmWareSchema } from './CreateFirmware'

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
  const { id: projectId } = storage.getProject()
  const cancelButtonRef = useRef(null)
  const [templateValue, setTemplateValue] = useState<SelectOption>({
    label: template_name,
    value: template_id,
  })

  const { data } = useGetTemplates({ projectId })

  const { mutate, isLoading, isSuccess } = useUpdateFirmware()

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
              {t('cloud:firmware.add_firmware.edit_firmware')}
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
          <Form<UpdateFirmwareDTO['data'], typeof entityFirmWareSchema>
            id="update-firm-ware"
            className="mt-2 flex flex-col justify-between"
            onSubmit={values => {
              mutate({
                data: {
                  name: values.name,
                  description: values.description,
                  tag: values.tag,
                  version: values.version,
                  template_id: templateValue.value,
                },
                firmwareId,
              })
            }}
            schema={entityFirmWareSchema}
            options={{
              defaultValues: { name, description, tag, version, template_id },
            }}
          >
            {({ register, formState, control }) => {
              return (
                <>
                  <div>
                    <SelectDropdown
                      isClearable={false}
                      label={t('cloud:firmware.add_firmware.template')}
                      name="template_id"
                      control={control}
                      value={templateValue}
                      onChange={e => setTemplateValue(e)}
                      options={
                        data?.templates?.map(template => ({
                          label: template?.name,
                          value: template?.id,
                        })) || [{ label: '', value: '' }]
                      }
                    />
                    <p className="text-body-sm text-primary-400">
                      {formState?.errors?.template_id?.message}
                    </p>
                  </div>
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
              )
            }}
          </Form>
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
