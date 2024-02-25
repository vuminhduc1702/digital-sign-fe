import clsx from 'clsx'
import { type RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tab } from '@headlessui/react'
import { useParams } from 'react-router-dom'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  InputField,
  SelectField,
  TextAreaField,
} from '~/components/Form'

import { Dialog, DialogTitle } from '~/components/Dialog'
import storage from '~/utils/storage'
import {
  useUpdateService,
  type CreateServiceThingDTO,
} from '../../api/thingServiceAPI'
import { useExecuteService } from '../../api/thingServiceAPI/executeService'
import { useThingServiceById } from '../../api/thingServiceAPI/getThingServiceById'
import {
  serviceThingSchema,
  type dataRun,
  numberServiceInput,
  PANEL_SIZE,
} from './CreateThingService'
import { ThingEventServices } from './ThingEventService'
import { Spinner } from '~/components/Spinner'
import { Switch } from '~/components/Switch'
import { CodeSandboxEditor } from '~/cloud/customProtocol/components/CodeSandboxEditor'
import btnRunCode from '~/assets/icons/btn-run-code.svg'
import { cn } from '~/utils/misc'
import { Dropdown } from '~/components/Dropdown'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/Tooltip'
import { Checkbox } from '~/components/Checkbox'
import { outputList } from '~/cloud/customProtocol/components/CreateService'

