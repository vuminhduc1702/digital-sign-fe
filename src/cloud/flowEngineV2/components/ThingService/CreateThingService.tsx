import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectField,
  TextAreaField,
  type SelectOption,
  FormMultipleFields,
} from '~/components/Form'
import { nameSchema } from '~/utils/schemaValidation'
import {
  CreateServiceThingDTO,
  inputlist,
  useCreateServiceThing,
} from '../../api/thingServiceAPI'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { CodeEditor } from '~/cloud/customProtocol/components'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'
import { useParams } from 'react-router-dom'

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
      value: z.string()
    }),
  ),
  // input: z.array(z.object({ name: z.string(), type: z.string() })).optional(),
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
  // code: z.string().optional(),
})

export type CreateServiceForm = {
  name: string
  description: string
  output: string
  input: inputlist[]
  code: string
}

export function CreateThingService() {
  const { t } = useTranslation()
  const params = useParams()
  const [typeInput, setTypeInput] = useState('')

  const [codeInput, setCodeInput] = useState('')
  const [thingType, setThingType] = useState('json')
  const thingId = params.thingId as string
  const {
    mutate: mutateService,
    isLoading: isLoadingService,
    isSuccess: isSuccessService,
  } = useCreateServiceThing()

  const handleSubmit = (data: CreateServiceForm) => {
    const dataInput = data.input.map(item => ({
      name: item.name,
      type: item.type
    }))
    if (typeInput === 'Run') {
      console.log(data, '============================Run')
    }
    if (typeInput === 'Submit') {
      mutateService({
        data: {
          name: 'test_service23456',
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
      isDone={isSuccessService}
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
              <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
                <div className="relative flex flex-col gap-2 md:col-span-1">
                  <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                    <div className="flex gap-3">
                      <p className="text-table-header">
                        {t('cloud:custom_protocol.service.input')}
                      </p>
                    </div>
                  </div>
                  <div className='max-h-52 overflow-auto'>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 gap-x-4 md:grid-cols-3"
                      >
                        <InputField
                          label={
                            t('cloud:custom_protocol.service.service_input.name')
                          }
                          error={
                            formState.errors[`input.${index}.name`]
                          }
                          registration={register(
                            `input.${index}.name` as const,
                          )}
                        />
                        <SelectField
                          label={t('cloud:custom_protocol.service.service_input.type')}
                          error={
                            formState.errors[`input.${index}.type`]
                          }
                          registration={register(`input.${index}.type` as const,)}
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
                          onChange={event =>
                            setThingType(String(event.target.value).toLowerCase())
                          }
                        />
                        <InputField
                          label={
                            t('cloud:custom_protocol.service.service_input.value')
                          }
                          error={formState.errors[`input.${index}.value`]}
                          registration={register(
                            `input.${index}.value` as const,
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <Button
                      size="md"
                      className="bg-primary-400 text-white"
                      onClick={() =>
                        append({
                          name: '',
                          type: 'json',
                          value: '',
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                  <div>
                    <InputField
                      label={t('cloud:custom_protocol.service.name')}
                      error={formState.errors['name']}
                      registration={register('name')}
                    />
                    <SelectField
                      label={t('cloud:custom_protocol.thing.type')}
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
                      isLoading={isLoadingService}
                      form="create-serviceThing"
                      type="submit"
                      onClick={() =>
                        setTypeInput('Run')
                      }
                      size="md"
                      className="absolute bottom-0 bg-primary-400 text-white"
                    >
                      Run
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                    <div className="flex gap-3">
                      <p className="text-table-header">
                        {t('cloud:custom_protocol.service.code')}
                      </p>
                    </div>
                  </div>
                  <CodeEditor setCodeInput={setCodeInput} />
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                    <div className="flex gap-3">
                      <p className="text-table-header">
                        {t('cloud:custom_protocol.service.output')}
                      </p>
                    </div>
                  </div>
                  <CodeEditor setCodeInput={setCodeInput} readOnly={true} />
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
          size="md"
          className="bg-primary-400"
          onClick={() =>
            setTypeInput('Submit')
          }
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
