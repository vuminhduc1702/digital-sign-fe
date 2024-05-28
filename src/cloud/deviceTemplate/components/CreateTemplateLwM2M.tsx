import { InputField, type SelectOption } from '@/components/Form'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AttrList, nameSchema } from '@/utils/schemaValidation'
import storage from '@/utils/storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type SelectInstance } from 'react-select'
import * as z from 'zod'
import { useCreateTemplate, type CreateTemplateDTO } from '../api'
import { useGetXMLdata } from '../api/getXMLdata'
import {
  type AttrLwM2MList,
  type LWM2MResponse,
  type ModuleConfig,
  type TransportConfigAttribute,
} from '../types'
import { LWM2MData } from '../types/lwm2mXML'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { LuChevronDown } from 'react-icons/lu'

import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '@/cloud/customProtocol/api/serviceThing'
import { CreateService } from '@/cloud/customProtocol/components/CreateService'
import { CreateThing } from '@/cloud/flowEngineV2/components/Attributes'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import { valueTypeList } from '@/cloud/orgManagement/components/Attributes'
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
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'

type AccordionStates = {
  [key: number]: ModuleConfig[]
}
type CheckboxStates = {
  [key: string]: boolean
}
type ItemNames = {
  [key: string]: string
}

export const templateAttrSchema = z.object({
  name: nameSchema,
  // rule_chain_id: z.string().optional(),
  thing_id: z.string().optional(),
  handle_msg_svc: z.string().optional(),
})

const LwM2MSelectOptions = LWM2MData.infos.map(item => ({
  label: `${item.module_name} #${item.file_id}_${item.version}`,
  value: `${item.file_id}`,
}))

