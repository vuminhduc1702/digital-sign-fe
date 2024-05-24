import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { InputField } from '@/components/Form'
import { useUpdateThing, type UpdateThingDTO } from '../../api/thingAPI'
import { Dialog, DialogTitle } from '@/components/ui/dialog'

import { nameSchema } from '@/utils/schemaValidation'

import { HiOutlineXMark } from 'react-icons/hi2'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

  const form = useForm<UpdateThingDTO['data']>({
    resolver: updateThingSchema && zodResolver(updateThingSchema),
    defaultValues: { name, description },
  })

  const { control, handleSubmit, setValue, watch, formState, reset } = form

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
              {t('cloud:custom_protocol.thing.edit')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={() => {
                  close()
                  reset()
                }}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <Form {...form}>
            <form
              id="create-entityThing"
              className="mt-2 flex w-full flex-col justify-between space-y-6"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    name: values.name,
                    description: values.description,
                  },
                  thingId,
                })
              })}
            >
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:custom_protocol.thing.name')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:custom_protocol.thing.description')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            </form>
          </Form>
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
            onClick={() => {
              close()
              reset()
            }}
            startIcon={
              <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
            }
            ref={cancelButtonRef}
          />
          <Button
            isLoading={isLoading}
            disabled={!formState.isDirty || isLoading}
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
