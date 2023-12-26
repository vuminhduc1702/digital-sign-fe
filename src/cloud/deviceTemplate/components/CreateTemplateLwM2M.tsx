import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useRef, useState, useCallback } from 'react'
import { axios } from '~/lib/axios'
import { Button } from '~/components/Button'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '~/components/Accordion'
import {
  FieldWrapper,
  FormDrawer,
  SelectDropdown,
  InputField,
  SelectField,
} from '~/components/Form'
import { valueTypeList } from '~/cloud/orgManagement/components/Attributes'
import {
  useCreateTemplate,
  useUpdateTemplate,
} from '../api'
import storage from '~/utils/storage'
import { Checkbox } from '~/components/Checkbox'
import { flattenData } from '~/utils/misc.ts'
import { useGetXMLdata } from '../api/getXMLdata'

import { transportConfigSchema, nameSchema } from '~/utils/schemaValidation'
import { type LWM2MResponse } from '../types'
import { LWM2MData } from '../types/lwm2mXML'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { ChevronDown } from 'lucide-react'

export default function CreateTemplateLwM2M() {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const LwM2MSelectOptions = LWM2MData.infos.map(item => ({
    label: `${item.module_name} #${item.file_id}_${item.version}`,
    value: `${item.file_id}`,
  }))
  const { mutate: mutateUpdateTemplatelwm2m } = useUpdateTemplate({
    isOnCreateTemplate: true,
  })
  const {
    mutateAsync: mutateAsyncCreateTemplatelwm2m,
    isLoading: isLoadingCreateTemplatelwm2m,
    isSuccess: isSuccessCreateTemplatelwm2m,
  } = useCreateTemplate()
  const { register, formState, handleSubmit, control, watch, reset } = useForm()
  //console.log('formState errors', formState.errors)
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
    }
  }, [XMLData, watch('rule_chain_id')])
  //console.log('filterLWM2M', filterLWM2M)
  function formatString(str) {
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

  const handleAccordionChange = (accordionIndex) => {
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
  const handleCheckboxChange = (accordionIndex, module, item) => {
    setAccordionStates((prevStates) => {
      const newStates = { ...prevStates }
      if (!newStates[accordionIndex]) {
        newStates[accordionIndex] = []
      }
      const moduleId = module.id
      const moduleIndex = newStates[accordionIndex].findIndex((obj) => obj.id === moduleId)
  
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
          (attribute) => attribute.id === item.id
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
      accordionItem.attribute_info.forEach((attribute) => {
        newConfigData[attribute.id] = attribute.name
      })
    })
    setConfigData(newConfigData)
}, [accordionStates])
// console.log('checkboxStates:', checkboxStates)
// console.log('accordionStates', accordionStates)
const resetAllStates = () => {
  setCheckboxStates({})
  setItemNames({})
  setAccordionStates([])
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
  return (
    <FormDrawer
      isDone={isLoadingCreateTemplatelwm2m}
      triggerButton={
        <Button
          className="h-9 w-9 rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:device_template.add_template.title')}
      submitButton={
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
      }
      resetData={() => {
        reset()
        setName('')
        resetAllStates()
      }}
    >
      <form
        className="w-full space-y-5"
        id="create-template"
        onSubmit={handleSubmit(async () => {await mutateAsyncCreateTemplatelwm2m({data})
          // mutateUpdateTemplatelwm2m({
          //   data: {
          //     name: dataCreateTemplatelwm2m.name,
          //     rule_chain_id: dataCreateTemplatelwm2m.rule_chain_id,
          //     transport_config: dataCreateTemplatelwm2m.transport_config,
          //   },
          //   templateId: dataCreateTemplatelwm2m.id,
          // })
        })}
      >
        <>
          <InputField
            label={t('cloud:device_template.add_template.name')}
            value={name}
            onChange={handleNameChange}
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
    </FormDrawer>
  )
}