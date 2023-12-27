import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState, useCallback } from 'react'
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
import { type UpdateTemplateDTO, useUpdateTemplate, useTemplateLwM2MById } from '../api'
import { useGetAttrs } from '~/cloud/orgManagement/api/attrAPI'
import { templateAttrSchema } from './CreateTemplate'
import { Checkbox } from '~/components/Checkbox'
import storage from '~/utils/storage'
import { useGetXMLdata } from '../api/getXMLdata'
import { useGetRulechains } from '../api/getRulechains'
import { flattenData } from '~/utils/misc.ts'
import { type LWM2MResponse, type TransportConfig } from '../types'
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

type UpdateTemplateProps = {
  selectedUpdateTemplate: Template
  close: () => void
  isOpen: boolean
}

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
// console.log(LwM2MSelectOptions, 'LwM2MSelectOptions');

  // const {
  //   mutateAsync: mutateAsyncCreateTemplatelwm2m,
  //   isLoading: isLoadingCreateTemplatelwm2m,
  //   isSuccess: isSuccessCreateTemplatelwm2m,
  // } = useCreateTemplate()
  const { register, formState, handleSubmit, control, watch, reset, setValue } = useForm()
  //console.log('formState errors', formState.errors)
  // const { data: XMLData } = useGetXMLdata({
  //   fileId: watch('rule_chain_id')?.[watch('rule_chain_id')?.length - 1] ?? '',
  //   config: {
  //     suspense: false,
  //   },
  // })
  // const XMLDataRef = useRef<LWM2MResponse[]>([])
  // const [filterLWM2M, setFilterLWM2M] = useState<LWM2MResponse[]>([])
  // useEffect(() => {
  //   if (XMLData != null) {
  //     XMLDataRef.current = [...XMLDataRef.current, XMLData]
  //   }
  //   if (XMLDataRef.current.length > 0 && watch('rule_chain_id') != null) {
  //     const filterArr = XMLDataRef.current.filter(item => {
  //       return watch('rule_chain_id').includes(item.LWM2M.Object.ObjectID)
  //     })
  //     setFilterLWM2M(Array.from(new Set(filterArr)))
  //   }
  // }, [XMLData, watch('rule_chain_id')])
  //console.log('filterLWM2M', filterLWM2M)
  function formatString(str: string) {
    const lowercasedStr = str.toLowerCase();
    const formattedStr = lowercasedStr.replace(/[\s_]+/g, '')
    return formattedStr
  }
  const [openAccordion, setOpenAccordion] = useState()
  const [name, setName] = useState<string>('')
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {setName(event.target.value)}
  const [accordionStates, setAccordionStates] = useState({})
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const [checkboxStates, setCheckboxStates] = useState({})
  const [configData, setConfigData] = useState({})
  const [itemNames, setItemNames] = useState({})
  const [selectedModuleNames, setSelectedModuleNames] = useState<string[]>([])
  const handleAccordionChange = (accordionIndex: string | number) => {
    setAccordionStates((prevStates) => {
      const newStates = { ...prevStates }
      if (newStates[accordionIndex]) {
        newStates[accordionIndex] = []
      } else {
        newStates[accordionIndex] = []
      }
      return newStates
    })
  }
  //console.log('selectedUpdateTemplate', selectedUpdateTemplate)
  const handleCheckboxChange = (accordionIndex: string | number, module: { id: any; name: any }, item: { id: any }) => {
    setAccordionStates((prevStates) => {
      const newStates = { ...prevStates }
      if (!newStates[accordionIndex]) {
        newStates[accordionIndex] = []
      }
      const moduleId = module.id
      const moduleIndex = newStates[accordionIndex].findIndex((obj: { id: any }) => obj.id === moduleId)
  
      if (moduleIndex === -1) {
        const currentTimestamp = Date.now();
        newStates[accordionIndex].push({
          id: module.id,
          module_name: module.name,
          attribute_info: [item], 
          numberOfAttributes: 1,
          last_update_ts: currentTimestamp,
        })
      } else {
        const attributeIndex = newStates[accordionIndex][moduleIndex].attribute_info.findIndex(
          (attribute: { id: any }) => attribute.id === item.id
        )
        if (attributeIndex === -1) {
          newStates[accordionIndex][moduleIndex].attribute_info.push(item)
          newStates[accordionIndex][moduleIndex].numberOfAttributes += 1
        } else {
          newStates[accordionIndex][moduleIndex].attribute_info.splice(attributeIndex, 1)
          newStates[accordionIndex][moduleIndex].numberOfAttributes -= 1
        }
      }
      return newStates
    })
  }

  useEffect(() => {
    const accordionArray = Object.values(accordionStates).flat()
    //console.log('Accordion States:', accordionArray);
    const newConfigData = {}
    accordionArray.forEach((accordionItem) => {
      accordionItem.attribute_info.forEach((attribute: { id: string | number; name: any }) => {
        newConfigData[attribute.id] = attribute.name
      })
    })
    setConfigData(newConfigData)
}, [accordionStates])
const resetAllStates = () => {
  setCheckboxStates({})
  setItemNames({})
  setAccordionStates([])
  setFilterLWM2M([])
}
console.log('accordionStates:', accordionStates)
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
  //console.log('Mảng giá trị id:', idArray)

  useEffect(() => {
    if (LwM2MData != null) {
      const { name, transport_config } = LwM2MData
      const { module_config } = transport_config.info
      setName(name)
      const newAccordionStates = {}
      const newCheckboxStates = {}
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
        })
        moduleItem.attribute_info.forEach((attribute) => {
          newCheckboxStates[attribute.id] = true
        })
      })
      setAccordionStates(newAccordionStates)
      setCheckboxStates(newCheckboxStates);
      const allid = (Object.values(newAccordionStates) as { id: string }[][])
      .flat()
      .map((moduleItem) => moduleItem.id);
      console.log('allid',allid)
      setSelectedModuleNames(allid)
      reset({
        name: name,
      })
    }
  }, [LwM2MData])

  useEffect(() => {
    setValue('rule_chain_id', selectedModuleNames.map(String));
  }, [setValue, selectedModuleNames])

  const ruleChainIds  = watch('rule_chain_id')
  console.log('ruleChainIds', ruleChainIds)

