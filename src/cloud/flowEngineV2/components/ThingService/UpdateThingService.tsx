import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  FormMultipleFields,
  InputField,
  SelectField,
  TextAreaField,
} from '~/components/Form'

import { Tab } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useParams } from 'react-router-dom'
import * as z from 'zod'
import btnAddIcon from '~/assets/icons/btn-add.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnFullScreen from '~/assets/icons/btn-fullscreen.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { CodeEditor } from '~/cloud/customProtocol/components'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import {
  useUpdateService,
  type CreateServiceThingDTO,
} from '../../api/thingServiceAPI'
import { useExecuteService } from '../../api/thingServiceAPI/executeService'
import { useThingServiceById } from '../../api/thingServiceAPI/getThingServiceById'
import {
  serviceThingSchema,
  type CreateServiceForm,
  type dataRun,
} from './CreateThingService'
import { ThingEventServices } from './ThingEventService'
import { Spinner } from '~/components/Spinner'
import { Switch } from '~/components/Switch'
import { CodeSandboxEditor } from '~/cloud/customProtocol/components/CodeSandboxEditor'
import btnRunCode from '~/assets/icons/btn-run-code.svg'
import { cn } from '~/utils/misc'
import { type ThingService } from '../../types'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

export const updateThingSchema = z.object({
  name: nameSchema,
  description: z.string(),
})

