import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useSpinDelay } from 'spin-delay'

import { Button } from '~/components/Button'
import { FieldWrapper, InputField, SelectDropdown } from '~/components/Form'
import { Dialog, DialogTitle } from '~/components/Dialog'
import storage from '~/utils/storage'
import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { useThingServiceById } from '~/cloud/flowEngineV2/api/thingServiceAPI/getThingServiceById'
import i18n from '~/i18n'

import { widgetCategorySchema } from '../../types'
import { type Widget, type WidgetCategoryType } from './CreateWidget'
import { type OutputType } from '~/cloud/customProtocol'

import { XMarkIcon } from '@heroicons/react/24/outline'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { PlusIcon } from '~/components/SVGIcons'
import { Checkbox } from '~/components/Checkbox'

const controllerBtnSchema = z.object({
  title: z.string(),
  description: widgetCategorySchema,
  datasource: z.object({
    controller_message: z.string(),
    thing_id: z.string(),
    handle_service: z.string(),
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
      name: z.string().min(1, {
        message: i18n.t('cloud:custom_protocol.service.choose_input'),
      }),
      value: z.string().min(1, {
        message: i18n.t('cloud:custom_protocol.service.choose_inputValue'),
      }),
    }),
  ),
  id: z.string().optional(),
})

export type ControllerBtnCreateDTO = {
  title: string
  thing_id: string
  handle_service: string
  data: z.infer<typeof controllerBtnCreateSchema>
}

type CreateControllerButtonProps = {
  widgetCategory: WidgetCategoryType
  isOpen: boolean
  close: () => void
  setWidgetList: React.Dispatch<React.SetStateAction<Widget>>
}

