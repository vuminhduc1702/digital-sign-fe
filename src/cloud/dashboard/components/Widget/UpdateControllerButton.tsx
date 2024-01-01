import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type SelectInstance } from 'react-select'
import { v4 as uuidv4 } from 'uuid'
import * as z from 'zod'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { useThingServiceById } from '~/cloud/flowEngineV2/api/thingServiceAPI/getThingServiceById'
import { Button } from '~/components/Button'
import { Checkbox } from '~/components/Checkbox'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import TitleBar from '~/components/Head/TitleBar'
import { EditBtnIcon, PlusIcon } from '~/components/SVGIcons'
import storage from '~/utils/storage'
import {
  type ControllerBtn,
  type ControllerBtnCreateDTO,
} from './CreateControllerButton'
import {
  type Widget,
  type WidgetCategoryType,
  type widgetSchema,
} from './CreateWidget'

export const controllerBtnUpdateSchema = z.object({
  title: z.string(),
  thing_id: z.string(),
  handle_service: z.string(),
  id: z.string().optional(),
})

export function UpdateControllerButton({
  widgetInfo,
  setWidgetList,
  widgetCategory,
  widgetId,
}: {
  widgetInfo?: z.infer<typeof widgetSchema>
  setWidgetList: React.Dispatch<React.SetStateAction<Widget>>
  widgetCategory: WidgetCategoryType
  widgetId: string
}) {
  const { t } = useTranslation()
  const [isDone, setIsDone] = useState(false)
  const projectId = storage.getProject()?.id
  const parseArrData = JSON.parse(widgetInfo?.datasource.controller_message)
  const parseThingId = JSON.parse(widgetInfo?.datasource.thing_id)
  const parseHandleService = JSON.parse(widgetInfo?.datasource.handle_service)
  const [inputField, setInputField] = useState<any[]>([])

  const [parseArrDataProp] = useState(parseArrData)
  const selectDropdownServiceRef = useRef<SelectInstance<
    SelectOption[]
  > | null>(null)

  // console.log(widgetInfo, 'widgetInfo')
  // console.log(parseArrDataProp, 'parseArrDataProp')
  const { register, formState, control, handleSubmit, watch } =
    useForm<ControllerBtnCreateDTO>({
      resolver:
        controllerBtnUpdateSchema && zodResolver(controllerBtnUpdateSchema),
      values: {
        title: widgetInfo?.title,
        thing_id: parseThingId,
        handle_service: parseHandleService,
        input: parseArrDataProp.executorCmds,
      },
    })

  const { fields, append, remove } = useFieldArray({
    name: 'input',
    control: control,
  })
  // console.log(fields, 'fields')

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
  useEffect(() => {
    if (inputSelectData && inputSelectData.length > 0) {
      const tempInput = parseArrDataProp.executorCmds[0].input
      const checkIsFirstValue = inputSelectData.every(
        item => tempInput[item.value],
      )
      const keyArr = checkIsFirstValue
        ? Object.keys(tempInput)
        : inputSelectData.map(item => item.value)

      const rs = keyArr.map(item => {
        const temp = inputSelectData.find(ele => ele.value === item)
        return {
          input: temp?.value,
          value: checkIsFirstValue ? tempInput[item] : '',
          type: temp?.type,
          id: uuidv4(),
        }
      })
      setInputField(rs)
    }
  }, [thingServiceData, watch('handle_service')])

  // const showSpinner = useSpinDelay(thingIsLoading, {
  //   delay: 150,
  //   minDuration: 300,
  // })
  // console.log(inputSelectData, 'inputSelectData')
  // console.log(inputField, 'inputField')
  return (
    <FormDialog
      size="max"
      title={t('cloud:dashboard.config_chart.update')}
      isDone={isDone}
      body={
        <form
          id="update-widget"
          className="flex w-full flex-col justify-between space-y-5"
          onSubmit={handleSubmit(values => {
            // console.log('values update submit: ', values)
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
                      input: inputField.reduce(
                        (acc: { [key: string]: any }, curr) => {
                          if (curr.type === 'json' || curr.type === 'str') {
                            acc[curr.input] = curr.value ? curr.value : null
                          }
                          if (curr.type === 'i32' || curr.type === 'i64') {
                            acc[curr.input] = curr.value
                              ? parseInt(curr.value)
                              : null
                          }
                          if (curr.type === 'f32' || curr.type === 'f64') {
                            acc[curr.input] = curr.value
                              ? parseFloat(curr.value)
                              : null
                          }
                          if (curr.type === 'bool') {
                            acc[curr.input] = curr.value === 'true'
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

            setWidgetList(prev => ({
              ...prev,
              ...({ [widgetId]: controllerBtn } as Widget),
            }))

            setIsDone(true)
          })}
        >
          <>
            {thingIsLoading ? (
              <div className="flex grow items-center justify-center">
                {/* <Spinner showSpinner={showSpinner} size="xl" /> */}
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
                    defaultValue={thingSelectData?.find(
                      ele => ele.value === parseThingId,
                    )}
                    handleClearSelectDropdown={() => {
                      selectDropdownServiceRef.current?.clearValue()
                      setInputField([])
                    }}
                    handleChangeSelect={() => {
                      selectDropdownServiceRef.current?.clearValue()
                      setInputField([])
                    }}
                  />

                  <SelectDropdown
                    refSelect={selectDropdownServiceRef}
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
                    defaultValue={serviceSelectData?.find(
                      ele => ele.label === parseHandleService,
                    )}
                    handleClearSelectDropdown={() => {
                      setInputField([])
                    }}
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
                    onClick={() => {
                      setInputField([
                        ...inputField,
                        {
                          input: '',
                          value: '',
                          id: uuidv4(),
                          type: 'str',
                        },
                      ])
                    }}
                  />
                </div>
                {inputField.map((item, idx) => {
                  return (
                    <section
                      className="mt-3 flex justify-between px-2"
                      key={`id-input-${idx}`}
                    >
                      <div className="flex gap-x-2">
                        <div className="flex flex-col">
                          <div className="w-80">
                            <SelectDropdown
                              label={t('cloud:custom_protocol.service.input')}
                              name={`input.${idx}.name`}
                              // error={formState?.errors?.input?.[idx]?.name}
                              // registration={register(`input.${idx}.name`)}
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
                              value={inputSelectData?.find(ele => {
                                return ele.value === item.input
                              })}
                              customOnChange={option => {
                                const temp = inputField.map(element => {
                                  if (element.id === item.id) {
                                    return {
                                      ...element,
                                      input: option,
                                      value: '',
                                      type: inputSelectData?.find(
                                        i => i.value === option,
                                      )?.type,
                                    }
                                  }
                                  return element
                                })
                                setInputField(temp)
                              }}
                            />
                          </div>
                        </div>
                        {item.input ? (
                          item.type === 'bool' ? (
                            <FieldWrapper
                              label={t(
                                'cloud:custom_protocol.service.service_input.value',
                              )}
                              // error={formState.errors?.input?.[idx]?.value}
                              className="w-fit"
                            >
                              <Controller
                                // control={control}
                                name={`input.${idx}.value`}
                                // registration={register(`input.${idx}.value`)}
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
                            <div className="flex flex-col">
                              <InputField
                                className="w-80"
                                label={t(
                                  'cloud:custom_protocol.service.service_input.value',
                                )}
                                // error={formState.errors?.input?.[idx]?.value}
                                // registration={register(
                                //   `input.${index}.value` as const,
                                // )}
                                name={`input.${idx}.value`}
                                value={item.value}
                                onChange={e => {
                                  const temp = inputField.map(element => {
                                    if (element.id === item.id) {
                                      return {
                                        ...element,
                                        value: e.target.value,
                                      }
                                    }
                                    return element
                                  })
                                  setInputField(temp)
                                }}
                                type={
                                  ['json', 'str'].includes(item.type)
                                    ? 'text'
                                    : 'number'
                                }
                              />
                            </div>
                          )
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="square"
                        variant="none"
                        className="mt-0 self-start p-0"
                        onClick={() => {
                          setInputField(
                            inputField.filter(t => t.id !== item.id),
                          )
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
      }
      triggerButton={
        <Button
          className="hover:text-primary-400 h-5 w-5"
          variant="none"
          size="square"
          startIcon={<EditBtnIcon width={20} height={17} viewBox="0 0 20 17" />}
        />
      }
      confirmButton={
        <Button
          form="update-widget"
          type="submit"
          size="md"
          className="bg-primary-400 rounded-md border"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