type CreateTemplateLwM2MProps = {
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export function CreateTemplateLwM2M({
  open,
  close,
  isOpen,
}: CreateTemplateLwM2MProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id

  const {
    mutateAsync: mutateAsyncCreateTemplatelwm2m,
    isLoading: isLoadingCreateTemplatelwm2m,
    isSuccess: isSuccessCreateTemplatelwm2m,
  } = useCreateTemplate()

  const form = useForm<CreateTemplateDTO['data']>({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
  })

  const {
    register,
    formState,
    handleSubmit,
    control,
    watch,
    reset,
    getValues,
  } = form

  const { data: thingData, isLoading: AdapterIsLoading } = useGetEntityThings({
    projectId,
    type: 'thing',
  })

  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))
  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceThings({
      thingId: getValues('thing_id'),
      config: {
        enabled: !!getValues('thing_id'),
      },
    })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))
  const selectDropdownServiceRef = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  function formatString(str: string) {
    const lowercasedStr = str.toLowerCase()
    const formattedStr = lowercasedStr.replace(/[\s_]+/g, '')
    return formattedStr
  }
  const [openAccordion] = useState()
  const [accordionStates, setAccordionStates] = useState<AccordionStates>({})
  const [selectAllAttributes, setSelectAllAttributes] =
    useState<CheckboxStates>({})
  const [checkboxStates, setCheckboxStates] = useState<CheckboxStates>({})
  const [configData, setConfigData] = useState({})
  const [AttrData, setAttrData] = useState()
  const [itemNames, setItemNames] = useState<ItemNames>({})
  const { data: XMLData } = useGetXMLdata({
    fileId: watch('rule_chain_id')?.[watch('rule_chain_id')?.length - 1] ?? '',
  })
  const XMLDataRef = useRef<LWM2MResponse[]>([])
  const [filterLWM2M, setFilterLWM2M] = useState<LWM2MResponse[]>([])
  useEffect(() => {
    if (
      XMLData != null &&
      !XMLDataRef.current.some(
        item => item.LWM2M.Object.ObjectID === XMLData.LWM2M.Object.ObjectID,
      )
    ) {
      XMLDataRef.current = [...XMLDataRef.current, XMLData]
    }
    if (XMLDataRef.current.length > 0 && watch('rule_chain_id') != null) {
      const sortedData = XMLDataRef.current.sort((a, b) => {
        const indexA = watch('rule_chain_id').indexOf(a.LWM2M.Object.ObjectID)
        const indexB = watch('rule_chain_id').indexOf(b.LWM2M.Object.ObjectID)
        return indexA - indexB
      })
      const filterArr = sortedData.filter(item =>
        watch('rule_chain_id').includes(item.LWM2M.Object.ObjectID),
      )
      setFilterLWM2M(Array.from(new Set(filterArr)))
      const filteredKeys = Object.keys(checkboxStates).filter(key => {
        const objectId = parseInt(key.split('/')[1], 10)
        return watch('rule_chain_id').includes(objectId.toString())
      })
      const filteredCheckboxStates = filteredKeys.reduce((acc, key) => {
        acc[key] = checkboxStates[key]
        return acc
      }, {} as CheckboxStates)
      setCheckboxStates(filteredCheckboxStates)
      const filteredallKeys = Object.keys(selectAllAttributes).filter(key => {
        const objectId = parseInt(key, 10)
        return watch('rule_chain_id').includes(objectId.toString())
      })
      const filteredselectAllAttributes = filteredallKeys.reduce((acc, key) => {
        acc[key] = selectAllAttributes[key]
        return acc
      }, {} as CheckboxStates)
      setSelectAllAttributes(filteredselectAllAttributes)
      const filteredAccordionStates: AccordionStates = {}
      Object.keys(accordionStates).forEach(key => {
        filteredAccordionStates[key] = accordionStates[key].filter(obj =>
          watch('rule_chain_id').includes(obj.id.toString()),
        )
      })
      setAccordionStates(filteredAccordionStates)
    }
  }, [XMLData, watch('rule_chain_id')])
  const countTrueValuesForId = (
    checkboxStates: Record<string, boolean>,
    idToCount: string,
  ): number => {
    const extractIdFromKey = (key: string): number | null => {
      const idString = key.match(/\/(\d+)\/\d+\/\d+/)?.[1]
      return idString ? parseInt(idString, 10) : null
    }
    const id = parseInt(idToCount, 10)
    const trueValues = Object.entries(checkboxStates).filter(
      ([key, value]) => extractIdFromKey(key) === id && value === true,
    )
    return trueValues.length
  }
  const handleAccordionChange = (accordionIndex: number) => {
    setAccordionStates(prevStates => {
      const newStates = { ...prevStates }
      if (newStates[accordionIndex]) {
        newStates[accordionIndex] = []
      }
      return newStates
    })
  }
  const handleCheckboxChange = (
    accordionIndex: number,
    module: ModuleConfig,
    item: TransportConfigAttribute,
    attributesitem: AttrLwM2MList,
    totalItemCount: number,
  ) => {
    setAccordionStates(prevStates => {
      const newStates = { ...prevStates }
      if (!newStates[accordionIndex]) {
        newStates[accordionIndex] = []
      }
      const moduleId = module.id
      setCheckboxStates(prevCheckboxStates => {
        const updatedCheckboxStates = { ...prevCheckboxStates }
        const moduleIndex = newStates[accordionIndex].findIndex(
          obj => obj.id === moduleId,
        )
        if (moduleIndex === -1) {
          const currentTimestamp = Date.now()
          const attributesCount = countTrueValuesForId(
            updatedCheckboxStates,
            module.id.toString(),
          )
          const allCheckbox = attributesCount === totalItemCount
          newStates[accordionIndex].push({
            id: module.id,
            module_name: module.module_name,
            attribute_info: [item],
            attributes: [attributesitem],
            numberOfAttributes: attributesCount,
            last_update_ts: currentTimestamp,
            allcheckbox: allCheckbox,
          })
        } else {
          const attributeIndex = newStates[accordionIndex][
            moduleIndex
          ].attribute_info.findIndex(attribute => attribute.id === item.id)
          if (
            attributeIndex === -1 &&
            updatedCheckboxStates[item.id] === true
          ) {
            newStates[accordionIndex][moduleIndex].attribute_info.push(item)
            newStates[accordionIndex][moduleIndex].attributes.push(
              attributesitem,
            )
          }
          if (updatedCheckboxStates[item.id] === false) {
            newStates[accordionIndex][moduleIndex].attribute_info.splice(
              attributeIndex,
              1,
            )
            newStates[accordionIndex][moduleIndex].attributes.splice(
              attributeIndex,
              1,
            )
          }
          const attributesCount = countTrueValuesForId(
            prevCheckboxStates,
            module.id.toString(),
          )
          newStates[accordionIndex][moduleIndex].numberOfAttributes =
            attributesCount
          if (attributesCount === totalItemCount) {
            newStates[accordionIndex][moduleIndex].allcheckbox = true
            setSelectAllAttributes(prevStates => {
              const updatedSelectAllAttributes = { ...prevStates }
              updatedSelectAllAttributes[moduleId] = true
              return updatedSelectAllAttributes
            })
          } else {
            newStates[accordionIndex][moduleIndex].allcheckbox = false
            setSelectAllAttributes(prevStates => {
              const updatedSelectAllAttributes = { ...prevStates }
              updatedSelectAllAttributes[moduleId] = false
              return updatedSelectAllAttributes
            })
          }
        }
        return updatedCheckboxStates
      })
      return newStates
    })
  }
  const handleSelectAllAttributesChange = (
    accordionIndex: number,
    lw2m2: LWM2MResponse,
  ) => {
    setSelectAllAttributes(prevStates => {
      const objectId = lw2m2.LWM2M.Object.ObjectID
      const updatedSelectAllAttributes = { ...prevStates }
      updatedSelectAllAttributes[objectId] = !prevStates[objectId]
      return updatedSelectAllAttributes
    })
    const updatedCheckboxStates: Record<string, boolean> = {}
    filterLWM2M.forEach((lw2m2, index) => {
      if (index === accordionIndex) {
        lw2m2.LWM2M.Object.Resources.Item.forEach(item => {
          if (item.Operations === 'RW' || item.Operations === 'R') {
            const itemId = `/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`
            updatedCheckboxStates[itemId] =
              !selectAllAttributes[lw2m2.LWM2M.Object.ObjectID]
          }
        })
      }
    })
    setCheckboxStates(prevStates => {
      const newStates = { ...prevStates, ...updatedCheckboxStates }
      return newStates
    })
    filterLWM2M.forEach((lw2m2, index) => {
      if (index === accordionIndex) {
        lw2m2.LWM2M.Object.Resources.Item.forEach(item => {
          if (item.Operations === 'RW' || item.Operations === 'R') {
            const moduleId = lw2m2.LWM2M.Object.ObjectID
            const moduleObject = {
              id: moduleId,
              module_name: lw2m2.LWM2M.Object.Name,
            }
            const itemId = `/${moduleId}/0/${item['@ID']}`
            const itemObject = {
              action: item.Operations,
              id: itemId,
              kind: item.MultipleInstances,
              name:
                itemNames[`${moduleId}-${item['@ID']}`] ||
                formatString(item.Name),
              type: item.Type,
            }
            const attributes = {
              attribute_key:
                itemNames[`${moduleId}-${item['@ID']}`] ||
                formatString(item.Name),
              value: '',
              logged: true,
              value_t: getValueType(item.Type),
            }
            handleCheckboxChange(
              accordionIndex,
              moduleObject,
              itemObject,
              attributes,
              lw2m2.LWM2M.Object.Resources.Item.filter(
                item => item.Operations === 'RW' || item.Operations === 'R',
              ).length,
            )
          }
        })
      }
    })
  }

  useEffect(() => {
    const accordionArray = Object.values(accordionStates).flat()
    const newConfigData: { [key: string]: string } = {}
    accordionArray.forEach(accordionItem => {
      accordionItem.attribute_info.forEach(attribute => {
        newConfigData[attribute.id] = attribute.name
      })
    })
    setConfigData(newConfigData)
  }, [accordionStates])

  useEffect(() => {
    const accordionArray = Object.values(accordionStates).flat()
    const newAttrData: AttrLwM2MList[] = []
    accordionArray.forEach(accordionItem => {
      accordionItem.attributes.forEach(attribute => {
        newAttrData.push({
          attribute_key: attribute.attribute_key,
          logged: attribute.logged,
          value: attribute.value,
          value_t: attribute.value_t,
        })
      })
    })
    setAttrData(newAttrData)
  }, [accordionStates])

  const resetAllStates = () => {
    setCheckboxStates({})
    setItemNames({})
    setAccordionStates([])
    setSelectAllAttributes({})
    setFilterLWM2M([])
  }
  const handleClearSelectDropdown = () => {
    resetAllStates()
  }
  const selectedThing = watch('thing_id')
  const selectedService = watch('handle_msg_svc')
  const name = watch('name')
  const transportConfig = {
    protocol: 'lwm2m',
    config: configData,
    info: {
      module_config: Object.values(accordionStates).flat(),
    },
  }
  const data = {
    name: name,
    project_id: projectId,
    attributes: AttrData,
    transport_config: transportConfig,
    thing_id: selectedThing,
    handle_msg_svc: selectedService,
  }

  useEffect(() => {
    if (isSuccessCreateTemplatelwm2m && close) {
      close()
    }
  }, [isSuccessCreateTemplatelwm2m])

  const resetForm = () => {
    close()
    resetAllStates()
    form.reset()
  }

  const getValueType = (type: string) => {
    const valueType = valueTypeList.find(value => value.name === type)
    return valueType ? valueType.type : 'STR'
  }

  return (
    <Sheet open={isOpen} onOpenChange={resetForm} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>
            {t('cloud:device_template.add_template.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              className="w-full space-y-5"
              id="create-template"
              onSubmit={handleSubmit(async () => {
                await mutateAsyncCreateTemplatelwm2m({ data })
              })}
            >
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:device_template.add_template.name')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
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

                <div className="relative w-full">
                  <div className="w-[calc(100%-2.5rem)]">
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
                                  option.label === t('loading:entity_thing') ||
                                  option.label === t('table:no_thing')
                                }
                                noOptionsMessage={() => t('table:no_thing')}
                                loadingMessage={() => t('loading:entity_thing')}
                                placeholder={t(
                                  'cloud:custom_protocol.thing.choose',
                                )}
                                handleClearSelectDropdown={() =>
                                  selectDropdownServiceRef.current?.clearValue()
                                }
                                handleChangeSelect={() =>
                                  selectDropdownServiceRef.current?.clearValue()
                                }
                                isLoading={AdapterIsLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <CreateThing
                    thingType="thing"
                    classNameTriggerBtn="h-[34px] absolute right-0 bottom-0"
                  />
                </div>

                <div className="relative w-full">
                  <div className="w-[calc(100%-2.5rem)]">
                    <FormField
                      control={form.control}
                      name="handle_msg_svc"
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
                                options={serviceSelectData}
                                isOptionDisabled={option =>
                                  option.label === t('loading:service_thing') ||
                                  option.label === t('table:no_service')
                                }
                                noOptionsMessage={() => t('table:no_service')}
                                loadingMessage={() =>
                                  t('loading:service_thing')
                                }
                                placeholder={t(
                                  'cloud:custom_protocol.service.choose',
                                )}
                                isLoading={
                                  watch('thing_id') != null
                                    ? isLoadingService
                                    : false
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <CreateService
                    thingId={watch('thing_id')}
                    classNameTriggerBtn="h-[34px] absolute right-0 bottom-0"
                  />
                </div>

                <div className="space-y-1">
                  <FormField
                    control={form.control}
                    name="rule_chain_id"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:device_template.add_template.lwm2m')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <NewSelectDropdown
                              isClearable
                              customOnChange={onChange}
                              options={LwM2MSelectOptions}
                              isOptionDisabled={option =>
                                option.label === t('loading:lwm2m_model')
                              }
                              noOptionsMessage={() =>
                                t('table:no_in_lwm2m_model')
                              }
                              handleClearSelectDropdown={
                                handleClearSelectDropdown
                              }
                              loadingMessage={() => t('loading:service_thing')}
                              placeholder={t(
                                'cloud:device_template.add_template.choose_lwm2m_model',
                              )}
                              isMulti
                              closeMenuOnSelect={false}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Accordion
                    type="multiple"
                    value={openAccordion}
                    onValueChange={handleAccordionChange}
                    className="mb-2 rounded-md bg-gray-100 shadow-lg"
                  >
                    {filterLWM2M.map((lw2m2, accordionIndex) => (
                      <AccordionItem
                        key={accordionIndex}
                        value={lw2m2.LWM2M.Object.Name}
                        className="border-b border-gray-300"
                      >
                        <AccordionTrigger className="ml-3 justify-start hover:no-underline">
                          <LuChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                          <p className="ml-2">
                            {lw2m2.LWM2M.Object.Name} #
                            {lw2m2.LWM2M.Object.ObjectID}
                          </p>
                        </AccordionTrigger>
                        <AccordionContent className="overflow-hidden bg-slate-200 px-4 py-2">
                          <div className="grid grow grid-cols-1 gap-2	border-b-2 border-gray-300 md:grid-cols-2">
                            <div className="mb-2 flex">
                              <div className="flex items-end">
                                <p>{t('#ID Resource name')}</p>
                              </div>
                              <div className="ml-auto">
                                <Checkbox
                                  customClassName="w-5 h-5"
                                  className="mb-1 ml-5 flex h-5 w-5 items-center justify-center"
                                  checked={
                                    selectAllAttributes[
                                      lw2m2.LWM2M.Object.ObjectID
                                    ]
                                  }
                                  onCheckedChange={e =>
                                    handleSelectAllAttributesChange(
                                      accordionIndex,
                                      lw2m2,
                                      e,
                                    )
                                  }
                                />
                                {t('Attribute')}
                              </div>
                            </div>
                            <div className="mb-2 ml-2 flex items-end">
                              {t('Key name')}
                            </div>
                          </div>
                          <div>
                            {lw2m2.LWM2M.Object.Resources.Item.map(item => {
                              if (
                                item.Operations === 'RW' ||
                                item.Operations === 'R'
                              ) {
                                const defaultItemName = item.Name
                                const itemId = `/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`
                                return (
                                  <section key={item['@ID']} className="mt-3">
                                    <div className="grid grow grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-2">
                                      <div className="flex">
                                        <div className="flex items-center justify-center">
                                          #{item['@ID']} {item.Name}
                                        </div>
                                        <Controller
                                          control={control}
                                          name={`transport_config.config`}
                                          render={({
                                            field: { onChange, ...field },
                                          }) => {
                                            return (
                                              <Checkbox
                                                className="ml-auto mr-3 mt-2 flex h-5 w-5 items-center justify-center"
                                                {...field}
                                                checked={checkboxStates[itemId]}
                                                onCheckedChange={e => {
                                                  const formattedName =
                                                    formatString(
                                                      defaultItemName,
                                                    )
                                                  const moduleObject = {
                                                    id: lw2m2.LWM2M.Object
                                                      .ObjectID,
                                                    module_name:
                                                      lw2m2.LWM2M.Object.Name,
                                                    //allcheckbox: !selectAllAttributes[lw2m2.LWM2M.Object.ObjectID]
                                                  }
                                                  const itemObject = {
                                                    action: item.Operations,
                                                    id: `/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`,
                                                    kind: item.MultipleInstances,
                                                    name:
                                                      itemNames[
                                                        `/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`
                                                      ] || formattedName,
                                                    type: item.Type,
                                                  }
                                                  const attributes = {
                                                    attribute_key:
                                                      itemNames[
                                                        `/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`
                                                      ] || formattedName,
                                                    value: '',
                                                    logged: true,
                                                    value_t: getValueType(
                                                      item.Type,
                                                    ),
                                                  }
                                                  if (typeof e === 'boolean') {
                                                    setCheckboxStates(prev => ({
                                                      ...prev,
                                                      [itemId]: e,
                                                    }))
                                                  } else {
                                                    setCheckboxStates(prev => ({
                                                      ...prev,
                                                      [itemId]:
                                                        e.target.checked,
                                                    }))
                                                  }
                                                  handleCheckboxChange(
                                                    accordionIndex,
                                                    moduleObject,
                                                    itemObject,
                                                    attributes,
                                                    lw2m2.LWM2M.Object.Resources.Item.filter(
                                                      item =>
                                                        item.Operations ===
                                                          'RW' ||
                                                        item.Operations === 'R',
                                                    ).length,
                                                  )
                                                  onChange(e)
                                                }}
                                                customClassName="w-5 h-5"
                                              />
                                            )
                                          }}
                                        />
                                      </div>
                                      <div className="grid grow grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-1">
                                        <InputField
                                          className=""
                                          value={
                                            itemNames[
                                              `/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`
                                            ]
                                          }
                                          defaultValue={formatString(
                                            defaultItemName,
                                          )}
                                          onChange={e =>
                                            setItemNames(prev => ({
                                              ...prev,
                                              [`/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`]:
                                                e.target.value,
                                            }))
                                          }
                                          disabled={checkboxStates[itemId]}
                                        />
                                      </div>
                                    </div>
                                  </section>
                                )
                              }
                              return null
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </>
            </form>
          </Form>
        </div>

        <SheetFooter>
          <>
            <Button
              className="rounded border-none"
              variant="secondary"
              size="lg"
              onClick={resetForm}
              startIcon={
                <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
              }
            />
            <Button
              className="rounded border-none"
              form="create-template"
              type="submit"
              size="lg"
              isLoading={isSuccessCreateTemplatelwm2m}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