type UpdateThingProps = {
  name: string
  close: () => void
  isOpen: boolean
  thingServiceDataProps?: ThingService[]
}
export function UpdateThingService({
  name,
  close,
  isOpen,
  thingServiceDataProps,
}: UpdateThingProps) {
  const { t } = useTranslation()
  const params = useParams()
  const thingId = params.thingId as string
  const cancelButtonRef = useRef(null)
  const [typeInput, setTypeInput] = useState('')

  const { data: thingServiceData, isLoading: thingServiceLoading } =
    useThingServiceById({
      thingId,
      name,
      config: { suspense: false },
    })

  const [codeInput, setCodeInput] = useState('')
  const [fullScreen, setFullScreen] = useState(false)
  const [codeOutput, setCodeOutput] = useState('')

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useUpdateService()
  const {
    mutate: mutateExcuteService,
    data: executeService,
    isSuccess: isSuccessExecute,
    isLoading: isLoadingExecute,
    isError,
    error: errorExecute,
  } = useExecuteService()

  useEffect(() => {
    setCodeInput(thingServiceData?.data.code || '')
  }, [thingServiceData])

  useEffect(() => {
    if (isSuccessExecute) {
      if (typeof executeService?.data === 'string') {
        setCodeOutput(executeService?.data)
      } else {
        const dataToString = JSON.stringify(executeService?.data)
        setCodeOutput(dataToString)
      }
    }
    if (isError) {
      setCodeOutput(errorExecute?.message)
    }
  }, [isSuccessExecute, isError])

  const [debugMode, setDebugMode] = useState(true)
  const handleSubmit = (data: CreateServiceForm) => {
    const dataInput = data.input.map(item => ({
      name: item.name,
      type: item.type,
    }))
    if (typeInput === 'Run') {
      const dataRun: dataRun = {}
      data.input.map(item => {
        dataRun[item.name] = item.value || ''
      })
      mutateExcuteService({
        data: dataRun,
        thingId,
        projectId,
        name: data.name,
        isDebugMode: debugMode,
      })
    }
    if (typeInput === 'Submit') {
      mutate({
        data: {
          name: data.name,
          description: data.description,
          output: data.output,
          input: dataInput,
          code: codeInput,
        },
        thingId: thingId,
        name: data.name,
      })
    }
  }

  const handleFullScreen = () => {
    setFullScreen(!fullScreen)
    if (!fullScreen) {
      const elem = document.getElementById('update-service-screen')
      if (elem?.requestFullscreen) {
        elem.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.key === 'Escape') {
        setFullScreen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div
        id="update-service-screen"
        className="thing-service-popup inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
      >
        <div className="mt-3 h-[95%] text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:custom_protocol.service.info_service')}
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
          <Tab.Group>
            <Tab.List className="mt-2 flex items-center justify-between bg-secondary-400 px-10">
              <Tab
                className={({ selected }) =>
                  clsx(
                    'flex cursor-pointer gap-2 py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                    { 'text-primary-400': selected },
                  )
                }
              >
                <div className="flex items-center gap-x-2">
                  <p>{t('cloud:custom_protocol.service.info')}</p>
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    'flex cursor-pointer gap-2 py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                    { 'text-primary-400': selected },
                  )
                }
              >
                <div className="flex items-center gap-x-2">
                  <p>{t('cloud:custom_protocol.service.tab_2')}</p>
                </div>
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-2 flex grow flex-col">
              <Tab.Panel
                className={clsx(
                  'flex grow flex-col bg-white focus:outline-none',
                )}
              >
                {thingServiceLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="xl" />
                  </div>
                ) : (
                  <FormMultipleFields<
                    CreateServiceThingDTO['data'],
                    typeof serviceThingSchema
                  >
                    id="create-serviceThing"
                    className="flex flex-col justify-between"
                    onSubmit={values => {
                      handleSubmit(values)
                    }}
                    schema={serviceThingSchema}
                    options={{
                      defaultValues: {
                        ...thingServiceData?.data,
                        description: thingServiceData?.data.description || '',
                      },
                    }}
                    name={['input']}
                  >
                    {({ register, formState }, { fields, append, remove }) => {
                      return (
                        <div>
                          <div className="mb-4 grid grow grid-cols-1 gap-x-4 md:grid-cols-2">
                            <InputField
                              label={t('cloud:custom_protocol.service.name')}
                              error={formState.errors['name']}
                              registration={register('name')}
                              disabled={true}
                            />
                            <SelectField
                              label={t(
                                'cloud:custom_protocol.service.service_input.type',
                              )}
                              error={formState.errors['output']}
                              registration={register('output')}
                              options={[
                                {
                                  label: t(
                                    'cloud:custom_protocol.service.json',
                                  ),
                                  value: 'json',
                                },
                                {
                                  label: t('cloud:custom_protocol.service.str'),
                                  value: 'str',
                                },
                                {
                                  label: t('cloud:custom_protocol.service.i32'),
                                  value: 'i32',
                                },
                                {
                                  label: t('cloud:custom_protocol.service.i64'),
                                  value: 'i64',
                                },
                                {
                                  label: t('cloud:custom_protocol.service.f32'),
                                  value: 'f32',
                                },
                                {
                                  label: t('cloud:custom_protocol.service.f64'),
                                  value: 'f64',
                                },
                                {
                                  label: t(
                                    'cloud:custom_protocol.service.bool',
                                  ),
                                  value: 'bool',
                                },
                                {
                                  label: t(
                                    'cloud:custom_protocol.service.time',
                                  ),
                                  value: 'time',
                                },
                                {
                                  label: t('cloud:custom_protocol.service.bin'),
                                  value: 'bin',
                                },
                              ]}
                            />
                          </div>
                          <div
                            className={cn('grid grid-cols-1 gap-x-4', {
                              'md:grid-cols-3': !fullScreen,
                              'md:grid-cols-4': fullScreen,
                            })}
                          >
                            <div className="relative flex flex-col gap-2 md:col-span-1">
                              <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                                <div className="flex gap-3">
                                  <p className="text-table-header">
                                    {t('cloud:custom_protocol.service.input')}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={cn('overflow-auto', {
                                  'max-h-48': !fullScreen,
                                  'max-h-96': fullScreen,
                                })}
                              >
                                {fields.map((field, index) => (
                                  <div
                                    key={field.id}
                                    className={cn(
                                      'flex  border-0 border-b border-solid border-inherit',
                                      {
                                        'flex-col': fullScreen,
                                      },
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        'grid grid-cols-1 gap-x-4',
                                        {
                                          'md:grid-cols-3': !fullScreen,
                                          'pr-2': fullScreen,
                                        },
                                      )}
                                    >
                                      <InputField
                                        label={t(
                                          'cloud:custom_protocol.service.service_input.name',
                                        )}
                                        error={
                                          formState.errors[`input`]?.[index]
                                            ?.name
                                        }
                                        registration={register(
                                          `input.${index}.name` as const,
                                        )}
                                      />
                                      <SelectField
                                        label={t(
                                          'cloud:custom_protocol.service.service_input.type',
                                        )}
                                        className="pr-2"
                                        error={
                                          formState.errors[`input`]?.[index]
                                            ?.type
                                        }
                                        registration={register(
                                          `input.${index}.type` as const,
                                        )}
                                        options={[
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.json',
                                            ),
                                            value: 'json',
                                          },
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.str',
                                            ),
                                            value: 'str',
                                          },
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.i32',
                                            ),
                                            value: 'i32',
                                          },
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.i64',
                                            ),
                                            value: 'i64',
                                          },
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.f32',
                                            ),
                                            value: 'f32',
                                          },
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.f64',
                                            ),
                                            value: 'f64',
                                          },
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.bool',
                                            ),
                                            value: 'bool',
                                          },
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.time',
                                            ),
                                            value: 'time',
                                          },
                                          {
                                            label: t(
                                              'cloud:custom_protocol.service.bin',
                                            ),
                                            value: 'bin',
                                          },
                                        ]}
                                      />
                                      <InputField
                                        label={t(
                                          'cloud:custom_protocol.service.service_input.value',
                                        )}
                                        error={
                                          formState.errors[`input`]?.[index]
                                            ?.value
                                        }
                                        registration={register(
                                          `input.${index}.value` as const,
                                        )}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      size="square"
                                      variant="trans"
                                      className={cn(
                                        'mt-3 border-none !shadow-none',
                                        {
                                          '!justify-start': fullScreen,
                                        },
                                      )}
                                      onClick={() => remove(index)}
                                      startIcon={
                                        <img
                                          src={btnDeleteIcon}
                                          alt="Delete condition"
                                          className={cn('', {
                                            'h-6 w-6': fullScreen,
                                            'h-10 w-10': !fullScreen,
                                          })}
                                        />
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center">
                                <img
                                  onClick={() =>
                                    append({
                                      name: '',
                                      type: 'json',
                                      value: '',
                                    })
                                  }
                                  src={btnAddIcon}
                                  alt="add-icon"
                                  className="h-5 w-5 cursor-pointer"
                                />
                                <span className="ml-2">
                                  {t('cloud:custom_protocol.service.add_other')}
                                </span>
                              </div>
                              <div className="flex flex-col gap-y-1">
                                <TextAreaField
                                  className="mb-2"
                                  label={t(
                                    'cloud:custom_protocol.service.note',
                                  )}
                                  error={formState.errors['description']}
                                  registration={register('description')}
                                />
                                <div className="flex items-center gap-2">
                                  <Switch
                                    onCheckedChange={checked =>
                                      setDebugMode(checked)
                                    }
                                    defaultChecked
                                  />
                                  <p>
                                    {t('cloud:custom_protocol.service.debug')}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-1.5 flex flex-col gap-y-3">
                                <div className="flex items-center rounded-lg bg-secondary-400 px-4 py-2">
                                  <div className="flex gap-3 ">
                                    <p className="text-table-header">
                                      {t(
                                        'cloud:custom_protocol.service.list_service',
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div
                                  className={cn('mt-0 overflow-auto', {
                                    'max-h-44': !fullScreen,
                                    'max-h-52': fullScreen,
                                  })}
                                >
                                  {thingServiceDataProps?.map(item => {
                                    return (
                                      <div className="mt-1.5 cursor-pointer rounded border border-solid border-cyan-400 bg-cyan-50 py-1.5 text-center first:!mt-0">
                                        {item.name}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                            <div
                              className={cn('flex flex-col gap-2 ', {
                                'grid grow grid-cols-1 gap-x-4 md:col-span-2 md:grid-cols-2':
                                  !fullScreen,
                                'md:col-span-3': fullScreen,
                              })}
                            >
                              <div className="flex flex-col gap-2 md:col-span-1">
                                <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                                  <div className="flex gap-3">
                                    <p className="text-table-header">
                                      {t('cloud:custom_protocol.service.code')}
                                    </p>
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      form="create-serviceThing"
                                      type="submit"
                                    >
                                      <img
                                        onClick={() => setTypeInput('Run')}
                                        src={btnRunCode}
                                        alt="Submit"
                                        className="h-5 w-5 cursor-pointer"
                                      />
                                    </button>
                                  </div>
                                </div>
                                <CodeSandboxEditor
                                  isShowLog={true}
                                  defaultValue={thingServiceData?.data.code}
                                  value={codeInput}
                                  className={`${fullScreen ? '' : '!block'}`}
                                  setCodeInput={setCodeInput}
                                  isFullScreen={fullScreen}
                                />
                              </div>
                              <div
                                className={'flex flex-col gap-2 md:col-span-1'}
                              >
                                <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                                  <div className="flex gap-3">
                                    <p className="text-table-header">
                                      {t(
                                        'cloud:custom_protocol.service.output',
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <CodeSandboxEditor
                                  value={codeOutput}
                                  readOnly={true}
                                  setCodeInput={setCodeOutput}
                                  isFullScreen={fullScreen}
                                  isEdit={true}
                                />
                              </div>
                            </div>
                            <div className="absolute bottom-6 right-6 flex gap-3">
                              <img
                                onClick={handleFullScreen}
                                src={btnFullScreen}
                                alt="add-icon"
                                className="h-5 w-5 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    }}
                  </FormMultipleFields>
                )}
              </Tab.Panel>
              <Tab.Panel
                className={clsx(
                  'flex grow flex-col bg-white focus:outline-none',
                )}
              >
                <ThingEventServices
                  serviceName={thingServiceData?.data?.name || ''}
                />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
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
            form="create-serviceThing"
            type="submit"
            disabled={fullScreen}
            onClick={() => setTypeInput('Submit')}
            size="md"
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          ></Button>
        </div>
      </div>
    </Dialog>
  )
}
