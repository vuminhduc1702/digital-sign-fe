import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useSpinDelay } from 'spin-delay'
import { useTranslation } from 'react-i18next'
import { type SelectInstance } from 'react-select'
import { v4 as uuidv4 } from 'uuid'
import type * as z from 'zod'

import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '@/cloud/customProtocol/api/serviceThing'
import { useThingServiceById } from '@/cloud/flowEngineV2/api/thingServiceAPI/getThingServiceById'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldWrapper, type SelectOption } from '@/components/Form'
import { FormDialog } from '@/components/FormDialog'
import TitleBar from '@/components/Head/TitleBar'
import storage from '@/utils/storage'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import {
  type ControllerBtnList,
  controllerBtnCreateSchema,
  type controllerBtnSchema,
} from './CreateControllerButton'

import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { EditBtnIcon, PlusIcon } from '@/components/SVGIcons'

export const controllerBtnUpdateSchema = controllerBtnCreateSchema.partial({
  input: true,
})

export function UpdateControllerButton({
  widgetInfo,
  setWidgetList,
  widgetId,
}: {
  widgetInfo?: z.infer<typeof controllerBtnSchema>
  setWidgetList: React.Dispatch<React.SetStateAction<ControllerBtnList>>
  widgetId: string
}) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id

  const widgetInfoMemo = useMemo(() => widgetInfo, [widgetInfo])

  const [isSend, setIsSend] = useState(false)

  const parseArrData =
    widgetInfoMemo?.datasource.controller_message != null
      ? JSON.parse(widgetInfoMemo?.datasource.controller_message)
      : ''
  const parseThingId =
    widgetInfoMemo?.datasource.thing_id != null
      ? JSON.parse(widgetInfoMemo?.datasource.thing_id)
      : ''
  const parseHandleService =
    widgetInfoMemo?.datasource.handle_service != null
      ? JSON.parse(widgetInfoMemo?.datasource.handle_service)
      : ''
  const keyArrData = Object.keys(parseArrData.executorCmds[0].input)
  const inputParse = keyArrData?.map(item => ({
    name: item,
    value: parseArrData.executorCmds[0]?.input?.[item],
  }))

  const [isDone, setIsDone] = useState(false)

  const selectDropdownServiceRef = useRef<SelectInstance<
    SelectOption[]
  > | null>(null)

  const form = useForm<z.infer<typeof controllerBtnUpdateSchema>>({
    resolver:
      controllerBtnUpdateSchema && zodResolver(controllerBtnUpdateSchema),
    values: {
      title: widgetInfoMemo?.title ?? '',
      thing_id: parseThingId,
      handle_service: parseHandleService,
      input: inputParse,
    },
  })

  const { register, formState, control, handleSubmit, watch, setValue } = form

  const { fields, append, remove } = useFieldArray({
    name: 'input',
    control: control,
  })

  const { data: thingData, isLoading: isLoadingThing } = useGetEntityThings({
    projectId,
  })

  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const { data: serviceData } = useGetServiceThings({
    thingId: watch('thing_id'),
    config: {
      enabled: !!watch('thing_id'),
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
      enabled: !!watch('thing_id') && !!watch('handle_service'),
    },
  })
  const inputSelectData = thingServiceData?.data?.input?.map(input => ({
    value: input.name,
    label: input.name,
    type: input.type,
  }))

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

  const showSpinner = useSpinDelay(isLoadingThing, {
    delay: 150,
    minDuration: 300,
  })

  function resetInput() {
    setValue('input', [])
  }

  console.log(watch())

  return (
    <FormDialog
      size="max"
      title={t('cloud:dashboard.config_chart.update_controller')}
      resetData={() => setValue('input', inputParse)}
      isDone={isDone}
      body={
        <Form {...form}>
          <form
            id="update-controller-widget"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              const controllerBtn = {
                title: values.title,
                description: widgetInfoMemo?.description ?? 'LINE',
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

              // close the dialog
              setInterval(() => {
                setIsDone(true)
              }, 100)
              setIsDone(false)
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
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('cloud:dashboard.config_chart.name')}
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t(
                                  'cloud:dashboard.config_chart.name',
                                )}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                    {
                      <FormField
                        control={form.control}
                        name="thing_id"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:custom_protocol.thing.id')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <NewSelectDropdown
                                  customOnChange={onChange}
                                  options={thingSelectData}
                                  isClearable={true}
                                  isOptionDisabled={option =>
                                    option.label ===
                                      t('loading:entity_thing') ||
                                    option.label === t('table:no_thing')
                                  }
                                  noOptionsMessage={() => t('table:no_thing')}
                                  loadingMessage={() =>
                                    t('loading:entity_thing')
                                  }
                                  placeholder={t(
                                    'cloud:custom_protocol.thing.choose',
                                  )}
                                  defaultValue={thingSelectData?.find(
                                    ele => ele.value === parseThingId,
                                  )}
                                  handleClearSelectDropdown={() =>
                                    selectDropdownServiceRef.current?.clearValue()
                                  }
                                  handleChangeSelect={() =>
                                    selectDropdownServiceRef.current?.clearValue()
                                  }
                                  isLoading={isLoadingThing}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    }
                    <FormField
                      control={form.control}
                      name="handle_service"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel>
                            {t('cloud:custom_protocol.service.title')}
                          </FormLabel>
                          <div>
                            <FormControl>
                              <NewSelectDropdown
                                refSelect={selectDropdownServiceRef}
                                customOnChange={onChange}
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
                                isLoading={
                                  watch('thing_id') != null
                                    ? isLoadingThing
                                    : false
                                }
                                loadingMessage={() =>
                                  t('loading:service_thing')
                                }
                                noOptionsMessage={() => t('table:no_service')}
                                placeholder={t(
                                  'cloud:custom_protocol.service.choose',
                                )}
                                defaultValue={serviceSelectData?.find(
                                  ele => ele.label === parseHandleService,
                                )}
                                handleClearSelectDropdown={() => {
                                  resetInput()
                                }}
                                handleChangeSelect={() => {
                                  resetInput()
                                }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
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
                      onClick={() => {
                        const input = watch('input')
                        const addInput = {
                          name: '',
                          value: '',
                          id: uuidv4(),
                        }
                        append(addInput)
                        // setValue('input', [...input, addInput])
                      }}
                    />
                  </div>
                  {fields.map((item, index) => {
                    const watchInput = watch('input')
                    return (
                      <section
                        className="mt-3 flex justify-between px-2"
                        key={`id-input-${index}`}
                      >
                        <div className="flex gap-x-2">
                          <div className="flex flex-col">
                            <div className="w-80">
                              <FormField
                                control={form.control}
                                name={`input.${index}.name`}
                                render={({
                                  field: { onChange, value, ...field },
                                }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t('cloud:custom_protocol.service.input')}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <NewSelectDropdown
                                          customOnChange={onChange}
                                          options={inputSelectData}
                                          isOptionDisabled={option =>
                                            option.label ===
                                              t('loading:input') ||
                                            option.label === t('table:no_input')
                                          }
                                          noOptionsMessage={() =>
                                            t('table:no_input')
                                          }
                                          loadingMessage={() =>
                                            t('loading:input')
                                          }
                                          isLoading={isLoadingThing}
                                          placeholder={t(
                                            'cloud:custom_protocol.service.choose_input',
                                          )}
                                          defaultValue={inputSelectData?.find(
                                            ele => {
                                              return (
                                                ele.value ===
                                                watchInput?.[index].name
                                              )
                                            },
                                          )}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          {watchInput?.[index].name ===
                          '' ? null : checkInputValueType(
                              watchInput?.[index].name as string,
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
                            <div className="flex flex-col">
                              <FormField
                                control={form.control}
                                name={`input.${index}.value`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:custom_protocol.service.service_input.value',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type={checkInputValueType(
                                            watchInput?.[index].name as string,
                                            index,
                                          )}
                                          placeholder={t(
                                            'cloud:org_manage.event_manage.add_event.input_placeholder',
                                          )}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="square"
                          variant="none"
                          className="mt-0 self-start p-0"
                          onClick={() => {
                            remove(index)
                          }}
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
        </Form>
      }
      triggerButton={
        <Button
          className="h-5 w-5 hover:text-primary-400"
          variant="none"
          size="square"
          startIcon={<EditBtnIcon width={20} height={17} viewBox="0 0 20 17" />}
        />
      }
      confirmButton={
        <Button
          form="update-controller-widget"
          type="submit"
          size="md"
          className="rounded-md border bg-primary-400"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
