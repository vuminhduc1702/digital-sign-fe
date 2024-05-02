import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useSpinDelay } from 'spin-delay'
import { type SelectInstance } from 'react-select'

import { Button } from '@/components/Button'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  type SelectOption,
} from '@/components/Form'
import { Dialog, DialogTitle } from '@/components/Dialog'
import storage from '@/utils/storage'
import TitleBar from '@/components/Head/TitleBar'
import { Spinner } from '@/components/Spinner'
import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '@/cloud/customProtocol/api/serviceThing'
import { useThingServiceById } from '@/cloud/flowEngineV2/api/thingServiceAPI/getThingServiceById'
import i18n from '@/i18n'
import { Checkbox } from '@/components/ui/checkbox'

import { widgetCategorySchema } from '../../types'
import { type WidgetCategoryType } from './CreateWidget'

import { HiOutlineXMark } from 'react-icons/hi2'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import { PlusIcon } from '@/components/SVGIcons'

export const controllerBtnSchema = z.object({
  title: z.string(),
  description: widgetCategorySchema,
  datasource: z.object({
    controller_message: z.string(),
    thing_id: z.string(),
    handle_service: z.string(),
  }),
  id: z.string().optional(),
})
export const ControllerBtnListSchema = z.record(controllerBtnSchema)
export type ControllerBtnList = z.infer<typeof ControllerBtnListSchema>

export const controllerBtnCreateSchema = z.object({
  title: z.string(),
  thing_id: z.string(),
  handle_service: z.string(),
  input: z.array(
    z.object({
      name: z.string().min(1, {
        message: i18n.t('cloud:custom_protocol.service.choose_input'),
      }),
      value: z
        .string()
        .min(1, {
          message: i18n.t('cloud:custom_protocol.service.choose_inputValue'),
        })
        .or(z.boolean()),
    }),
  ),
  id: z.string().optional(),
})
export type ControllerBtnCreate = z.infer<typeof controllerBtnCreateSchema>

type CreateControllerButtonProps = {
  widgetCategory: WidgetCategoryType
  isOpen: boolean
  close: () => void
  setWidgetList: React.Dispatch<React.SetStateAction<ControllerBtnList>>
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

  const { register, formState, control, handleSubmit, watch } =
    useForm<ControllerBtnCreate>({
      resolver:
        controllerBtnCreateSchema && zodResolver(controllerBtnCreateSchema),
    })

  const { data: thingData, isLoading: isLoadingThing } = useGetEntityThings({
    projectId,
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceThings({
      thingId: watch('thing_id'),
      config: {
        enabled: !!watch('thing_id'),
      },
    })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))

  const { data: thingServiceData, isLoading: thingServiceIsLoading } =
    useThingServiceById({
      thingId: watch('thing_id'),
      name: watch('handle_service'),
      config: {
        enabled: !!watch('thing_id') && !!watch('handle_service'),
      },
    })
  const inputSelectData = thingServiceData?.data?.input?.map(input => ({
    value: input.name,
    label: input.name,
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

  const showSpinner = useSpinDelay(isLoadingThing, {
    delay: 150,
    minDuration: 300,
  })

  const selectDropdownServiceRef = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  function checkInputValueType(inputName: string, index: number) {
    const inputType = thingServiceData?.data?.input?.find(
      ele => ele.name === inputName,
    )?.type

    if (inputType === 'bool') {
      return 'checkbox'
    } else if (inputType === 'json' || inputType === 'str') {
      return 'text'
    } else {
      return 'number'
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:w-[48rem]">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {t('cloud:dashboard.config_chart.title_controller')}
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
            id="create-controllerBtn"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              const widgetId = uuidv4()
              const controllerBtn = {
                title: values.title,
                description: widgetCategory,
                datasource: {
                  controller_message: JSON.stringify({
                    executorCmds: [
                      {
                        project_id: projectId,
                        thing_id: values.thing_id,
                        service_name: values.handle_service,
                        input: (
                          values.input as {
                            name: string
                            value: string | boolean
                          }[]
                        ).reduce(
                          (acc, curr) => {
                            acc[curr.name] = curr.value
                            return acc
                          },
                          {} as { [key: string]: string | boolean },
                        ),
                      },
                    ],
                  }),
                  thing_id: JSON.stringify(values.thing_id),
                  handle_service: JSON.stringify(values.handle_service),
                },
                id: widgetId,
              }
              setWidgetList(prev => ({
                ...prev,
                ...{ [widgetId]: controllerBtn },
              }))

              close()
            })}
          >
            <>
              {isLoadingThing ? (
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
                      isLoading={isLoadingThing}
                      placeholder={t('cloud:custom_protocol.thing.choose')}
                      handleClearSelectDropdown={() =>
                        selectDropdownServiceRef.current?.clearValue()
                      }
                      handleChangeSelect={() =>
                        selectDropdownServiceRef.current?.clearValue()
                      }
                      error={formState?.errors?.thing_id}
                    />

                    <SelectDropdown
                      refSelect={selectDropdownServiceRef}
                      label={t('cloud:custom_protocol.service.title')}
                      name="handle_service"
                      control={control}
                      options={serviceSelectData}
                      isOptionDisabled={option =>
                        option.label === t('loading:service_thing') ||
                        option.label === t('table:no_service')
                      }
                      isLoading={
                        watch('thing_id') != null ? isLoadingService : false
                      }
                      loadingMessage={() => t('loading:service_thing')}
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
                      className="w-full rounded-md bg-secondary-700 pl-3"
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
                    const input = watch('input')
                    return (
                      <section
                        className="mt-3 flex justify-between px-2"
                        key={index}
                      >
                        <div className="flex w-2/3 gap-x-2">
                          <div className="w-full">
                            <SelectDropdown
                              label={t('cloud:custom_protocol.service.input')}
                              name={`input.${index}.name`}
                              control={control}
                              options={inputSelectData}
                              isOptionDisabled={option =>
                                option.label === t('loading:input') ||
                                option.label === t('table:no_input')
                              }
                              noOptionsMessage={() => t('table:no_input')}
                              loadingMessage={() => t('loading:input')}
                              isLoading={thingServiceIsLoading}
                              placeholder={t(
                                'cloud:custom_protocol.service.choose_input',
                              )}
                              error={formState?.errors?.input?.[index]?.name}
                            />
                          </div>
                          {input[index].name ===
                          '' ? null : checkInputValueType(
                              input[index].name,
                              index,
                            ) === 'checkbox' ? (
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
                                  // if value === "" then set value to false
                                  if (value === '') {
                                    onChange(false)
                                  }
                                  return (
                                    <Checkbox
                                      {...field}
                                      checked={Boolean(value)}
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
                              error={formState.errors?.input?.[index]?.value}
                              registration={register(
                                `input.${index}.value` as const,
                              )}
                              type={checkInputValueType(
                                input[index].name,
                                index,
                              )}
                            />
                          )}
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
