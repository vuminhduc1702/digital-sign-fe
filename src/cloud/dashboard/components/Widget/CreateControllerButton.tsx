import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useSpinDelay } from 'spin-delay'

import { Button } from '~/components/Button'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import { Dialog, DialogTitle } from '~/components/Dialog'
import storage from '~/utils/storage'
import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { type Widget, type WidgetCategoryType } from './CreateWidget'
import { widgetCategorySchema } from '../../types'

import { XMarkIcon } from '@heroicons/react/24/outline'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { PlusIcon } from '~/components/SVGIcons'

const controllerBtnSchema = z.object({
  title: z.string(),
  description: widgetCategorySchema,
  datasource: z.object({
    controller_message: z.string(),
  }),
  id: z.string().optional(),
})
export type ControllerBtn = z.infer<typeof controllerBtnSchema>

export const controllerBtnCreateSchema = z.object({
  title: z.string(),
  thing_id: z.string(),
  handle_service: z.string(),
  input: z.array(
    z.object({
      name: z
        .string()
        .min(1, { message: 'Tên biến quá ngắn' })
        .max(30, { message: 'Tên biến quá dài' }),
      value: z.string(),
    }),
  ),
})

type ControllerBtnCreateDTO = {
  data: z.infer<typeof controllerBtnCreateSchema> & { id: string }
}

type CreateControllerButtonProps = {
  widgetCategory: WidgetCategoryType
  isOpen: boolean
  close: () => void
  widgetListRef: React.MutableRefObject<Widget | ControllerBtn>
  setWidgetList: React.Dispatch<React.SetStateAction<Widget | ControllerBtn>>
}

