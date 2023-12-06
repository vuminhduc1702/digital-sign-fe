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
//   const [fileidxml, setfileidxml] = useState<string | null>()
  const [selectedOptions, setSelectedOptions] = useState<{ label: string; value: string }[]>([])
  const selectedOptionValues = selectedOptions.map(option => option.value)
//   const [serverData, setServerData] = useState([])
//   const [loading, setLoading] = useState(false)
//   useEffect(() => {
//     const fetchDataFromServer = async () => {
//       try {
//         setLoading(true)
//         const selectedOptionValues = selectedOptions.map(option => option.value)
//         console.log(selectedOptionValues)

//         const promises = selectedOptionValues.map(async selectedValue => {
//           const response = await axios.get(`http://api.innoway.vn/file/publishjson/${selectedValue}.json`)
//           console.log(response)
//           return response.data
//         })
//         const responseData: any[] = await Promise.all(promises)
//         setServerData(responseData)
//       } catch (error) {
//         console.error('Lỗi khi lấy dữ liệu từ server:', error)
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (selectedOptions.length > 0) {
//       fetchDataFromServer()
//     }
//   }, [selectedOptions])
    const {data} = useGetXMLdata({
        fileId: selectedOptionValues.join(','),
        config: { enabled: !!selectedOptionValues, suspense: false },
    })
    console.log(selectedOptionValues.join(','))
    // const { acc: XMLFlattenData } = flattenData(
    //     XMLdata?.data,
    //     ['id', 'name'],
    //   )

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
                  onChange={(selectedOptions) => setSelectedOptions(selectedOptions)}
                //   onChange={(fileidxml) => setfileidxml(fileidxml)}
                  isOptionDisabled={option => option.label === t('loading:flow_id')}
                  noOptionsMessage={() => t('table:no_in_flow_id')}
                  // loadingMessage={() => t('loading:flow_id')}
                  // isLoading={true}
                  // placeholder={t('cloud:device_template.add_template.choose_flow_id')}
                />
                {/* {loading ? (
                    <p>Đang tải...</p>
                  ) : (
                    serverData.length > 0 && (
                      <div>
                        <h3>Dữ liệu từ server:</h3>
                          {serverData}
                      </div>
                    )
                )} */}
                {/* <p className="text-body-sm text-primary-400">
                  {formState?.errors?.rule_chain_id?.message}
                </p>    */}
          </div>
          {/* <div className="space-y-1">
                <CreateTableXMl/>
          </div> */}
        </>
      </form>
    </FormDrawer>
  )
}
