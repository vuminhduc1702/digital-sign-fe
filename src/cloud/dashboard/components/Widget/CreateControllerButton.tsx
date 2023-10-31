import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import ColorPicker from 'react-pick-color'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import i18n from '~/i18n'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  Form,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
  type SelectOptionGeneric,
  type SelectOptionString,
} from '~/components/Form'
import { useGetDevices } from '~/cloud/orgManagement/api/deviceAPI'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { cn, flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useCreateAttrChart } from '../../api'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { Calendar } from '~/components/Calendar'
import { useGetOrgs } from '~/layout/MainLayout/api'
import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { widgetAgg, wsInterval } from '../../routes/DashboardDetail'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '~/components/Command'

import { aggSchema, type WidgetType } from '../../types'
import { nameSchema } from '~/utils/schemaValidation'

import { Calendar as CalendarIcon } from 'lucide-react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '~/components/SVGIcons'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { type EntityThingList } from '~/cloud/customProtocol'
import { type BasePagination } from '~/types'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { queryClient } from '~/lib/react-query'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { type Widget } from './CreateWidget'

export const controllerBtnCreateSchema = z.object({
  title: z.string(),
  thing_id: z.string(),
  handle_service: z.string(),
  input: z.record(z.string(), z.any()),
})

type ControllerBtnCreateDTO = {
  data: z.infer<typeof controllerBtnCreateSchema> & { id: string }
}

type CreateControllerButtonProps = {
  isOpen: boolean
  close: () => void
  widgetListRef: React.MutableRefObject<Widget>
  setWidgetList: React.Dispatch<React.SetStateAction<Widget>>
}

export function CreateControllerButton({
  isOpen,
  close,
  widgetListRef,
  setWidgetList,
}: CreateControllerButtonProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  const { id: projectId } = storage.getProject()

  const {
    data: thingData,
    isLoading: thingIsLoading,
    refetch: refetchThingData,
  } = useGetEntityThings({
    projectId,
    config: { enabled: false },
  })
  const thingListCache:
    | ({ data: EntityThingList } & BasePagination)
    | undefined = queryClient.getQueryData(['entity-things'], { exact: false })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  })) || [{ value: '', label: '' }]

  const [selectedThingId, setSelectedThingId] = useState('')
  const { data: serviceData } = useGetServiceThings({
    thingId: selectedThingId,
    config: {
      enabled: !!selectedThingId,
      suspense: false,
    },
  })

  useEffect(() => {
    if (selectedThingId != '') {
      setSelectedThingId('')
    }
  }, [])

  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  })) || [{ value: '', label: '' }]

  const [optionThingId, setOptionThingId] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [optionThingService, setOptionService] = useState<SelectOption>({
    label: '',
    value: '',
  })

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:w-[75rem]">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:dashboard.config_chart.title')}
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

          <Form<
            ControllerBtnCreateDTO['data'],
            typeof controllerBtnCreateSchema
          >
            id="create-widget"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              // console.log('values: ', values)
              const widget: z.infer<typeof widgetSchema> = {}

              widgetListRef.current[widgetId] = widget
              setWidgetList(widgetListRef.current)

              close()
            })}
            schema={controllerBtnCreateSchema}
          >
            {({ register, formState, control, setValue }) => {
              return (
                <>
                  {thingIsLoading ? (
                    <div className="flex grow items-center justify-center">
                      <Spinner showSpinner size="xl" />
                    </div>
                  ) : (
                    <>
                      <TitleBar
                        title={t('cloud:dashboard.config_chart.show')}
                        className="w-full rounded-md bg-secondary-700 pl-3"
                      />
                      <div className="grid grid-cols-1 gap-x-4 px-2 md:grid-cols-5">
                        <InputField
                          label={t('cloud:dashboard.config_chart.name')}
                          error={formState.errors['title']}
                          registration={register('title')}
                          placeholder={t('cloud:dashboard.config_chart.name')}
                        />
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
                            label={t('cloud:custom_protocol.thing.id')}
                            name="thing_id"
                            control={control}
                            options={
                              thingData
                                ? thingSelectData
                                : [
                                    {
                                      label: t('loading:entity_thing'),
                                      value: '',
                                    },
                                  ]
                            }
                            isOptionDisabled={option =>
                              option.label === t('loading:entity_thing')
                            }
                            noOptionsMessage={() => t('table:no_thing')}
                            onMenuOpen={() => {
                              if (thingListCache?.data.list) {
                                return
                              } else refetchThingData()
                            }}
                            placeholder={t(
                              'cloud:custom_protocol.thing.choose',
                            )}
                            onChange={e => {
                              setSelectedThingId(e?.value)
                              setOptionThingId(e)
                              setValue('thing_id', e?.value)
                            }}
                            value={optionThingId}
                            // defaultValue={defaultThingValues}
                          />
                          <p className="text-body-sm text-primary-400">
                            {formState?.errors?.thing_id?.message}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
                            label={t('cloud:custom_protocol.service.title')}
                            inputId="handleServiceForm"
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
                            placeholder={t(
                              'cloud:custom_protocol.service.choose',
                            )}
                            onChange={e => {
                              setOptionService(e)
                              setValue('handle_service', e?.value)
                            }}
                            value={optionThingService}
                          />
                          <p className="text-body-sm text-primary-400">
                            {formState?.errors?.handle_service?.message}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )
            }}
          </Form>
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
              form="create-widget"
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
