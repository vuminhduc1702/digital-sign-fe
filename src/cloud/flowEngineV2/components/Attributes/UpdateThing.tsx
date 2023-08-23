import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { useUpdateThing, type UpdateThingDTO } from '../../api/thingAPI'

import { XMarkIcon } from '@heroicons/react/24/outline'
import * as z from 'zod'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { nameSchema } from '~/utils/schemaValidation'

export const updateThingSchema = z.object({
  name: nameSchema,
  description: z.string(),
})

type UpdateThingProps = {
  thingId: string
  name: string
  description: string
  close: () => void
  isOpen: boolean
}
export function UpdateThing({
  thingId,
  name,
  description,
  close,
  isOpen,
}: UpdateThingProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  const { mutate, isLoading, isSuccess } = useUpdateThing()

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
            {t('cloud:custom_protocol.thing.edit')}
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
          <Form<UpdateThingDTO['data'], typeof updateThingSchema>
            id="create-entityThing"
            className="flex flex-col justify-between mt-2"
            onSubmit={values => {
              mutate({
                data: {
                  name: values.name,
                  description: values.description,
                },
                thingId,
              })
            }}
            schema={updateThingSchema}
            options={{
              defaultValues: { name, description },
            }}
          >
            {({ register, formState }) => {
              return (
                <>
                  <InputField
                    label={t('cloud:custom_protocol.thing.name')}
                    error={formState.errors['name']}
                    registration={register('name')}
                  />
                  <InputField
                    label={t('cloud:custom_protocol.thing.description')}
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
            form="create-entityThing"
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