//Sử dụng hàm map để tạo mảng chứa các yêu cầu API tương ứng
//   const xmlDataArray = ruleChainIds.map(ruleChainId => {
//   const { data: XMLData } = useGetXMLdata({
//     fileId: ruleChainId,
//     config: {
//       suspense: false,
//     },
//   });

//   return XMLData;
// });
// console.log('xmlDataArray', xmlDataArray)
  const { data: XMLData } = useGetXMLdata({
    fileId: watch('rule_chain_id')?.[watch('rule_chain_id')?.length - 1] ?? '',
    config: {
      suspense: false,
    },
  })
  const XMLDataRef = useRef<LWM2MResponse[]>([])
  const [filterLWM2M, setFilterLWM2M] = useState<LWM2MResponse[]>([])
  useEffect(() => {
    if (XMLData != null) {
      XMLDataRef.current = [...XMLDataRef.current, XMLData]
    }
    if (XMLDataRef.current.length > 0 && watch('rule_chain_id') != null) {
      const filterArr = XMLDataRef.current.filter(item => {
        return watch('rule_chain_id').includes(item.LWM2M.Object.ObjectID)
      })
      setFilterLWM2M(Array.from(new Set(filterArr)))
      console.log('filterArr', filterArr)
    }
  }, [XMLData, watch('rule_chain_id')])

  console.log('rule_chain_id', watch('rule_chain_id'))
  console.log('filterLWM2M', filterLWM2M)
  
  console.log('data',data)
  const showSpinner = useSpinDelay(LwM2MLoading, {
    delay: 150,
    minDuration: 300,
  })
  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => {
        //setCheckboxStates({})
        //setAccordionStates([])
        close();
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
              <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
            }
          />
          <Button
            className="rounded border-none"
            form="update-template"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
            disabled={!formState.isDirty}
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
                                          name: lw2m2.LWM2M.Object.Name,
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
                                        handleCheckboxChange(accordionIndex, moduleObject ,itemObject)
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
      )}
    </Drawer>
  )
}
