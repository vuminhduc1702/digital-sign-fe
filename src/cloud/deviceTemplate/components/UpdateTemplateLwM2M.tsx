import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as z from 'zod'
import { axios} from '~/lib/axios'
import { useSpinDelay } from 'spin-delay'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '~/components/Button'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '~/components/Accordion'
import {
  FieldWrapper,
  InputField,
  SelectField,
  SelectDropdown,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'
import { nameSchema } from '~/utils/schemaValidation'
import { type CreateTemplateDTO, useUpdateTemplate, useTemplateLwM2MById } from '../api'
import { Checkbox } from '~/components/Checkbox'
import storage from '~/utils/storage'
import { useGetXMLdata } from '../api/getXMLdata'
import { type LWM2MResponse, type ModuleConfig, type TransportConfigAttribute } from '../types'
import { LWM2MData } from '../types/lwm2mXML'


import { ChevronDown } from 'lucide-react'
import { type Template } from '../types'
import { type Attribute } from '~/types'
import {
  booleanSelectOption,
  numberInput,
  valueTypeList,
} from '~/cloud/orgManagement/components/Attributes'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

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
  // rule_chain_id: z.string().optional(),
  // attributes: z.array(attrSchema),
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
  const projectId = storage.getProject()?.id
  const { register, formState, handleSubmit, control, watch, reset, setValue } = useForm<
  CreateTemplateDTO['data']
  >({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
    defaultValues: {
      name: '',
    },
  })
  function formatString(str: string) {
    const lowercasedStr = str.toLowerCase();
    const formattedStr = lowercasedStr.replace(/[\s_]+/g, '')
    return formattedStr
  }
  const [openAccordion] = useState()
  const [name, setName] = useState<string>('')
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {setName(event.target.value)}
  const [accordionStates, setAccordionStates] = useState<AccordionStates>({})
  const [selectAllAttributes, setSelectAllAttributes] = useState<CheckboxStates>({})
  const [checkboxStates, setCheckboxStates] = useState<CheckboxStates>({})
  const [configData, setConfigData] = useState({})
  const [itemNames, setItemNames] = useState<ItemNames>({})
  const [selectedModuleNames, setSelectedModuleNames] = useState<string[]>([])

  useEffect(() => {
    setValue('rule_chain_id', selectedModuleNames.map(String))
  }, [setValue, selectedModuleNames])
  // const { data: XMLData } = useGetXMLdata({
  //   fileId: watch('rule_chain_id')?.[watch('rule_chain_id')?.length - 1] ?? '',
  //   config: {
  //     suspense: false,
  //   },
  // })
  const XMLDataRef = useRef<LWM2MResponse[]>([])
  const [filterLWM2M, setFilterLWM2M] = useState<LWM2MResponse[]>([])
  const [XMLData, setXMLData] = useState<LWM2MResponse | null>(null)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = watch('rule_chain_id').map(async (id) => {
          const response = await axios.get(`/file/publishjson/${id}.json`)
          //console.log('response', response)
          setXMLData(response)
          return response
         })
         //console.log('filterLWM2M', filterLWM2M)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [watch('rule_chain_id')])
  useEffect(() => {
    if (XMLData != null && !XMLDataRef.current.some(item => item.LWM2M.Object.ObjectID === XMLData.LWM2M.Object.ObjectID)) {
      XMLDataRef.current = [...XMLDataRef.current, XMLData]
    }
    if (XMLDataRef.current.length > 0 && watch('rule_chain_id') != null) {
      const sortedData = XMLDataRef.current.sort((a, b) => {
        const indexA = watch('rule_chain_id').indexOf(a.LWM2M.Object.ObjectID)
        const indexB = watch('rule_chain_id').indexOf(b.LWM2M.Object.ObjectID)
        return indexA - indexB
      })
      const filterArr = sortedData.filter(item => watch('rule_chain_id').includes(item.LWM2M.Object.ObjectID))
      setFilterLWM2M(Array.from(new Set(filterArr)))
      const filteredKeys = Object.keys(checkboxStates).filter(key => {
        const objectId = parseInt(key.split('/')[1], 10)
        //console.log('objectId1111', objectId)
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
      Object.keys(accordionStates).forEach((key) => {
        filteredAccordionStates[key] = accordionStates[key].filter(obj =>
          watch('rule_chain_id').includes(obj.id.toString())
        )
      })
      setAccordionStates(filteredAccordionStates)
    }
  }, [XMLData, watch('rule_chain_id')])
  const countTrueValuesForId = (checkboxStates: Record<string, boolean>, idToCount: string): number => {
    const extractIdFromKey = (key: string): number | null => {
      const idString = key.match(/\/(\d+)\/\d+\/\d+/)?.[1]
      return idString ? parseInt(idString, 10) : null
    }
    const id = parseInt(idToCount, 10)
    const trueValues = Object.entries(checkboxStates)
      .filter(([key, value]) => extractIdFromKey(key) === id && value === true)
    return trueValues.length
  }
  const handleAccordionChange = (accordionIndex: number ) => {
    setAccordionStates((prevStates) => {
      const newStates = { ...prevStates }
      if (newStates[accordionIndex]) {
        newStates[accordionIndex] = []
      }
      return newStates
    })
  }
  const handleCheckboxChange = (accordionIndex: number, module: ModuleConfig , item: TransportConfigAttribute, totalItemCount: number) => {
    setAccordionStates((prevStates) => {
      const newStates = { ...prevStates }
      if (!newStates[accordionIndex]) {
        newStates[accordionIndex] = []
      }
      const moduleId = module.id
      setCheckboxStates((prevCheckboxStates) => {
        const updatedCheckboxStates = { ...prevCheckboxStates }
        updatedCheckboxStates[module.id.toString()] = true
        const moduleIndex = newStates[accordionIndex].findIndex((obj) => obj.id === moduleId)
        if (moduleIndex === -1) {
          const currentTimestamp = Date.now()
          const attributesCount = countTrueValuesForId(updatedCheckboxStates, module.id.toString())
          newStates[accordionIndex].push({
            id: module.id,
            module_name: module.module_name,
            attribute_info: [item], 
            numberOfAttributes: attributesCount,
            last_update_ts: currentTimestamp,
          })
        } else {
          const attributeIndex = newStates[accordionIndex][moduleIndex].attribute_info.findIndex(
            (attribute) => attribute.id === item.id
          )
          if (attributeIndex === -1 && updatedCheckboxStates[item.id] === true) {
            newStates[accordionIndex][moduleIndex].attribute_info.push(item)
          } else {
            newStates[accordionIndex][moduleIndex].attribute_info.splice(attributeIndex, 1)
          }
          const attributesCount = countTrueValuesForId(prevCheckboxStates, module.id.toString())
          newStates[accordionIndex][moduleIndex].numberOfAttributes = attributesCount
        }
        return updatedCheckboxStates
      })
  
      return newStates
    })
  }
  const handleSelectAllAttributesChange = (accordionIndex: number,  lw2m2: LWM2MResponse) => {
    setSelectAllAttributes((prevStates) => {
      const objectId = lw2m2.LWM2M.Object.ObjectID
      const updatedSelectAllAttributes = { ...prevStates }
      updatedSelectAllAttributes[objectId] = !prevStates[objectId]
      return updatedSelectAllAttributes
    })
    const updatedCheckboxStates: Record<string, boolean> = {}
    filterLWM2M.forEach((lw2m2, index) => {
      if (index === accordionIndex) {
        lw2m2.LWM2M.Object.Resources.Item.forEach((item) => {
          if (item.Operations === 'RW' || item.Operations === 'R') {
            const itemId = `/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`
            updatedCheckboxStates[itemId] = !selectAllAttributes[lw2m2.LWM2M.Object.ObjectID]
          }
        })
      }
    })
    setCheckboxStates((prevStates) => {
      const newStates = { ...prevStates, ...updatedCheckboxStates }
      return newStates
    })
    filterLWM2M.forEach((lw2m2, index) => {
      if (index === accordionIndex) {
        lw2m2.LWM2M.Object.Resources.Item.forEach((item) => {
          if (item.Operations === 'RW' || item.Operations === 'R') {
            const moduleId = lw2m2.LWM2M.Object.ObjectID;
            const moduleObject = {
              id: moduleId,
              module_name: lw2m2.LWM2M.Object.Name,
            }
            const itemId = `/${moduleId}/0/${item['@ID']}`;
            const itemObject = {
              action: item.Operations,
              id: itemId,
              kind: item.MultipleInstances,
              name: itemNames[`${moduleId}-${item['@ID']}`] || formatString(item.Name),
              type: item.Type,
            }
            handleCheckboxChange(accordionIndex, moduleObject, itemObject, lw2m2.LWM2M.Object.Resources.Item.filter(item => item.Operations === 'RW' || item.Operations === 'R').length)
          }
        })
      }
    })
  }
  useEffect(() => {
    const accordionArray = Object.values(accordionStates).flat()
    const newConfigData: { [key: string]: string } = {}
    accordionArray.forEach((accordionItem) => {
      accordionItem.attribute_info.forEach((attribute) => {
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
const transportConfig = {
  protocol: 'lwm2m',
  config: configData,
  info: {
    module_config: Object.values(accordionStates).flat()
  }
}
const data = {
  name: name,
  project_id: projectId,
  transport_config: transportConfig
}
  
  const { data: LwM2MData, isLoading: LwM2MLoading } = useTemplateLwM2MById({
    templateId: selectedUpdateTemplate?.id,
    config: { suspense: false },
  })
  const { mutate, isLoading, isSuccess } = useUpdateTemplate()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])
  const transport_Config = selectedUpdateTemplate?.transport_config
  const transportConfigdata = JSON.parse(transport_Config)
  const idArray = transportConfigdata?.info?.module_config?.map((attribute_info:[]) => attribute_info.id)
  useEffect(() => {
    if (LwM2MData != null) {
      const { name, transport_config } = LwM2MData
      const { module_config } = transport_config.info
      setName(name)
      const newAccordionStates: AccordionStates = {}
      const newCheckboxStates: CheckboxStates = {}
      const newSelectAllAttributes: CheckboxStates = {}
      module_config.forEach((moduleItem, accordionIndex) => {
        let allAttributesSelected  = true
        if (!newAccordionStates[accordionIndex]) {
          newAccordionStates[accordionIndex] = []
        }
        newAccordionStates[accordionIndex].push({
          id: moduleItem.id,
          module_name: moduleItem.module_name,
          attribute_info: moduleItem.attribute_info,
          numberOfAttributes: moduleItem.numberOfAttributes,
          last_update_ts: moduleItem.last_update_ts,
        })
        moduleItem.attribute_info.forEach((attribute) => {
          newCheckboxStates[attribute.id] = true
          //console.log('newCheckboxStates', newCheckboxStates)
          if (!newCheckboxStates[attribute.id]) {
            console.log('attribute.id', attribute.id)
            allAttributesSelected = false
          }
        })
        newSelectAllAttributes[moduleItem.id] = allAttributesSelected
        //console.log('newSelectAllAttributes', newSelectAllAttributes)
      })
      setAccordionStates(newAccordionStates)
      setCheckboxStates(newCheckboxStates)
      setSelectAllAttributes(newSelectAllAttributes)
      const allid = (Object.values(newAccordionStates) as { id: string }[][])
      .flat()
      .map((moduleItem) => moduleItem.id)
      setSelectedModuleNames(allid)
      reset({
        name: name,
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
        close();
      }}
      title={t('cloud:device_template.add_template.update')}
      renderFooter={() => (
        <>
          {/* <Button
            className="rounded border-none"
            variant="secondary"
            size="lg"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
            }
          /> */}
          {/* <Button
            className="rounded border-none"
            form="update-template"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
            disabled={!formState.isDirty}
          /> */}
        </>
      )}
    >
      {/* {LwM2MLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
        <form
          className="w-full space-y-5"
          id="update-template"
          onSubmit={handleSubmit(() => {data
            
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
          <div className="space-y-1">
            <SelectDropdown
              isClearable
              label={t('cloud:device_template.add_template.flow')}
              name="rule_chain_id"
              control={control}
              options={LwM2MSelectOptions}
              isMulti
              closeMenuOnSelect={false}
              isOptionDisabled={option => option.label === t('loading:flow_id')}
              noOptionsMessage={() => t('table:no_in_flow_id')}
              handleClearSelectDropdown={handleClearSelectDropdown}
              placeholder={t(
                'cloud:device_template.add_template.choose_flow_id',
              )}
              defaultValue={LwM2MSelectOptions.filter(
                (item) => idArray.includes(item.value),
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
                  className="border-none"
                >
                  <AccordionTrigger className="ml-3 justify-start hover:no-underline">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    <p className="ml-2">{lw2m2.LWM2M.Object.Name} #{lw2m2.LWM2M.Object.ObjectID}</p>
                  </AccordionTrigger>
                  <AccordionContent className="overflow-hidden bg-slate-200 px-4 py-2">
                    <div className="grid grow grid-cols-1 gap-2	border-b-2 border-gray-300 md:grid-cols-2">
                      <div className="mb-2 flex">
                        <div className="flex items-end">
                          <p>{t('#ID Resource name')}</p>
                        </div>
                        <div className="ml-auto">
                          <Checkbox 
                            className="mb-1 ml-5 flex h-5 w-5"
                            checked={selectAllAttributes[lw2m2.LWM2M.Object.ObjectID]}
                            onCheckedChange={(e) => handleSelectAllAttributesChange(accordionIndex, lw2m2, e)}
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
                                    render={({ field: { onChange, ...field } }) => {
                                    return (
                                      <Checkbox
                                        className="ml-auto mr-3 mt-2 flex h-5 w-5"
                                        {...field}
                                        checked={checkboxStates[itemId]}
                                        onCheckedChange={(e) => {
                                        const formattedName = formatString(defaultItemName)
                                        const moduleObject ={
                                          id: lw2m2.LWM2M.Object.ObjectID,
                                          module_name: lw2m2.LWM2M.Object.Name,
                                        }
                                        const itemObject = {
                                          action: item.Operations,
                                          id : `/${lw2m2.LWM2M.Object.ObjectID}/0/${item['@ID']}`,
                                          kind: item.MultipleInstances,
                                          name: itemNames[`${lw2m2.LWM2M.Object.ObjectID}-${item['@ID']}`] || formattedName,
                                          type: item.Type,
                                        };
                                        if (typeof e === 'boolean') {
                                          setCheckboxStates((prev) => ({ ...prev, [itemId]: e }));
                                        } else {
                                          setCheckboxStates((prev) => ({ ...prev, [itemId]: e.target.checked }));
                                        }
                                        handleCheckboxChange(accordionIndex, moduleObject ,itemObject, lw2m2.LWM2M.Object.Resources.Item.filter(item => item.Operations === 'RW' || item.Operations === 'R').length)
                                        onChange(e)
                                        }}
                                      />
                                    )
                                  }}
                                  />
                                </div>
                                <div className="grid grow grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-1">
                                  <InputField
                                    className=""
                                    value={itemNames[`${lw2m2.LWM2M.Object.ObjectID}-${item['@ID']}`] || formatString(defaultItemName)}
                                    onChange={(e) => setItemNames((prev) => ({ ...prev, [`${lw2m2.LWM2M.Object.ObjectID}-${item['@ID']}`]: e.target.value }))}  
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
      )} */}
      <div>zzzzzz1</div>
    </Drawer>
  )
}