import { type InputService, type ThingService } from '../../types'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnChevronDownIcon from '~/assets/icons/btn-chevron-down.svg'
import { XMarkIcon } from '@heroicons/react/24/outline'
import btnAddIcon from '~/assets/icons/btn-add.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnFullScreen from '~/assets/icons/btn-fullscreen.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/Resizable'
import { type ImperativePanelHandle } from 'react-resizable-panels'

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
      // config: { suspense: false },
    })

  const { register, formState, control, handleSubmit, watch, setValue } =
    useForm<CreateServiceThingDTO['data']>({
      resolver: serviceThingSchema && zodResolver(serviceThingSchema),
      defaultValues: {
        ...thingServiceData?.data,
        description: thingServiceData?.data?.description ?? '',
      },
    })

  const { fields, append, remove } = useFieldArray({
    name: 'input',
    control,
  })

  const [codeInput, setCodeInput] = useState('')
  const [fullScreen, setFullScreen] = useState(false)
  const [codeOutput, setCodeOutput] = useState('')
  const [isShowConsole, setIsShowConsole] = useState(false)
  const [, setInputTypeValue] = useState('')
  const codeEditorRef = useRef<ImperativePanelHandle>(null)
  const resultEditorRef = useRef<ImperativePanelHandle>(null)

  const projectId = storage.getProject()?.id

  const { mutate, isLoading, isSuccess } = useUpdateService()
  const {
    mutate: mutateExecuteService,
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
        setCodeOutput(executeService?.data || executeService?.message)
      } else {
        const dataToString = JSON.stringify(
          executeService?.data || executeService?.message,
        )
        setCodeOutput(dataToString)
      }
    }
    if (isError) {
      setCodeOutput(errorExecute?.message)
    }
  }, [isSuccessExecute, isError])

  const [debugMode, setDebugMode] = useState(true)

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

  function resizePanel(ref: RefObject<ImperativePanelHandle>, type: string) {
    if (ref) {
      switch (type) {
        case 'max':
          if (fullScreen) {
            ref.current?.resize(94)
          } else {
            ref.current?.resize(90)
          }
          break
        case 'min':
          if (fullScreen) {
            ref.current?.resize(6)
          } else {
            ref.current?.resize(10)
          }
          break
        case 'default':
          ref.current?.resize(50)
          break
      }
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div
        id="update-service-screen"
        className="thing-service-popup inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
      >
        <div className="mt-3 h-[95%] text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {t('cloud:custom_protocol.service.info_service')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="size-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <form
            id="create-serviceThing"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              const dataInput = values.input.map(item => ({
                name: item.name,
                type: item.type,
                // value:
                //   item.type === 'bool' && item.value === ''
                //     ? 'false'
                //     : numberServiceInput.includes(item.type as string)
                //     ? parseInt(item.value)
                //     : item.value,
              }))
              if (typeInput === 'Run') {
                const dataRun: dataRun = {}
                values.input.map(item => {
                  dataRun[item.name] =
                    item.type === 'bool' && item.value === ''
                      ? 'false'
                      : numberServiceInput.includes(item.type as string)
                      ? parseInt(item.value)
                      : item.value
                })
                mutateExecuteService({
                  data: dataRun,
                  thingId,
                  projectId,
                  name: values.name,
                  isDebugMode: debugMode,
                })
              }
              if (typeInput === 'Submit') {
                mutate({
                  data: {
                    name: values.name,
                    description: values.description,
                    output: values.output,
                    input: dataInput,
                    code: codeInput,
                    fail_limit: values.fail_limit,
                    lock_time: values.lock_time,
                  },
                  thingId: thingId,
                  name: values.name,
                })
              }
            })}
          >
            <>
              <div className="my-2 grid grow grid-cols-1 gap-4 md:grid-cols-4">
                <InputField
                  require={true}
                  label={t('cloud:custom_protocol.service.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                  disabled={true}
                />
                <SelectField
                  label={t('cloud:custom_protocol.service.service_input.type')}
                  require={true}
                  error={formState.errors['output']}
                  registration={register('output')}
                  options={outputList}
                />
                <InputField
                  label={t('cloud:custom_protocol.service.fail_limit')}
                  error={formState.errors['fail_limit']}
                  type="number"
                  registration={register('fail_limit', {
                    valueAsNumber: true,
                  })}
                  min={0}
                />
                {watch('fail_limit') > 0 ? (
                  <InputField
                    label={t('cloud:custom_protocol.service.lock_time')}
                    error={formState.errors['lock_time']}
                    registration={register('lock_time', {
                      onChange: e => {
                        const regexOnlyAcceptNumber = /^\d+$/
                        let temp
                        if (regexOnlyAcceptNumber.test(e.target.value)) {
                          temp = e.target.value
                        } else {
                          temp = e.target.value.replace(/[^0-9]/g, '')
                        }
                        temp += 's'
                        if (temp === 's') {
                          temp = '0s'
                        }

                        setValue('lock_time', temp)
                      },
                    })}
                  />
                ) : null}
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
                      <div>
                        <div
                          className={cn(
                            'grid grid-cols-1 gap-x-4 md:grid-cols-4',
                          )}
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
                                    'flex items-center border-0 border-b border-solid border-inherit py-3 first:pt-0',
                                    {
                                      'justify-between': fullScreen,
                                    },
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'grid w-full grid-cols-1 gap-x-4 gap-y-2 pr-2',
                                    )}
                                  >
                                    <div className="flex gap-x-2">
                                      <InputField
                                        label={t(
                                          'cloud:custom_protocol.service.service_input.name',
                                        )}
                                        require={true}
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
                                        require={true}
                                        error={
                                          formState.errors[`input`]?.[index]
                                            ?.type
                                        }
                                        registration={register(
                                          `input.${index}.type` as const,
                                        )}
                                        options={outputList}
                                        className="h-9 px-2"
                                        onChange={e => {
                                          setInputTypeValue(e.target.value)
                                          fields[index].type = e.target.value
                                        }}
                                      />
                                    </div>
                                    {fields[index].type === 'bool' ? (
                                      <FieldWrapper
                                        label={t(
                                          'cloud:custom_protocol.service.service_input.value',
                                        )}
                                        error={
                                          formState.errors[`input`]?.[index]
                                            ?.value
                                        }
                                        className="w-fit"
                                        classchild="flex items-center gap-x-3"
                                      >
                                        <Controller
                                          control={control}
                                          name={`input.${index}.value`}
                                          render={({
                                            field: {
                                              onChange,
                                              value,
                                              ...field
                                            },
                                          }) => {
                                            return (
                                              <Checkbox
                                                {...field}
                                                checked={value as boolean}
                                                onCheckedChange={onChange}
                                                defaultChecked={false}
                                              />
                                            )
                                          }}
                                        />
                                        <span>True</span>
                                      </FieldWrapper>
                                    ) : (
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
                                        step={0.01}
                                        type={
                                          numberServiceInput.includes(
                                            fields[index].type as string,
                                          )
                                            ? 'number'
                                            : 'text'
                                        }
                                      />
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    size="square"
                                    variant="none"
                                    className={cn(
                                      'h-9 hover:bg-secondary-500',
                                      {
                                        '!justify-center': fullScreen,
                                      },
                                    )}
                                    onClick={() => remove(index)}
                                    startIcon={
                                      <img
                                        src={btnDeleteIcon}
                                        alt="Delete input"
                                        className={cn('size-10')}
                                      />
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                            <div
                              className="flex w-fit items-center"
                              onClick={() => {
                                append({
                                  name: '',
                                  type: 'json',
                                  value: '',
                                })
                                setInputTypeValue('')
                              }}
                            >
                              <img
                                src={btnAddIcon}
                                alt="add-icon"
                                className="size-5 cursor-pointer"
                              />
                              <label className="ml-2 cursor-pointer">
                                {t('cloud:custom_protocol.service.add_other')}
                              </label>
                            </div>
                            <div className="flex flex-col gap-y-1">
                              <div className="mb-2">
                                <TextAreaField
                                  label={t(
                                    'cloud:custom_protocol.service.note',
                                  )}
                                  error={formState.errors['description']}
                                  registration={register('description')}
                                />
                              </div>
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
                                  'max-h-52': !fullScreen,
                                  'max-h-96': fullScreen,
                                })}
                              >
                                {thingServiceDataProps?.map(item => {
                                  const typeOutput = outputList.filter(
                                    data => data.value === item.output,
                                  )

                                  return (
                                    <div className="mt-1.5">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger className="w-full cursor-pointer rounded border border-solid border-cyan-400 bg-cyan-50 py-1.5 text-center first:!mt-0">
                                            <div>{item.name}</div>
                                          </TooltipTrigger>
                                          <TooltipContent side="right">
                                            <div>
                                              <div className="mb-4 text-table-header">
                                                {item.name}
                                              </div>
                                              <div>
                                                <div>
                                                  <div>
                                                    {t(
                                                      'cloud:custom_protocol.service.input',
                                                    )}
                                                    :
                                                  </div>
                                                  <ul>
                                                    {item?.input?.map(
                                                      (data: InputService) => {
                                                        const type =
                                                          outputList.filter(
                                                            item =>
                                                              item.value ===
                                                              data.type,
                                                          )
                                                        return (
                                                          <li className="mt-1.5 pl-2">
                                                            <span className="text-primary-400">
                                                              {data.name}
                                                            </span>
                                                            <span>
                                                              : {type[0]?.label}
                                                            </span>
                                                          </li>
                                                        )
                                                      },
                                                    )}
                                                  </ul>
                                                </div>
                                                <div className="mt-1.5">
                                                  <span>
                                                    {t(
                                                      'cloud:custom_protocol.service.output',
                                                    )}
                                                    :{' '}
                                                  </span>
                                                  <span>
                                                    {typeOutput[0]?.label}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                          <ResizablePanelGroup
                            direction="horizontal"
                            className={cn('flex w-[100%] md:col-span-3', {
                              'flex-col': fullScreen,
                            })}
                          >
                            <ResizablePanel
                              defaultSize={50}
                              minSize={fullScreen ? 13 : 20.5}
                              className={cn(
                                'flex w-[100%] flex-col gap-2 md:col-span-1',
                              )}
                              ref={codeEditorRef}
                            >
                              <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                                <div className="flex gap-3">
                                  <p className="text-table-header">
                                    {t('cloud:custom_protocol.service.code')}
                                  </p>
                                </div>
                                <div className="flex gap-3">
                                  <Dropdown
                                    icon={
                                      <img
                                        height={20}
                                        width={20}
                                        src={btnChevronDownIcon}
                                        className="text-secondary-700 hover:text-primary-400"
                                      />
                                    }
                                  >
                                    <div className="absolute right-0 z-10 mt-6 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                      <div className="p-2">
                                        <div
                                          className="hover:background py-1 hover:cursor-pointer"
                                          onClick={() =>
                                            resizePanel(
                                              codeEditorRef,
                                              PANEL_SIZE.MAX,
                                            )
                                          }
                                        >
                                          {t(
                                            'cloud:custom_protocol.service.maximize_result',
                                          )}
                                        </div>
                                        <div
                                          className="py-1 hover:cursor-pointer"
                                          onClick={() =>
                                            resizePanel(
                                              codeEditorRef,
                                              PANEL_SIZE.MAX,
                                            )
                                          }
                                        >
                                          {t(
                                            'cloud:custom_protocol.service.minimize_result',
                                          )}
                                        </div>
                                        <div
                                          className="py-1 hover:cursor-pointer"
                                          onClick={() =>
                                            resizePanel(
                                              codeEditorRef,
                                              PANEL_SIZE.DEFAULT,
                                            )
                                          }
                                        >
                                          {t(
                                            'cloud:custom_protocol.service.default_result',
                                          )}
                                        </div>
                                        {isShowConsole ? (
                                          <div
                                            className="py-1 hover:cursor-pointer"
                                            onClick={() => {
                                              setIsShowConsole(false)
                                            }}
                                          >
                                            {t(
                                              'cloud:custom_protocol.service.hide_console',
                                            )}
                                          </div>
                                        ) : (
                                          <div
                                            className="py-1 hover:cursor-pointer"
                                            onClick={() => {
                                              setIsShowConsole(true)
                                            }}
                                          >
                                            {t(
                                              'cloud:custom_protocol.service.view_console',
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Dropdown>
                                  <button
                                    form="create-serviceThing"
                                    type="submit"
                                  >
                                    <img
                                      onClick={() => setTypeInput('Run')}
                                      src={btnRunCode}
                                      alt="Submit"
                                      className="size-5 cursor-pointer"
                                    />
                                  </button>
                                </div>
                              </div>
                              <CodeSandboxEditor
                                isShowLog={isShowConsole}
                                defaultValue={thingServiceData?.data.code}
                                value={codeInput}
                                className="!block"
                                setCodeInput={setCodeInput}
                                isFullScreen={fullScreen}
                                isUpdate={true}
                              />
                            </ResizablePanel>
                            <ResizableHandle className="w-2" withHandle />
                            <ResizablePanel
                              defaultSize={50}
                              minSize={fullScreen ? 10.5 : 16.5}
                              className={cn(
                                'flex w-[100%] flex-col gap-2 md:col-span-1',
                              )}
                              ref={resultEditorRef}
                            >
                              <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                                <div className="flex gap-3">
                                  <p className="text-table-header">
                                    {t('cloud:custom_protocol.service.output')}
                                  </p>
                                </div>
                                <div className="flex gap-3">
                                  <Dropdown
                                    icon={
                                      <img
                                        height={20}
                                        width={20}
                                        src={btnChevronDownIcon}
                                        className="text-secondary-700 hover:text-primary-400"
                                      />
                                    }
                                  >
                                    <div className="absolute right-0 z-10 mt-6 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                      <div className="p-2">
                                        <div
                                          className="py-1 hover:cursor-pointer"
                                          onClick={() =>
                                            resizePanel(
                                              resultEditorRef,
                                              PANEL_SIZE.MAX,
                                            )
                                          }
                                        >
                                          {t(
                                            'cloud:custom_protocol.service.maximize_result',
                                          )}
                                        </div>
                                        <div
                                          className="py-1 hover:cursor-pointer"
                                          onClick={() =>
                                            resizePanel(
                                              resultEditorRef,
                                              PANEL_SIZE.MIN,
                                            )
                                          }
                                        >
                                          {t(
                                            'cloud:custom_protocol.service.minimize_result',
                                          )}
                                        </div>
                                        <div
                                          className="py-1 hover:cursor-pointer"
                                          onClick={() =>
                                            resizePanel(
                                              resultEditorRef,
                                              PANEL_SIZE.DEFAULT,
                                            )
                                          }
                                        >
                                          {t(
                                            'cloud:custom_protocol.service.default_result',
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </Dropdown>
                                </div>
                              </div>
                              <CodeSandboxEditor
                                value={codeOutput}
                                readOnly={true}
                                setCodeInput={setCodeOutput}
                                isFullScreen={fullScreen}
                                isUpdate={true}
                                showRunButton={false}
                              />
                            </ResizablePanel>
                          </ResizablePanelGroup>
                          <div className="absolute bottom-6 right-6 flex gap-3">
                            <img
                              onClick={handleFullScreen}
                              src={btnFullScreen}
                              alt="fullscreen-update-service"
                              className="size-5 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
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
              <img src={btnCancelIcon} alt="Cancel" className="size-5" />
            }
            ref={cancelButtonRef}
          />
          <Button
            isLoading={isLoading}
            form="create-serviceThing"
            type="submit"
            disabled={fullScreen || isLoading}
            onClick={() => setTypeInput('Submit')}
            size="md"
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="size-5" />
            }
          ></Button>
        </div>
      </div>
    </Dialog>
  )
}