export function CreateControllerButton({
  widgetCategory,
  isOpen,
  close,
  widgetListRef,
  setWidgetList,
}: CreateControllerButtonProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  const { id: projectId } = storage.getProject()

  const { data: thingData, isLoading: thingIsLoading } = useGetEntityThings({
    projectId,
    config: {
      suspense: false,
    },
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  })) || [{ value: '', label: '' }]

  const [selectedThingId, setSelectedThingId] = useState('')
  const { data: serviceData } = useGetServiceThings({
    thingId: selectedThingId,
    config: {
      enabled: !!selectedThingId,
      suspense: false,
    },
  })

  useEffect(() => {
    if (selectedThingId != '') {
      setSelectedThingId('')
    }
  }, [])

  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  })) || [{ value: '', label: '' }]

  const [optionThingId, setOptionThingId] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [optionThingService, setOptionService] = useState<SelectOption>({
    label: '',
    value: '',
  })

  const { register, formState, control, handleSubmit, setValue } = useForm<
    ControllerBtnCreateDTO['data']
  >({
    resolver:
      controllerBtnCreateSchema && zodResolver(controllerBtnCreateSchema),
  })
  console.log('zod errors', formState.errors)

  const { fields, append, remove } = useFieldArray({
    name: 'input',
    control: control,
  })

  useEffect(() => {
    append({
      name: '',
      value: '',
    })
  }, [])

  const showSpinner = useSpinDelay(thingIsLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:w-[48rem]">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:dashboard.config_chart.title')}
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

          <form
            id="create-controllerBtn"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              // console.log('values: ', values)
              const widgetId = uuidv4()
              const controllerBtn: z.infer<typeof controllerBtnSchema> = {
                title: values.title,
                description: widgetCategory,
                datasource: {
                  controller_message: JSON.stringify({
                    executorCmds: [
                      {
                        project_id: projectId,
                        thing_id: values.thing_id,
                        service_name: values.handle_service,
                        input: values.input.reduce(
                          (acc: { [key: string]: any }, item) => {
                            acc[item.name] = item.value
                            return acc
                          },
                          {},
                        ),
                      },
                    ],
                  }),
                },
                id: widgetId,
              }

              widgetListRef.current[widgetId] = controllerBtn
              setWidgetList(widgetListRef.current)

              close()
            })}
          >
            <>
              {thingIsLoading ? (
                <div className="flex grow items-center justify-center">
                  <Spinner showSpinner={showSpinner} size="xl" />
                </div>
              ) : (
                <>
                  <TitleBar
                    title={t('cloud:dashboard.config_chart.show')}
                    className="w-full rounded-md bg-secondary-700 pl-3"
                  />
                  <div className="grid grid-cols-3 gap-x-2 px-2">
                    <InputField
                      label={t('cloud:dashboard.config_chart.name')}
                      error={formState.errors['title']}
                      registration={register('title')}
                      placeholder={t('cloud:dashboard.config_chart.name')}
                    />
                    <div className="space-y-1">
                      <SelectDropdown
                        isClearable={true}
                        label={t('cloud:custom_protocol.thing.id')}
                        name="thing_id"
                        control={control}
                        options={
                          thingData
                            ? thingSelectData
                            : [
                                {
                                  label: t('loading:entity_thing'),
                                  value: '',
                                },
                              ]
                        }
                        isOptionDisabled={option =>
                          option.label === t('loading:entity_thing')
                        }
                        noOptionsMessage={() => t('table:no_thing')}
                        placeholder={t('cloud:custom_protocol.thing.choose')}
                        onChange={e => {
                          setSelectedThingId(e?.value)
                          setOptionThingId(e)
                          setValue('thing_id', e?.value)
                        }}
                        value={optionThingId}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.thing_id?.message}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <SelectDropdown
                        isClearable={true}
                        label={t('cloud:custom_protocol.service.title')}
                        inputId="handleServiceForm"
                        name="handle_service"
                        control={control}
                        options={
                          serviceData?.data != null
                            ? serviceSelectData
                            : serviceData?.data == null
                            ? [
                                {
                                  label: t('table:no_service'),
                                  value: '',
                                },
                              ]
                            : [
                                {
                                  label: t('loading:service_thing'),
                                  value: '',
                                },
                              ]
                        }
                        isOptionDisabled={option =>
                          option.label === t('loading:service_thing') ||
                          option.label === t('table:no_service')
                        }
                        noOptionsMessage={() => t('table:no_service')}
                        placeholder={t('cloud:custom_protocol.service.choose')}
                        onChange={e => {
                          setOptionService(e)
                          setValue('handle_service', e?.value)
                        }}
                        value={optionThingService}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.handle_service?.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between space-x-3">
                    <TitleBar
                      title={t(
                        'cloud:dashboard.detail_dashboard.add_widget.controller.input_list',
                      )}
                      className="w-full rounded-md bg-gray-500 pl-3"
                    />
                    <Button
                      className="rounded-md"
                      variant="trans"
                      size="square"
                      startIcon={
                        <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                      }
                      onClick={() => append({ input: '' })}
                    />
                  </div>
                  {fields.map((field, index) => (
                    <section
                      className="mt-3 flex justify-between gap-x-2"
                      key={field.id}
                    >
                      <div className="flex gap-x-3">
                        <InputField
                          label={`${t(
                            'cloud:dashboard.detail_dashboard.add_widget.controller.input',
                          )} ${index + 1}`}
                          error={formState.errors?.input?.[index]?.name}
                          registration={register(
                            `input.${index}.name` as const,
                          )}
                        />
                        <InputField
                          label={t(
                            'cloud:dashboard.detail_dashboard.add_widget.controller.value',
                          )}
                          error={formState.errors?.input?.[index]?.value}
                          registration={register(
                            `input.${index}.value` as const,
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        size="square"
                        variant="none"
                        className="mt-0 self-start p-0"
                        onClick={() => remove(index)}
                        startIcon={
                          <img
                            src={btnDeleteIcon}
                            alt="Delete controller input"
                            className="mt-3 h-10 w-10"
                          />
                        }
                      />
                    </section>
                  ))}
                </>
              )}
            </>
          </form>
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          <div className="mt-4 flex justify-center space-x-2">
            <Button
              type="button"
              size="md"
              variant="secondary"
              onClick={close}
              startIcon={
                <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
              }
              ref={cancelButtonRef}
            />
            <Button
              form="create-controllerBtn"
              type="submit"
              variant="primary"
              size="md"
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
