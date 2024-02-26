import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSpinDelay } from 'spin-delay'
import { type SelectInstance } from 'react-select'
import * as z from 'zod'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/Accordion'
import { Button } from '~/components/Button'
import { Checkbox } from '~/components/Checkbox'
import { Drawer } from '~/components/Drawer'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import { Spinner } from '~/components/Spinner'
import { axios } from '~/lib/axios'
import { nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { useUpdateTemplate, type UpdateTemplateDTO } from '../api'
import { useTemplateById } from '../api/getTemplateById'
import {
  type LWM2MResponse,
  type ModuleConfig,
  type Template,
  type TransportConfigAttribute,
} from '../types'
import { LWM2MData } from '../types/lwm2mXML'

import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { CreateThing } from '~/cloud/flowEngineV2/components/Attributes'
import { CreateService } from '~/cloud/customProtocol/components/CreateService'

import { LuChevronDown } from 'react-icons/lu'

type AccordionStates = {
  [key: number]: ModuleConfig[]
}
type CheckboxStates = {
  [key: string]: boolean
}
type ItemNames = {
  [key: string]: string
}
type UpdateTemplateProps = {
  selectedUpdateTemplate: Template
  close: () => void
  isOpen: boolean
}

export const templateAttrSchema = z.object({
  name: nameSchema,
  thing_id: z.string(),
  handle_msg_svc: z.string(),
})
const LwM2MSelectOptions = LWM2MData.infos.map(item => ({
  label: `${item.module_name} #${item.file_id}_${item.version}`,
  value: `${item.file_id}`,
}))

export function UpdateTemplateLwM2M({
  selectedUpdateTemplate,
  close,
  isOpen,
}: UpdateTemplateProps) {
  const { t } = useTranslation()
  const { mutate, isLoading, isSuccess } = useUpdateTemplate()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const projectId = storage.getProject()?.id
  const [openAccordion] = useState()
  const [name, setName] = useState<string>('')
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }
  const [accordionStates, setAccordionStates] = useState<AccordionStates>({})
  const [selectAllAttributes, setSelectAllAttributes] =
    useState<CheckboxStates>({})
  const [checkboxStates, setCheckboxStates] = useState<CheckboxStates>({})
  const [configData, setConfigData] = useState({})
  const [itemNames, setItemNames] = useState<ItemNames>({})
  const [selectedModuleNames, setSelectedModuleNames] = useState<string[]>([])
  const { data: thingData, isLoading: AdapterIsLoading } = useGetEntityThings({
    projectId,
    type: 'thing',
  })

  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const {
    register,
    formState,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    getValues,
  } = useForm<UpdateTemplateDTO['data']>({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
  })

  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceThings({
      thingId: getValues('thing_id'),
      config: {
        enabled: !!getValues('thing_id'),
        suspense: false,
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
  useEffect(() => {
    setValue('rule_chain_id', selectedModuleNames.map(String))
  }, [setValue, selectedModuleNames])

  const [filterLWM2M, setFilterLWM2M] = useState<LWM2MResponse[]>([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = watch('rule_chain_id').map(async id => {
          const response = await axios.get(`/file/publishjson/${id}.json`)
          return response
        })
        const responseData = await Promise.all(promises)
        setFilterLWM2M(responseData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [watch('rule_chain_id')])

  useEffect(() => {
    if (watch('rule_chain_id') != null) {
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
  }, [watch('rule_chain_id')])
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
          }

          if (updatedCheckboxStates[item.id] === false) {
            newStates[accordionIndex][moduleIndex].attribute_info.splice(
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
            handleCheckboxChange(
              accordionIndex,
              moduleObject,
              itemObject,
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
    transport_config: transportConfig,
    thing_id: selectedThing,
    handle_msg_svc: selectedService,
  }
  const { data: LwM2MData, isLoading: LwM2MLoading } = useTemplateById({
    templateId: selectedUpdateTemplate?.id,
    config: { suspense: false },
  })
  const transport_Config = selectedUpdateTemplate?.transport_config
  console.log('transport_config', transport_Config)
  const transportConfigdata = JSON.parse(transport_Config)
  const idArray = transportConfigdata?.info?.module_config?.map(
    (attribute_info: []) => attribute_info.id,
  )
  useEffect(() => {
    if (LwM2MData != null) {
      const { name, transport_config } = LwM2MData
      const { module_config } = transport_config.info
      setName(name)
      const newAccordionStates: AccordionStates = {}
      const newCheckboxStates: CheckboxStates = {}
      const newItemNames: ItemNames = {}
      const newSelectAllAttributes: CheckboxStates = {}
      module_config.forEach((moduleItem, accordionIndex) => {
        if (!newAccordionStates[accordionIndex]) {
          newAccordionStates[accordionIndex] = []
        }
        newAccordionStates[accordionIndex].push({
          id: moduleItem.id,
          module_name: moduleItem.module_name,
          attribute_info: moduleItem.attribute_info,
          numberOfAttributes: moduleItem.numberOfAttributes,
          last_update_ts: moduleItem.last_update_ts,
          allcheckbox: moduleItem.allcheckbox,
        })
        moduleItem.attribute_info.forEach(attribute => {
          newCheckboxStates[attribute.id] = true
          newItemNames[attribute.id] = attribute.name
        })
        newSelectAllAttributes[moduleItem.id] = moduleItem.allcheckbox
      })
      setItemNames(newItemNames)
      setAccordionStates(newAccordionStates)
      setCheckboxStates(newCheckboxStates)
      setSelectAllAttributes(newSelectAllAttributes)
      const allid = (Object.values(newAccordionStates) as { id: string }[][])
        .flat()
        .map(moduleItem => moduleItem.id)
      setSelectedModuleNames(allid)
      reset({
        name: name,
        thing_id: selectedUpdateTemplate.thing_id,
        handle_msg_svc: selectedUpdateTemplate.handle_message_svc,
      })
    }
  }, [LwM2MData])
  const showSpinner = useSpinDelay(LwM2MLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => {
        setValue('rule_chain_id', selectedModuleNames)
        close()
      }}
      title={t('cloud:device_template.add_template.update')}
      renderFooter={() => (
        <>
          <Button
            className="rounded border-none"
            variant="secondary"
            size="lg"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Submit" className="size-5" />
            }
          />
          <Button
            className="rounded border-none"
            form="update-template"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="size-5" />
            }
            disabled={!formState.isDirty || isLoading}
          />
        </>
      )}
    >
      {LwM2MLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
        <form
          className="w-full space-y-5"
          id="update-template"
          onSubmit={handleSubmit(() => {
            data

            mutate({
              data,
              templateId: selectedUpdateTemplate?.id,
            })
          })}
        >
          <>
            <InputField
              label={t('cloud:device_template.add_template.name')}
              value={name}
              onChange={handleNameChange}
              error={formState.errors['name']}
              registration={register('name')}
            />

            <div className="w-[calc(100%-2.5rem)]">
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
                isLoading={AdapterIsLoading}
                placeholder={t('cloud:custom_protocol.thing.choose')}
                defaultValue={thingSelectData?.find(
                  thing => thing.value === selectedUpdateTemplate.thing_id,
                )}
                handleClearSelectDropdown={() =>
                  selectDropdownServiceRef.current?.clearValue()
                }
                handleChangeSelect={() =>
                  selectDropdownServiceRef.current?.clearValue()
                }
                error={formState?.errors?.thing_id}
              />
            </div>

            {!isLoadingService ? (
              <div className="w-[calc(100%-2.5rem)]">
                <SelectDropdown
                  refSelect={selectDropdownServiceRef}
                  label={t('cloud:custom_protocol.service.title')}
                  name="handle_msg_svc"
                  control={control}
                  options={serviceSelectData}
                  isOptionDisabled={option =>
                    option.label === t('loading:service_thing') ||
                    option.label === t('table:no_service')
                  }
                  isLoading={isLoadingService}
                  noOptionsMessage={() => t('table:no_service')}
                  placeholder={t('cloud:custom_protocol.service.choose')}
                  defaultValue={serviceSelectData?.find(
                    service =>
                      service.value ===
                      selectedUpdateTemplate.handle_message_svc,
                  )}
                  error={formState?.errors?.handle_msg_svc}
                />
              </div>
            ) : null}
            <div className="space-y-1">
              <SelectDropdown
                isClearable
                label={t('cloud:device_template.add_template.lwm2m')}
                name="rule_chain_id"
                control={control}
                options={LwM2MSelectOptions}
                isMulti
                closeMenuOnSelect={false}
                isOptionDisabled={option =>
                  option.label === t('loading:lwm2m_model')
                }
                noOptionsMessage={() => t('table:no_in_lwm2m_model')}
                handleClearSelectDropdown={handleClearSelectDropdown}
                placeholder={t(
                  'cloud:device_template.add_template.choose_lwm2m_model',
                )}
                defaultValue={LwM2MSelectOptions.filter(item =>
                  idArray.includes(item.value),
                )}
              />
              <p className="text-body-sm text-primary-400">
                {formState?.errors?.rule_chain_id?.message}
              </p>
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
                      <LuChevronDown className="size-4 shrink-0 transition-transform duration-200" />
                      <p className="ml-2">
                        {lw2m2.LWM2M.Object.Name} #{lw2m2.LWM2M.Object.ObjectID}
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
                              className="mb-1 ml-5 flex size-5"
                              checked={
                                selectAllAttributes[lw2m2.LWM2M.Object.ObjectID]
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
                                            className="ml-auto mr-3 mt-2 flex size-5"
                                            {...field}
                                            checked={checkboxStates[itemId]}
                                            onCheckedChange={e => {
                                              const formattedName =
                                                formatString(defaultItemName)
                                              const moduleObject = {
                                                id: lw2m2.LWM2M.Object.ObjectID,
                                                module_name:
                                                  lw2m2.LWM2M.Object.Name,
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
                                              if (typeof e === 'boolean') {
                                                setCheckboxStates(prev => ({
                                                  ...prev,
                                                  [itemId]: e,
                                                }))
                                              } else {
                                                setCheckboxStates(prev => ({
                                                  ...prev,
                                                  [itemId]: e.target.checked,
                                                }))
                                              }
                                              handleCheckboxChange(
                                                accordionIndex,
                                                moduleObject,
                                                itemObject,
                                                lw2m2.LWM2M.Object.Resources.Item.filter(
                                                  item =>
                                                    item.Operations === 'RW' ||
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
      )}
      <CreateThing
        thingType="thing"
        classNameTriggerBtn="absolute right-0 top-[102px] mr-6"
      />
      <CreateService
        thingId={watch('thing_id')}
        classNameTriggerBtn="absolute right-0 top-[182px] mr-6"
      />
    </Drawer>
  )
}
