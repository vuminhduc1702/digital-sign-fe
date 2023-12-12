import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'

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
  useCreateTemplatelwm2m,
  type CreateTemplatelwm2mDTO,
  useUpdateTemplatelwm2m,
} from '../api'
import storage from '~/utils/storage'
import { Checkbox } from '~/components/Checkbox'
import { flattenData } from '~/utils/misc.ts'
import { useGetXMLdata } from '../api/getXMLdata'
import { CreateTableXMl } from './CreateTableXMl'

import { attrSchema, nameSchema } from '~/utils/schemaValidation'
import { type LWM2MResponse } from '../types'
import { LWM2MData } from '../types/lwm2mXML'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { ChevronDown } from 'lucide-react'


export const templatelwm2mSchema = z.object({
  name: nameSchema,
  rule_chain_id: z.string().optional(),
  transport_config: z.object({
    protocol: z.string(),
    config: z.record(z.string(), z.string()),
    info: z.object({}).nullable(),
    }),
})

export default function CreateTemplateLwM2M() {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const LwM2MSelectOptions = LWM2MData.infos.map(item => ({
    label: `${item.module_name} #${item.file_id}_${item.version}`,
    value: `${item.file_id}`,
  }))
  const { mutate: mutateUpdateTemplatelwm2m } = useUpdateTemplatelwm2m({
    isOnCreateTemplate: true,
  })
  const {
    mutateAsync: mutateAsyncCreateTemplatelwm2m,
    isLoading: isLoadingCreateTemplatelwm2m,
    isSuccess: isSuccessCreateTemplatelwm2m,
  } = useCreateTemplatelwm2m()
  const { register, formState, handleSubmit, control, watch, reset } = useForm<
    CreateTemplatelwm2mDTO['data']
  >({
    resolver: templatelwm2mSchema && zodResolver(templatelwm2mSchema),
    defaultValues: {
      name: '',
      rule_chain_id: '',
      transport_config: { protocol: 'lwm2m', config: {}, info: null },
    },
  })
  // const { fields, append, remove } = useFieldArray({
  //   name: 'attributes',
  //   control,
  // })
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
  console.log('filterLWM2M', filterLWM2M)

  const [openAccordion, setOpenAccordion] = useState()
  const handleAccordionChange = value => {
    setOpenAccordion(value)
  }

  //const [clickedItemId, setClickedItemId] = useState({});
  // const { fields, append, remove } = useFieldArray({
  //   name: 'attributes',
  //   control,
  // })
  // console.log('fields', fields)
  const [clickedItemIds, setClickedItemIds] = useState([]);
  const handleCheckboxChange = (itemId) => {
    // Toggle the presence of itemId in the array
    setClickedItemIds((prevIds) => {
      if (prevIds.includes(itemId)) {
        // If itemId is already in the array, remove it
        return prevIds.filter((id) => id !== itemId);
      } else {
        // If itemId is not in the array, add it
        return [...prevIds, itemId];
      }
    });
  };

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
        setFilterLWM2M([])
      }}
    >
      <form
        className="w-full space-y-5"
        id="create-template"
        onSubmit={handleSubmit(async values => {
          console.log(values, 'check submit values');

          // const dataCreateTemplatelwm2m = await mutateAsyncCreateTemplatelwm2m({
          //   data: {
          //     project_id: projectId,
          //     rule_chain_id: values.rule_chain_id,
          //     name: values.name,
          //     transport_config: values.transport_config,
          //   },
          // })
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
          {/* <InputField
            label={t('cloud:device_template.add_template.name')}
            error={formState.errors['name']}
            registration={register('name')}
          /> */}
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
              placeholder={t(
                'cloud:device_template.add_template.choose_flow_id',
              )}
              handleClearSelectDropdown={() => setFilterLWM2M([])}
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
              {filterLWM2M.map((lw2m2, index) => (
                <AccordionItem
                  key={index}
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
                          <Checkbox className="mb-1 ml-5 flex h-5 w-5" />
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
                          return (
                            <section key={item['@ID']} className="mt-3">
                              <div className="grid grow grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-2">
                                <div className="flex">
                                  <div className="flex items-center justify-center">
                                    #{item['@ID']} {item.Name}
                                  </div>
                                  {/* <Checkbox 
                                    className="ml-auto mr-3 mt-2 flex h-5 w-5" 
                                  /> */}
                                   <Controller
                                    control={control}
                                    name={`transport_config.config.${lw2m2.LWM2M.Object.Name}`}
                                    render={({ field: { onChange, config, ...field } }) => {
                                    //   const handleCheckboxChange = (e) => {

                                         const id = item['@ID']
                                    //     // Cập nhật giá trị biến state nếu cần
                                    //     setClickedItemId(prevIds => `${prevIds}/${itemId}`);
                                    //     onChange(e);
                                    //     console.log('Clicked on checkbox with ID:', itemId);
              
                                    //   };
                                    //   return (
                                    //     <Checkbox
                                    //       {...field}
                                    //       checked={value}
                                    //       onCheckedChange={handleCheckboxChange}
                                    //     />
                                    //   );
                                    return (
                                      <Checkbox
                                        className="ml-auto mr-3 mt-2 flex h-5 w-5"
                                        {...field}
                                        checked={config}
                                        onCheckedChange={(e) => {
                                          handleCheckboxChange(id);
                                          onChange(e);
                                        }}
                                      />
                                    );
                                     }}
                                  />
                                </div>
                                <div className="grid grow grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-1">
                                  <InputField
                                    className=""
                                    // label={t('cloud:org_manage.org_manage.add_attr.name')}
                                    // error={formState?.errors?.attributes?.[index]?.attribute_key}
                                    // registration={register(
                                    //   `attributes.${index}.attribute_key` as const,
                                    // )}
                                  />
                                </div>
                              </div>
                            </section>
                          )
                        }
                        return null
                      })}
                      {clickedItemIds.length > 0 && (
                        <div>
                          <p>{`${lw2m2.LWM2M.Object.ObjectID}/0/${clickedItemIds.join('/')}: ${lw2m2.LWM2M.Object.Name}`}</p>
                        </div>
                      )}
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