export function CreateControllerButton({
  widgetCategory,
  isOpen,
  close,
  setWidgetList,
}: CreateControllerButtonProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  const projectId = storage.getProject()?.id

  const { register, formState, control, handleSubmit, watch } = useForm<
    ControllerBtnCreateDTO['data']
  >({
    resolver:
      controllerBtnCreateSchema && zodResolver(controllerBtnCreateSchema),
  })
  // console.log('zod errors', formState.errors)

  const { data: thingData, isLoading: thingIsLoading } = useGetEntityThings({
    projectId,
    config: {
      suspense: false,
    },
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const { data: serviceData } = useGetServiceThings({
    thingId: watch('thing_id'),
    config: {
      enabled: !!watch('thing_id'),
      suspense: false,
    },
  })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))

  const { data: thingServiceData } = useThingServiceById({
    thingId: watch('thing_id'),
    name: watch('handle_service'),
    config: {
      suspense: false,
      enabled: !!watch('thing_id') && !!watch('handle_service'),
    },
  })
  const inputSelectData = thingServiceData?.data?.input?.map(input => ({
    value: input.name,
    label: input.name,
    type: input.type,
  }))

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
      <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:w-[48rem]">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:dashboard.config_chart.title')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="text-secondary-900 hover:text-secondary-700 focus:ring-secondary-600 rounded-md bg-white focus:outline-none focus:ring-2"
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
              const controllerBtn: ControllerBtn = {
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
                            const itemType = inputSelectData?.find(
                              input => input.value === item.name,
                            )?.type as OutputType
                            if (itemType === 'json' || itemType === 'str') {
                              acc[item.name] = item.value
                            }
                            if (itemType === 'i32' || itemType === 'i64') {
                              acc[item.name] = parseInt(item.value)
                            }
                            if (itemType === 'f32' || itemType === 'f64') {
                              acc[item.name] = parseFloat(item.value)
                            }
                            if (itemType === 'bool') {
                              acc[item.name] = item.value === 'true'
                            }
                            return acc
                          },
                          {},
                        ),
                      },
                    ],
                  }),
                  thing_id: JSON.stringify(values.thing_id),
                  handle_service: JSON.stringify(values.handle_service),
                },
                id: widgetId,
              }
              // console.log(controllerBtn, 'controllerBtn')
              setWidgetList(prev => ({
                ...prev,
                ...({ [widgetId]: controllerBtn } as Widget),
              }))

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
                    className="bg-secondary-700 w-full rounded-md pl-3"
                  />
                  <div className="grid grid-cols-3 gap-x-2 px-2">
                    <InputField
                      label={t('cloud:dashboard.config_chart.name')}
                      error={formState.errors['title']}
                      registration={register('title')}
                      placeholder={t('cloud:dashboard.config_chart.name')}
                    />

                    <SelectDropdown
                      label={t('cloud:custom_protocol.thing.id')}
                      name="thing_id"
                      control={control}
                      options={thingSelectData}
                      isOptionDisabled={option =>
                        option.label === t('loading:entity_thing') ||
                        option.label === t('table:no_thing')
                      }
                      noOptionsMessage={() => t('table:no_thing')}
                      loadingMessage={() => t('loading:entity_thing')}
                      isLoading={thingIsLoading}
                      placeholder={t('cloud:custom_protocol.thing.choose')}
                      error={formState?.errors?.thing_id}
                    />

                    <SelectDropdown
                      label={t('cloud:custom_protocol.service.title')}
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
                      error={formState?.errors?.handle_service}
                    />
                  </div>

                  <div className="flex justify-between space-x-3">
                    <TitleBar
                      title={t(
                        'cloud:dashboard.detail_dashboard.add_widget.controller.input_list',
                      )}
                      className="bg-secondary-700 w-full rounded-md pl-3"
                    />
                    <Button
                      className="rounded-md"
                      variant="trans"
                      size="square"
                      startIcon={
                        <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                      }
                      onClick={() =>
                        append({
                          name: '',
                          value: '',
                        })
                      }
                    />
                  </div>
                  {fields.map((field, index) => {
                    return (
                      <section
                        className="mt-3 flex justify-between px-2"
                        key={field.id}
                      >
                        <div className="flex w-2/3 gap-x-2">
                          <div className="w-full">
                            <SelectDropdown
                              label={t('cloud:custom_protocol.service.input')}
                              name={`input.${index}.name`}
                              control={control}
                              options={
                                thingServiceData?.data != null
                                  ? inputSelectData
                                  : thingServiceData?.data == null
                                  ? [
                                      {
                                        label: t('table:no_input'),
                                        value: '',
                                        type: '',
                                      },
                                    ]
                                  : [
                                      {
                                        label: t('loading:input'),
                                        value: '',
                                        type: '',
                                      },
                                    ]
                              }
                              isOptionDisabled={option =>
                                option.label === t('loading:input') ||
                                option.label === t('table:no_input')
                              }
                              noOptionsMessage={() => t('table:no_input')}
                              placeholder={t(
                                'cloud:custom_protocol.service.choose_input',
                              )}
                              error={formState?.errors?.input?.[index]?.name}
                            />
                          </div>
                          {/* <InputField
                            label={t(
                              'cloud:dashboard.detail_dashboard.add_widget.controller.value',
                            )}
                            error={formState.errors?.input?.[index]?.value}
                            registration={register(
                              `input.${index}.value` as const,
                            )}
                          /> */}
                          {inputSelectData?.map(ele => {
                            if (ele.value === watch(`input.${index}.name`)) {
                              return ele.type === 'bool' ? (
                                <FieldWrapper
                                  label={t(
                                    'cloud:custom_protocol.service.service_input.value',
                                  )}
                                  error={
                                    formState.errors?.input?.[index]?.value
                                  }
                                  className="w-fit"
                                >
                                  <Controller
                                    control={control}
                                    name={`input.${index}.value`}
                                    render={({
                                      field: { onChange, value, ...field },
                                    }) => {
                                      return (
                                        <Checkbox
                                          {...field}
                                          checked={value as boolean}
                                          onCheckedChange={onChange}
                                          defaultChecked
                                        />
                                      )
                                    }}
                                  />
                                  <span className="pl-3">True</span>
                                </FieldWrapper>
                              ) : (
                                <InputField
                                  label={t(
                                    'cloud:custom_protocol.service.service_input.value',
                                  )}
                                  error={
                                    formState.errors?.input?.[index]?.value
                                  }
                                  registration={register(
                                    `input.${index}.value` as const,
                                  )}
                                  type={
                                    ['json', 'str'].includes(ele.type)
                                      ? 'text'
                                      : 'number'
                                  }
                                />
                              )
                            }
                            return null
                          })}
                          {/* {watch(`input.${index}.name`) === 'bool' ? (
                            <FieldWrapper
                              label={t(
                                'cloud:custom_protocol.service.service_input.value',
                              )}
                              error={formState.errors?.input?.[index]?.value}
                              className="w-fit"
                            >
                              <Controller
                                control={control}
                                name={`input.${index}.value`}
                                render={({
                                  field: { onChange, value, ...field },
                                }) => {
                                  return (
                                    <Checkbox
                                      {...field}
                                      checked={value as boolean}
                                      onCheckedChange={onChange}
                                      defaultChecked
                                    />
                                  )
                                }}
                              />
                              <span className="pl-3">True</span>
                            </FieldWrapper>
                          ) : (
                            <InputField
                              // defaultValue={
                              //   inputSelectData ? inputSelectData[field.name] : ''
                              // }
                              label={t(
                                'cloud:custom_protocol.service.service_input.value',
                              )}
                              error={formState.errors?.input?.[index]?.value}
                              registration={register(
                                `input.${index}.value` as const,
                              )}
                              type={
                                ['json', 'str'].includes(
                                  watch(`input.${index}.name`),
                                )
                                  ? 'text'
                                  : 'number'
                              }
                            />
                          )} */}
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
                    )
                  })}
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
