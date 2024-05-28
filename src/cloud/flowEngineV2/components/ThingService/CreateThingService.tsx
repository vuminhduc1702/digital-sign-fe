import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import * as z from 'zod'

import { CodeSandboxEditor } from '@/cloud/customProtocol/components/CodeSandboxEditor'
import { outputList } from '@/cloud/customProtocol/components/CreateService'
import { FormDialog } from '@/components/FormDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/utils/misc'
import { nameSchemaRegex } from '@/utils/schemaValidation'
import storage from '@/utils/storage'
import {
  useCreateServiceThing,
  type CreateServiceThingDTO,
} from '../../api/thingServiceAPI'
import { useExecuteService } from '../../api/thingServiceAPI/executeService'
import { type InputService, type ThingService } from '../../types'

import btnAddIcon from '@/assets/icons/btn-add.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnFullScreen from '@/assets/icons/btn-fullscreen.svg'
import btnRunCode from '@/assets/icons/btn-run-code.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LuChevronDown } from 'react-icons/lu'
import { type ImperativePanelHandle } from 'react-resizable-panels'

export const inputSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Tên biến quá ngắn' })
    .max(64, { message: 'Tên biến quá dài' }),
  type: z.string(),
  value: z.string().optional().or(z.boolean()),
})
export const inputListSchema = z.array(inputSchema)

export const serviceThingSchema = z.object({
  name: nameSchemaRegex,
  description: z.string().optional(),
  input: inputListSchema,
  output: z.enum(['json', 'str', 'i32', 'i64', 'f32', 'f64', 'bool'] as const),
  fail_limit: z.number().optional(),
  lock_time: z.string().optional(),
  code: z.string().optional(),
})

export interface dataRun {
  [key: string]: string
}

type CreateServiceProps = {
  thingServiceData?: ThingService[]
}

export const numberServiceInput = ['i32', 'i64', 'f32', 'f64']

const defaultJSType = [
  'string',
  'number',
  'bigint',
  'boolean',
  'undefined',
  'null',
  'symbol',
  'object',
]

export const PANEL_SIZE = {
  MAX: 'max',
  MIN: 'min',
  DEFAULT: 'default',
}

