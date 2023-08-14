import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

import { Button } from '~/components/Button'
import { Form, FormMultipleFields, InputField, SelectField, TextAreaField } from '~/components/Form'
import { useUpdateThing, type UpdateThingDTO } from '../../api/thingAPI'

import { XMarkIcon } from '@heroicons/react/24/outline'
import * as z from 'zod'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { nameSchema } from '~/utils/schemaValidation'
import { CreateServiceThingDTO, useCreateServiceThing, useUpdateService } from '../../api/thingServiceAPI'
import { CodeEditor } from '~/cloud/customProtocol/components'
import { CreateServiceForm, dataRun, serviceThingSchema } from './CreateThingService'
import { Tab } from '@headlessui/react'
import { useParams } from 'react-router-dom'
import { useThingServiceById } from '../../api/thingServiceAPI/getThingServiceById'
import { da } from 'date-fns/locale'
import { useExecuteService } from '../../api/thingServiceAPI/executeService'
import storage from '~/utils/storage'
import btnAddIcon from '~/assets/icons/btn-add.svg'

export const updateThingSchema = z.object({
  name: nameSchema,
  description: z.string(),
})

type UpdateThingProps = {
  name: string
  close: () => void
  isOpen: boolean
}
export function UpdateThingService({
  name,
  close,
  isOpen,
}: UpdateThingProps) {
  const { t } = useTranslation()
  const params = useParams()
  const thingId = params.thingId as string
  const cancelButtonRef = useRef(null)
  const [typeInput, setTypeInput] = useState('')

  const { data: thingServiceData } = useThingServiceById({ thingId, name })

  const [codeInput, setCodeInput] = useState(thingServiceData?.data.code || '')
  const [codeOutput, setCodeOutput] = useState('')

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useUpdateService()
  const {
    mutate: mutateExcuteService,
    data: executeService,
    isSuccess: isSuccessExecute,
  } = useExecuteService()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    if (executeService?.message === 'success') {
      console.log('dataaa', executeService?.data)
      setCodeOutput(executeService?.data)
    }


  }, [isSuccessExecute])

  const handleSubmit = (data: CreateServiceForm) => {
    const dataInput = data.input.map(item => ({
      name: item.name,
      type: item.type
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
        name: data.name
      })

    }
    if (typeInput === 'Submit') {
      const dataSendBE = {
        name: data.name,
        description: data.description,
        output: data.output,
        input: dataInput,
        code: codeInput,
      }
      mutate({
        data: {
          name: data.name,
          description: data.description,
          output: data.output,
          input: dataInput,
          code: codeInput,
        },
        thingId: thingId,
        name: data.name
      })
    }

  }

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="thing-service-popup inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:custom_protocol.service.edit')}
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
            <Tab.List className="flex items-center justify-between bg-secondary-400 px-10">
              <Tab
                className={({ selected }) =>
                  clsx(
                    'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none flex cursor-pointer gap-2',
                    { 'text-primary-400': selected },
                  )
                }
              >
                <div className="flex items-center gap-x-2">
                  <p>
                    {t('cloud:custom_protocol.service.infor')}
                  </p>
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none flex cursor-pointer gap-2',
                    { 'text-primary-400': selected },
                  )
                }
              >
                <div className="flex items-center gap-x-2">
                  <p>
                    {t('cloud:custom_protocol.service.tab_2')}
                  </p>
                </div>
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-2 flex grow flex-col">
              <Tab.Panel
                className={clsx('flex grow flex-col bg-white focus:outline-none')}
              >
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
                      description: thingServiceData?.data.description || ''
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
                                // onChange={event =>
                                //   setThingType(String(event.target.value).toLowerCase())
                                // }
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
                          <div className='flex items-center'>
                            <img onClick={() =>
                              append({
                                name: '',
                                type: 'json',
                                value: '',
                              })
                            } src={btnAddIcon} className="h-5 w-5 cursor-pointer" />
                            <span className='ml-2'>{t('cloud:custom_protocol.service.add_other')}</span>
                          </div>
                          <div>
                            <InputField
                              label={t('cloud:custom_protocol.service.name')}
                              error={formState.errors['name']}
                              registration={register('name')}
                              disabled={true}
                            />
                            <SelectField
                              label={t('cloud:custom_protocol.service.service_input.type')}
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
                              isLoading={isLoading}
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
                          <CodeEditor defaultValue={codeInput} setCodeInput={setCodeInput} />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-1">
                          <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                            <div className="flex gap-3">
                              <p className="text-table-header">
                                {t('cloud:custom_protocol.service.output')}
                              </p>
                            </div>
                          </div>
                          <CodeEditor defaultValue={codeOutput} setCodeInput={setCodeOutput} readOnly={true} />
                        </div>

                      </div>
                    )

                  }}
                </FormMultipleFields>
              </Tab.Panel>
              <Tab.Panel
                className={clsx('flex grow flex-col bg-white focus:outline-none')}
              >
                <div className="flex grow flex-col px-9 py-3 shadow-lg">
                  Hahaahahaha
                </div>
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
            onClick={() =>
              setTypeInput('Submit')
            }
            size="md"
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          >
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
