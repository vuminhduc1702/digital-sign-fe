import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  FormMultipleFields,
  InputField,
  SelectField,
  TextAreaField,
} from '~/components/Form'
import { nameSchemaRegex } from '~/utils/schemaValidation'
import {
  useCreateServiceThing,
  type CreateServiceThingDTO,
  type inputlist,
} from '../../api/thingServiceAPI'

import { cn } from '~/utils/misc'

import { useParams } from 'react-router-dom'
import btnAddIcon from '~/assets/icons/btn-add.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnFullScreen from '~/assets/icons/btn-fullscreen.svg'
import btnRunCode from '~/assets/icons/btn-run-code.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnChevronDownIcon from '~/assets/icons/btn-chevron-down.svg'
import { CodeSandboxEditor } from '~/cloud/customProtocol/components/CodeSandboxEditor'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'
import { Switch } from '~/components/Switch'
import storage from '~/utils/storage'
import { useExecuteService } from '../../api/thingServiceAPI/executeService'
import { InputService, type ThingService } from '../../types'
import { outputList } from '~/cloud/customProtocol/components'
import { Dropdown } from '~/components/Dropdown'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/Tooltip'

export const serviceThingSchema = z.object({
  name: nameSchemaRegex,
  description: z.string(),
  input: z.array(
    z.object({
      name: z
        .string()
        .min(1, { message: 'Tên thuộc tính quá ngắn' })
        .max(30, { message: 'Tên thuộc tính quá dài' }),
      type: z.string().optional(),
      value: z.string(),
    }),
  ),
  output: z.enum([
    'json',
    'str',
    'i32',
    'i64',
    'f32',
    'f64',
    'bool',
    'time',
    'bin',
  ] as const),
})

export type CreateServiceForm = {
  name: string
  description: string
  output: string
  input: inputlist[]
  code: string
}

export interface dataRun {
  [key: string]: string
}

type CreateServiceProps = {
  thingServiceData?: ThingService[]
}

