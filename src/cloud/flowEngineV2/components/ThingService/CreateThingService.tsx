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
import { nameSchema } from '~/utils/schemaValidation'
import {
  useCreateServiceThing,
  type CreateServiceThingDTO,
  type inputlist,
} from '../../api/thingServiceAPI'

import { useParams } from 'react-router-dom'
import btnAddIcon from '~/assets/icons/btn-add.svg'
import btnFullScreen from '~/assets/icons/btn-fullscreen.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { CodeEditor } from '~/cloud/customProtocol/components'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'
import storage from '~/utils/storage'
import { useExecuteService } from '../../api/thingServiceAPI/executeService'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const serviceThingSchema = z.object({
  name: nameSchema,
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

export function CreateThingService() {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()
  const params = useParams()
  const [typeInput, setTypeInput] = useState('')
  const [fullScreen, setFullScreen] = useState(false)

  const [codeInput, setCodeInput] = useState('')
  const [codeOutput, setCodeOutput] = useState('')
  const thingId = params.thingId as string
  const { mutate: mutateService, isLoading: isLoadingService } =
    useCreateServiceThing()

  const {
    mutate: mutateExcuteService,
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

  return (
    <FormDialog
      className="thing-service-popup"
      title={t('cloud:custom_protocol.service.create')}
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
          {({ register, formState }, { fields, append, remove }) => {
            return (
              <div
                className={`grid grow grid-cols-1 gap-x-4 ${fullScreen ? 'md:grid-cols-1' : ' md:grid-cols-3'
                  }`}
              >
                <div
                  className={
                    !fullScreen
                      ? 'relative flex flex-col gap-2 md:col-span-1'
                      : 'hidden'
                  }
                >
                  <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                    <div className="flex gap-3">
                      <p className="text-table-header">
                        {t('cloud:custom_protocol.service.input')}
                      </p>
                    </div>
                  </div>
                  <div className="max-h-52 overflow-auto">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex">
                        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
                          <InputField
                            label={t(
                              'cloud:custom_protocol.service.service_input.name',
                            )}
                            error={formState.errors[`input.${index}.name`]}
                            registration={register(
                              `input.${index}.name` as const,
                            )}
                          />
                          <SelectField
                            label={t(
                              'cloud:custom_protocol.service.service_input.type',
                            )}
                            error={formState.errors[`input.${index}.type`]}
                            registration={register(
                              `input.${index}.type` as const,
                            )}
                            options={[
                              {
                                label: t('cloud:custom_protocol.service.json'),
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
                                label: t('cloud:custom_protocol.service.bool'),
                                value: 'bool',
                              },
                              {
                                label: t('cloud:custom_protocol.service.time'),
                                value: 'time',
                              },
                              {
                                label: t('cloud:custom_protocol.service.bin'),
                                value: 'bin',
                              },
                            ]}
                          />
                          <InputField
                            label={t(
                              'cloud:custom_protocol.service.service_input.value',
                            )}
                            error={formState.errors[`input.${index}.value`]}
                            registration={register(
                              `input.${index}.value` as const,
                            )}
                          />
                        </div>
                        <XMarkIcon
                          onClick={() => remove(index)}
                          className="h-6 w-6 cursor-pointer"
                          aria-hidden="true"
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
                  <div>
                    <InputField
                      label={t('cloud:custom_protocol.service.name')}
                      error={formState.errors['name']}
                      registration={register('name')}
                    />
                    <SelectField
                      label={t(
                        'cloud:custom_protocol.service.service_input.type',
                      )}
                      error={formState.errors['output']}
                      registration={register('output')}
                      options={[
                        {
                          label: t('cloud:custom_protocol.service.json'),
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
                          label: t('cloud:custom_protocol.service.bool'),
                          value: 'bool',
                        },
                        {
                          label: t('cloud:custom_protocol.service.time'),
                          value: 'time',
                        },
                        {
                          label: t('cloud:custom_protocol.service.bin'),
                          value: 'bin',
                        },
                      ]}
                    />
                    <TextAreaField
                      className="mb-2"
                      label={t('cloud:custom_protocol.service.note')}
                      error={formState.errors['description']}
                      registration={register('description')}
                    />
                    <Button
                      isLoading={isLoadingExecute}
                      form="create-serviceThing"
                      type="submit"
                      onClick={() => setTypeInput('Run')}
                      size="md"
                      className="absolute bottom-0 bg-primary-400 text-white"
                    >
                      Run
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                    <div className="flex gap-3">
                      <p className="text-table-header">
                        {t('cloud:custom_protocol.service.code')}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <img
                        onClick={() => setFullScreen(!fullScreen)}
                        src={btnFullScreen}
                        alt="add-icon"
                        className="h-5 w-5 cursor-pointer"
                      />
                    </div>
                  </div>
                  <CodeEditor setCodeInput={setCodeInput} />
                </div>
                <div
                  className={
                    !fullScreen ? 'flex flex-col gap-2 md:col-span-1' : 'hidden'
                  }
                >
                  <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                    <div className="flex gap-3">
                      <p className="text-table-header">
                        {t('cloud:custom_protocol.service.output')}
                      </p>
                    </div>
                  </div>
                  <CodeEditor
                    defaultValue={codeOutput}
                    setCodeInput={setCodeOutput}
                    readOnly={true}
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
