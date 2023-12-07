import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Button } from '~/components/Button'
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
  type CreateTemplateDTO,
  useUpdateTemplate,
} from '../api'
import storage from '~/utils/storage'
import { Checkbox } from '~/components/Checkbox'
import { flattenData } from '~/utils/misc.ts'
import { attrSchema, nameSchema } from '~/utils/schemaValidation'
import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { useGetXMLdata } from '../api/getXMLdata'
import LwM2MData from '~/assets/locales/Describe.json';
import { type LwM2M }   from '../types'
import { axios } from '~/lib/axios'
import { CreateTableXMl } from './CreateTableXMl'
import { PATHS } from '~/routes/PATHS'
import { ChevronDown } from 'lucide-react'
import dammayIcon from '~/assets/icons/sb-dammay.svg'
import {
    Accordion,
    AccordionItem,
    AccordionContent,
    AccordionTrigger,
  } from '~/components/Accordion'
import { NavLink } from '~/components/Link'
import { useLocation } from 'react-router-dom'
export const templateAttrSchema = z.object({
  name: nameSchema,
  rule_chain_id: z.string().optional(),
  attributes: z.array(attrSchema),
})

export default function CreateTemplateLwM2M() {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()
  const [items, setItems] = useState<LwM2M[]>([]);
  useEffect(() => {
    const LwM2MsData: LwM2M[] = LwM2MData.infos;
    setItems(LwM2MsData);
  }, []);
  const LwM2MSelectOptions = items?.map(item => ({
    label: `${item.module_name} #${item.file_id}_${item.version}`,
    value: `${item.file_id}`
  }))

  const { mutate: mutateUpdateTemplate } = useUpdateTemplate({ isOnCreateTemplate: true })

  const {
    mutateAsync: mutateAsyncCreateTemplate,
    isLoading: isLoadingCreateTemplate,
    isSuccess: isSuccessCreateTemplate,
  } = useCreateTemplate()
 
  const { register, formState, handleSubmit, control} = useForm<
    CreateTemplateDTO['data']
  >({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
    defaultValues: {
      name: '',
      rule_chain_id: '',
      attributes: [{ attribute_key: '', value: '', logged: true, value_t: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  })
  const [selectedLwM2Mdata, setselectedLwM2Mdata] = useState<{ label: string; value: string }[]>([])
  const selectedName = selectedLwM2Mdata.map(option => option.label)
  const selectedOption = selectedLwM2Mdata.map(option => option.value)
  const lastSelected = (selectedOption.join(',')).length > 0 ? selectedOption[selectedOption.length - 1] : '';
  const {data: XMLdata, isLoading: isLoadingLwM2M } = useGetXMLdata({
    fileId: lastSelected,
    config: { enabled: !!lastSelected, suspense: false },
  })
  const { acc: XMLFlattenData } = flattenData(XMLdata?.LWM2M.Object.Resources.Item, [
    '@ID','Name','Operations',])

//   const [accordionState, setAccordionState] = useState({});
//   const handleOptionClick = (selectedName: string) => {
//       setAccordionState((prevState) => ({
//         ...prevState,
//         [selectedName]: !prevState[selectedName],
//       }));
//     };
    // const renderSubContent = (selectedName: string) => {
    //     // Chỉ render nếu accordion được mở
    //     if (accordionState[selectedName]) {
    //       return (
    //         <div>
    //           {/* Render nội dung dựa trên option */}
    //           <p>{`Content for ${selectedName}`}</p>
    //         </div>
    //       );
    //     }
    //     return null;
    //   };


    // const location = useLocation()
    // const routerLink = location.pathname?.split('/')
    // const [value, setValue] = useState('cloud')
    // useEffect(() => {
    //   setValue(routerLink[1])
    // }, [routerLink[1]])
    const [value, setValue] = useState(null)
    const [isAccordionOpen, setIsAccordionOpen] = useState(false)
    const handleAccordionChange = (newValue) => {
        setValue(newValue)
        setIsAccordionOpen(!isAccordionOpen)
    }
  return (
    
    <FormDrawer
      isDone={isLoadingCreateTemplate}
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
          isLoading={isSuccessCreateTemplate}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <form
        className="w-full space-y-5"
        id="create-template"
        onSubmit={handleSubmit(async values => {
          const dataCreateTemplate = await mutateAsyncCreateTemplate({
            data: {
              project_id: projectId,
              rule_chain_id: values.rule_chain_id,
              name: values.name,
              attributes: values.attributes
            },
          })
          mutateUpdateTemplate({
            data: {
              name: dataCreateTemplate.name,
              rule_chain_id: dataCreateTemplate.rule_chain_id,
              attributes: dataCreateTemplate.attributes,
            },
            templateId: dataCreateTemplate.id,
          })
        })}
      >
        <>
          {/* <Button
            className="h-9 w-9 rounded-md"
            variant="trans"
            size="square"
            startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
            onClick={() =>
              append({
                attribute_key: '',
                value: '',
                logged: true,
                value_t: '',
              }
              )
            }
          /> */}
          <InputField
            label={t('cloud:device_template.add_template.name')}
            error={formState.errors['name']}
            registration={register('name')}
          />
          <div className="space-y-1">
                <SelectDropdown
                  isClearable={true}
                  label={t('cloud:device_template.add_template.flow')}
                  name="rule_chain_id"
                  control={control}
                  options={LwM2MSelectOptions}
                  isMulti={true}
                  closeMenuOnSelect={false}
                  onChange={(selectedLwM2Mdata) => setselectedLwM2Mdata(selectedLwM2Mdata)}
                // isOptionDisabled={option => option.label === t('loading:flow_id')}
                //   noOptionsMessage={() => t('table:no_in_flow_id')}
                //   loadingMessage={() => t('loading:flow_id')}
                //isLoading={true}
                //   placeholder={t('cloud:device_template.add_template.choose_flow_id')}
                />
                {/* <p className="text-body-sm text-primary-400">
                  {formState?.errors?.rule_chain_id?.message}
                </p>    */}
          </div>
           {/* <div>{selectedName}</div> */}
           <Accordion
                type="single"
                collapsible
                value={value}
                onValueChange={handleAccordionChange}
                className='bg-gray-100 rounded-md shadow-lg mb-2 '
                >
                {selectedName.map((name, index) => (
                    <AccordionItem key={index} value={name} className="border-none">
                    <div className='flex items-center ml-3 gap-3 '>
                    <AccordionTrigger className="mr-3">
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </AccordionTrigger>
                    {name}
                    </div>
                    {isAccordionOpen && value === name && (
                        <div className="mt-3 gap-3 rounded-md bg-slate-200 px-2 py-4">
                            <div className='border-b-2 border-gray-300 grid grow	grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2'>
                                    <div className="flex mb-2">
                                    <div className=" flex items-end "> <p>{t('#ID Resource name')}</p> </div>
                                        <div className=" ml-auto">
                                        <Checkbox
                                            className="flex h-5 w-5 ml-5 mb-1"
                                        />
                                        {t('Attribute')}
                                        </div>
                                    </div>
                                    <div className='flex items-end mb-2 ml-2'>
                                        {t('Key name')}
                                    </div> 
                            </div>
                            <div>
                            {XMLFlattenData?.map((item) => {
                                if (item.Operations === 'RW' || item.Operations === 'R') {
                                return (
                                    <section 
                                    key={item['@ID']}
                                    className='mt-3'
                                    >
                                    <div className='grid grow grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-2'>
                                        <div className="flex">
                                        <div className="flex items-center justify-center">
                                            #{item['@ID']} {item.Name}
                                        </div>
                                        <Checkbox
                                            className="flex h-5 w-5 mt-2 mr-3 ml-auto"
                                        />
                                        </div>
                                        <div className='grid grow grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-1'>
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
                            </div>
                        </div>
                    )}
                    </AccordionItem>
                ))}
            </Accordion>
    
          
        </>
      </form>
    </FormDrawer>
  )
}