export function CreateThingService({ thingServiceData }: CreateServiceProps) {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()
  const params = useParams()
  const [typeInput, setTypeInput] = useState('')
  const [fullScreen, setFullScreen] = useState(false)

  const [codeInput, setCodeInput] = useState('')
  const [codeOutput, setCodeOutput] = useState('')
  const [viewMode, setViewMode] = useState('default')
  const [isShowConsole, setIsShowConsole] = useState(false)
  const thingId = params.thingId as string
  const { mutate: mutateService, isLoading: isLoadingService } =
    useCreateServiceThing()

  const {
    mutate: mutateExecuteService,
    data: executeService,
    isSuccess: isSuccessExecute,
    isLoading: isLoadingExecute,
    isError,
    error: errorExecute,
  } = useExecuteService()

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

  const handleFullScreen = () => {
    setFullScreen(!fullScreen)
    setViewMode('default')
    if (!fullScreen) {
      const elem = document.getElementById('create-service-screen')
      if (elem?.requestFullscreen) {
        elem.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

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
      mutateExecuteService({
        data: dataRun,
        thingId,
        projectId,
        name: data.name,
        isDebugMode: debugMode,
      })
    }
    if (typeInput === 'Submit') {
      mutateService({
        data: {
          name: data.name,
          description: data.description,
          output: data.output,
          input: dataInput,
          code: codeInput,
        },
        thingId: thingId,
      })
    }
  }

  const [debugMode, setDebugMode] = useState(true)

  const clearData = () => {
    setCodeInput('')
    setCodeOutput('')
    setFullScreen(false)
    setIsShowConsole(false)
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
    <FormDialog
      className="thing-service-popup"
      title={t('cloud:custom_protocol.service.create')}
      id="create-service-screen"
      isFullScreen={fullScreen}
      resetData={clearData}
      body={
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
              name: '',
              input: [{ name: '', value: '', type: 'json' }],
            },
          }}
          name={['input']}
        >
          {({ register, formState, getValues }, { fields, append, remove }) => {
            return (
              <div>
                <div className="mb-4 grid grow grid-cols-1 gap-x-4 md:grid-cols-2">
                  <InputField
                    require={true}
                    label={t('cloud:custom_protocol.service.name')}
                    error={formState.errors['name']}
                    registration={register('name')}
                  />
                  <SelectField
                    label={t(
                      'cloud:custom_protocol.service.service_input.type',
                    )}
                    require={true}
                    error={formState.errors['output']}
                    registration={register('output')}
                    options={outputList}
                  />
                </div>
                <div className={cn('grid grid-cols-1 gap-x-4 md:grid-cols-4')}>
                  <div className={'relative flex flex-col gap-2 md:col-span-1'}>
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
                      {fields.map((field, index) => {
                        return (
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
                                  require={true}
                                  label={t(
                                    'cloud:custom_protocol.service.service_input.name',
                                  )}
                                  error={
                                    formState.errors[`input`]?.[index]?.name
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
                                    formState.errors[`input`]?.[index]?.type
                                  }
                                  registration={register(
                                    `input.${index}.type` as const,
                                  )}
                                  options={outputList}
                                  className="h-9"
                                />
                              </div>
                              <InputField
                                label={t(
                                  'cloud:custom_protocol.service.service_input.value',
                                )}
                                error={
                                  formState.errors[`input`]?.[index]?.value
                                }
                                registration={register(
                                  `input.${index}.value` as const,
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              size="square"
                              variant="none"
                              className={cn('h-9 hover:bg-secondary-500', {
                                '!justify-center': fullScreen,
                              })}
                              onClick={() => remove(index)}
                              startIcon={
                                <img
                                  src={btnDeleteIcon}
                                  alt="Delete input"
                                  className={cn('h-10 w-10')}
                                />
                              }
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div
                      className="flex w-fit items-center"
                      onClick={() =>
                        append({
                          name: '',
                          type: 'json',
                          value: '',
                        })
                      }
                    >
                      <img
                        src={btnAddIcon}
                        alt="add-icon"
                        className="h-5 w-5 cursor-pointer"
                      />
                      <label className="ml-2 cursor-pointer">
                        {t('cloud:custom_protocol.service.add_other')}
                      </label>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <div className="mb-2">
                        <TextAreaField
                          label={t('cloud:custom_protocol.service.note')}
                          error={formState.errors['description']}
                          registration={register('description')}
                          rows={5}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          onCheckedChange={checked => setDebugMode(checked)}
                          defaultChecked
                        />
                        <p>{t('cloud:custom_protocol.service.debug')}</p>
                      </div>
                    </div>
                    <div className="mt-1.5 flex flex-col">
                      <div className="mb-1.5 flex items-center rounded-lg bg-secondary-400 px-4 py-2">
                        <div className="flex gap-3 ">
                          <p className="text-table-header">
                            {t('cloud:custom_protocol.service.list_service')}
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn('mt-0 overflow-auto', {
                          'max-h-44': !fullScreen,
                          'max-h-52': fullScreen,
                        })}
                      >
                        {thingServiceData?.map(item => {
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
                                            {item.input.map(
                                              (data: InputService) => {
                                                const type = outputList.filter(
                                                  item =>
                                                    item.value === data.type,
                                                )
                                                return (
                                                  <li className="mt-1.5 pl-2">
                                                    <span className="text-primary-400">
                                                      {data.name}
                                                    </span>
                                                    <span>
                                                      : {type[0].label}
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
                                          <span>{typeOutput[0].label}</span>
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
                  <div
                    className={cn(
                      'flex flex-col gap-2 ',
                      {
                        'grid grow grid-cols-1 gap-x-4 md:col-span-3 md:grid-cols-2':
                          !fullScreen,
                        'md:col-span-3': fullScreen,
                      },
                      { 'md:grid-cols-6': viewMode !== 'default' },
                    )}
                  >
                    <div
                      className={cn(
                        'flex flex-col gap-2 md:col-span-1',
                        {
                          'md:col-span-5':
                            viewMode === 'maximize_code' ||
                            viewMode === 'minimize_result',
                        },
                        { 'md:col-span-1': viewMode === 'minimize_code' },
                      )}
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
                                  onClick={() => {
                                    setViewMode('maximize_code')
                                  }}
                                >
                                  {t(
                                    'cloud:custom_protocol.service.maximize_result',
                                  )}
                                </div>
                                <div
                                  className="py-1 hover:cursor-pointer"
                                  onClick={() => {
                                    setViewMode('minimize_code')
                                  }}
                                >
                                  {t(
                                    'cloud:custom_protocol.service.minimize_result',
                                  )}
                                </div>
                                <div
                                  className="py-1 hover:cursor-pointer"
                                  onClick={() => {
                                    setViewMode('default')
                                  }}
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
                          <button form="create-serviceThing" type="submit">
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
                        isShowLog={isShowConsole}
                        value={codeInput}
                        className={`${fullScreen ? '' : '!block'}`}
                        setCodeInput={setCodeInput}
                        isFullScreen={fullScreen}
                        viewMode={viewMode}
                        editorName={'code'}
                      />
                    </div>
                    <div
                      className={cn(
                        'flex flex-col gap-2 md:col-span-1',
                        {
                          'md:col-span-5':
                            viewMode == 'maximize_result' ||
                            viewMode == 'minimize_code',
                        },
                        {
                          'md:col-span-1':
                            viewMode == 'minimize_result' ||
                            viewMode == 'maximize_code',
                        },
                      )}
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
                                  onClick={() => {
                                    setViewMode('maximize_result')
                                  }}
                                >
                                  {t(
                                    'cloud:custom_protocol.service.maximize_result',
                                  )}
                                </div>
                                <div
                                  className="py-1 hover:cursor-pointer"
                                  onClick={() => {
                                    setViewMode('minimize_result')
                                  }}
                                >
                                  {t(
                                    'cloud:custom_protocol.service.minimize_result',
                                  )}
                                </div>
                                <div
                                  className="py-1 hover:cursor-pointer"
                                  onClick={() => {
                                    setViewMode('default')
                                  }}
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
                        showRunButton={false}
                        setCodeInput={setCodeOutput}
                        isFullScreen={fullScreen}
                        viewMode={viewMode}
                        editorName={'result'}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-3">
                  <img
                    onClick={handleFullScreen}
                    src={btnFullScreen}
                    alt="fullscreen-create-service"
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>
              </div>
            )
          }}
        </FormMultipleFields>
      }
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      confirmButton={
        <Button
          isLoading={isLoadingService}
          form="create-serviceThing"
          type="submit"
          disabled={fullScreen}
          size="md"
          className="bg-primary-400"
          onClick={() => setTypeInput('Submit')}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