export function CreateThingService({ thingServiceData }: CreateServiceProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const params = useParams()
  const [typeInput, setTypeInput] = useState('')
  const [fullScreen, setFullScreen] = useState(false)

  const [codeInput, setCodeInput] = useState('')
  const [codeOutput, setCodeOutput] = useState('')
  const [, setInputTypeValue] = useState('')
  const [isShowConsole, setIsShowConsole] = useState(false)
  const thingId = params.thingId as string
  const {
    mutate: mutateService,
    isLoading: isLoadingService,
    isSuccess: isSuccessService,
  } = useCreateServiceThing()
  const codeEditorRef = useRef<ImperativePanelHandle>(null)
  const resultEditorRef = useRef<ImperativePanelHandle>(null)

  const {
    mutate: mutateExecuteService,
    data: executeService,
    isSuccess: isSuccessExecute,
    isLoading: isLoadingExecute,
    isError,
    error: errorExecute,
  } = useExecuteService()

  const form = useForm<CreateServiceThingDTO['data']>({
    resolver: serviceThingSchema && zodResolver(serviceThingSchema),
    defaultValues: {
      name: '',
      input: [{ name: '', value: '', type: 'json' }],
      fail_limit: 0,
    },
  })

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState,
    reset,
    register,
    setError,
  } = form

  const { fields, append, remove } = useFieldArray({
    name: 'input',
    control,
  })

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

  const handleFullScreen = () => {
    setFullScreen(!fullScreen)
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

  const [debugMode, setDebugMode] = useState(true)

  const clearData = () => {
    reset()
    setCodeInput('')
    setCodeOutput('')
    setFullScreen(false)
    setIsShowConsole(false)
    setInputTypeValue('')
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
    <FormDialog
      className="thing-service-popup"
      title={t('cloud:custom_protocol.service.create')}
      isDone={isSuccessService}
      id="create-service-screen"
      isFullScreen={fullScreen}
      resetData={clearData}
      body={
        <Form {...form}>
          <form
            id="create-serviceThing"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              const dataInput = values.input.map(item => ({
                name: item.name,
                type: item.type,
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
                mutateService({
                  data: {
                    name: values.name,
                    description: values.description,
                    output: values.output,
                    input: dataInput,
                    code: codeInput,
                    fail_limit: values.fail_limit,
                    lock_time: values.lock_time ? values.lock_time : '0s',
                  },
                  thingId: thingId,
                })
              }
            })}
          >
            <div>
              <div className="mb-4 grid grow grid-cols-1 gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:custom_protocol.service.name')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            onChange={e => {
                              if (defaultJSType.includes(e.target.value)) {
                                setError('name', {
                                  message: t(
                                    'cloud:custom_protocol.service.service_input.name_error',
                                  ),
                                })
                              } else {
                                setError('name', { message: '' })
                              }
                              onChange(e)
                            }}
                            value={value}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="output"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:custom_protocol.service.service_input.type')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={onChange}
                            value={value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('placeholder:select')}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {outputList.map(option => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fail_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:custom_protocol.service.fail_limit')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            {...register(`fail_limit`, {
                              valueAsNumber: true,
                              onChange: e => {
                                if (e.target.value === '0') {
                                  setValue('lock_time', undefined)
                                }
                              },
                            })}
                            type="number"
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {watch('fail_limit') > 0 ? (
                  <FormField
                    control={form.control}
                    name="lock_time"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:custom_protocol.service.lock_time')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              onChange={e => {
                                const regexOnlyAcceptNumber = /^\d+$/
                                let temp
                                if (
                                  regexOnlyAcceptNumber.test(e.target.value)
                                ) {
                                  temp = e.target.value
                                } else {
                                  temp = e.target.value.replace(/[^0-9]/g, '')
                                }
                                temp += 's'
                                if (temp === 's') {
                                  temp = '0s'
                                }

                                setValue('lock_time', temp)
                                onChange(temp)
                              }}
                              value={value}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                ) : null}
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
                          className={cn(
                            'flex items-center border-0 border-b border-solid border-inherit py-3 first:pt-0',
                            {
                              'justify-between': fullScreen,
                            },
                          )}
                        >
                          <div
                            key={field.id}
                            className={cn(
                              'grid w-full grid-cols-1 gap-x-4 gap-y-2 pr-2',
                            )}
                          >
                            <div className="flex gap-x-2">
                              <FormField
                                control={form.control}
                                name={`input.${index}.name`}
                                render={({ field }) => (
                                  <FormItem className="w-1/2">
                                    <FormLabel>
                                      {t(
                                        'cloud:custom_protocol.service.service_input.name',
                                      )}
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
                                name={`input.${index}.type`}
                                render={({
                                  field: { onChange, value, ...field },
                                }) => (
                                  <FormItem className="w-1/2">
                                    <FormLabel>
                                      {t(
                                        'cloud:custom_protocol.service.service_input.type',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Select
                                          {...field}
                                          onValueChange={e => {
                                            onChange(e)
                                            setInputTypeValue(e)
                                            if (e === 'bool') {
                                              setValue(
                                                `input.${index}.value`,
                                                true,
                                              )
                                            } else {
                                              setValue(
                                                `input.${index}.value`,
                                                '',
                                              )
                                            }
                                          }}
                                          value={value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue
                                                placeholder={t(
                                                  'placeholder:select',
                                                )}
                                              />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {outputList.map(option => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                            {watch(`input.${index}.type`) === 'bool' ? (
                              <div className="flex items-center">
                                <FormField
                                  control={form.control}
                                  name={`input.${index}.value`}
                                  render={({
                                    field: { onChange, value, ...field },
                                  }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {t(
                                          'cloud:custom_protocol.service.service_input.value',
                                        )}
                                      </FormLabel>
                                      <div>
                                        <FormControl>
                                          <Checkbox
                                            {...field}
                                            checked={value as boolean}
                                            onCheckedChange={onChange}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </div>
                                    </FormItem>
                                  )}
                                />
                                <span className="pl-3 pt-6">True</span>
                              </div>
                            ) : (
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
                                          type={
                                            numberServiceInput.includes(
                                              watch(
                                                `input.${index}.type`,
                                              ) as string,
                                            )
                                              ? 'number'
                                              : 'text'
                                          }
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            )}
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
                      className="h-5 w-5 cursor-pointer"
                    />
                    <label className="ml-2 cursor-pointer">
                      {t('cloud:custom_protocol.service.add_other')}
                    </label>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <div className="mb-2">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:custom_protocol.service.note')}
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
                        'max-h-52': !fullScreen,
                        'max-h-96': fullScreen,
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

                <ResizablePanelGroup
                  direction="horizontal"
                  className={cn('flex w-full md:col-span-3', {
                    'flex-col': fullScreen,
                  })}
                >
                  <ResizablePanel
                    defaultSize={50}
                    minSize={fullScreen ? 13 : 20.5}
                    className={cn('flex w-full flex-col gap-2 md:col-span-1')}
                    ref={codeEditorRef}
                  >
                    <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                      <div className="flex gap-3">
                        <p className="text-table-header">
                          {t('cloud:custom_protocol.service.code')}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <LuChevronDown className="h-5 w-5 text-secondary-700 hover:text-primary-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="z-[9999] flex flex-col overflow-y-auto rounded-md bg-white p-2 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade">
                            <DropdownMenuItem
                              className="py-1"
                              onClick={() => {
                                resizePanel(codeEditorRef, PANEL_SIZE.MAX)
                              }}
                            >
                              {t(
                                'cloud:custom_protocol.service.maximize_result',
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="py-1"
                              onClick={() => {
                                resizePanel(codeEditorRef, PANEL_SIZE.MIN)
                              }}
                            >
                              {t(
                                'cloud:custom_protocol.service.minimize_result',
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="py-1"
                              onClick={() => {
                                resizePanel(codeEditorRef, PANEL_SIZE.DEFAULT)
                              }}
                            >
                              {t(
                                'cloud:custom_protocol.service.default_result',
                              )}
                            </DropdownMenuItem>
                            {isShowConsole ? (
                              <DropdownMenuItem
                                className="py-1 hover:cursor-pointer"
                                onClick={() => setIsShowConsole(false)}
                              >
                                {t(
                                  'cloud:custom_protocol.service.hide_console',
                                )}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="py-1 hover:cursor-pointer"
                                onClick={() => setIsShowConsole(true)}
                              >
                                {t(
                                  'cloud:custom_protocol.service.view_console',
                                )}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      className="!block"
                      setCodeInput={setCodeInput}
                      isFullScreen={fullScreen}
                    />
                  </ResizablePanel>
                  <ResizableHandle className="w-2" withHandle />
                  <ResizablePanel
                    defaultSize={50}
                    minSize={fullScreen ? 10.5 : 16.5}
                    className={cn('flex w-full flex-col gap-2 md:col-span-1')}
                    ref={resultEditorRef}
                  >
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                      <div className="flex gap-3">
                        <p className="truncate text-table-header">
                          {t('cloud:custom_protocol.service.output')}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <LuChevronDown className="h-5 w-5 text-secondary-700 hover:text-primary-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="z-[9999] flex flex-col overflow-y-auto rounded-md bg-white p-2 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade">
                            <DropdownMenuItem
                              className="py-1"
                              onClick={() => {
                                resizePanel(resultEditorRef, PANEL_SIZE.MAX)
                              }}
                            >
                              {t(
                                'cloud:custom_protocol.service.maximize_result',
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="py-1"
                              onClick={() => {
                                resizePanel(resultEditorRef, PANEL_SIZE.MIN)
                              }}
                            >
                              {t(
                                'cloud:custom_protocol.service.minimize_result',
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="py-1"
                              onClick={() => {
                                resizePanel(resultEditorRef, PANEL_SIZE.DEFAULT)
                              }}
                            >
                              {t(
                                'cloud:custom_protocol.service.default_result',
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CodeSandboxEditor
                      value={codeOutput}
                      readOnly={true}
                      showRunButton={false}
                      setCodeInput={setCodeOutput}
                      isFullScreen={fullScreen}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
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
          </form>
        </Form>
      }
      triggerButton={
        <Button className="h-[38px] rounded border-none">
          {t('cloud:custom_protocol.service.button')}
        </Button>
      }
      confirmButton={
        <Button
          isLoading={isLoadingService}
          form="create-serviceThing"
          type="submit"
          disabled={fullScreen || isLoadingService}
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
