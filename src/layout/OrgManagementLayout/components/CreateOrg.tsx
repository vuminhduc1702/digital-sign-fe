import { useRef, useState } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import {
  Form,
  FormDrawer,
  InputField,
  SelectDropdown,
  type SelectOption,
  TextAreaField,
} from '~/components/Form'
import FileField from '~/components/Form/FileField'
import {
  useCreateOrg,
  useUploadImage,
  type CreateOrgDTO,
  type UploadImageDTO,
} from '../api'
import { descSchema, nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { type OrgList } from '~/layout/MainLayout/types'
import { queryClient } from '~/lib/react-query.ts'
import { flattenData } from '~/utils/misc.ts'
import { useDefaultCombobox } from '~/utils/hooks.ts'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const orgSchema = z.object({
  name: nameSchema,
  org_id: z.string(),
  description: descSchema,
  image: z.string().optional(),
})

export const uploadImageSchema = z.object({
  file: z.string(),
})

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateOrg() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useCreateOrg()
  const [optionOrg, setOptionOrg] = useState<SelectOption>({
    label: '',
    value: '',
  })

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const defaultComboboxOrgData = useDefaultCombobox('org')
  const orgSelectOptions = [defaultComboboxOrgData, ...orgFlattenData]

  const clearData = () => {
    setOptionOrg({
      label: '',
      value: '',
    })
  }

  const fileInputRef = useRef()
  const { mutate: mutateUploadImage, isLoading: isLoadingUploadImage } =
    useUploadImage()

  return (
    <FormDrawer
      isDone={isSuccess}
      resetData={clearData}
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:org_manage.org_manage.add_org.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-org"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateOrgDTO['data'], typeof orgSchema>
        id="create-org"
        onSubmit={values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: values.org_id,
              name: values.name,
              description: values.description,
            },
          })
        }}
        schema={orgSchema}
      >
        {({ register, formState, control, setValue }) => {
          console.log('zod errors: ', formState.errors)

          return (
            <>
              <InputField
                label={t('cloud:org_manage.org_manage.add_org.name')}
                error={formState.errors['name']}
                registration={register('name')}
              />
              <div className="space-y-1">
                <SelectDropdown
                  isClearable={true}
                  label={t('cloud:org_manage.device_manage.add_device.parent')}
                  name="org_id"
                  control={control}
                  options={
                    orgSelectOptions?.map(org => ({
                      label: org?.name,
                      value: org?.id,
                    })) || [{ label: t('loading:org'), value: '' }]
                  }
                  onChange={e => {
                    setOptionOrg(e)
                    setValue('org_id', e?.value)
                  }}
                  value={optionOrg}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.org_id?.message === 'Required'
                    ? t('cloud:org_manage.org_manage.add_org.choose_org')
                    : formState?.errors?.org_id?.message}
                </p>
              </div>
              <TextAreaField
                label={t('cloud:org_manage.org_manage.add_org.desc')}
                error={formState.errors['description']}
                registration={register('description')}
              />
              <Form<UploadImageDTO['data'], typeof uploadImageSchema>
                onSubmit={values => {
                  mutate({
                    data: {
                      project_id: projectId,
                    },
                  })
                }}
                schema={uploadImageSchema}
              >
                {({ formState, control }) => {
                  console.log('zod errors: ', formState.errors)

                  return (
                    <FileField
                      label={t('cloud:org_manage.org_manage.add_org.avatar')}
                      error={formState.errors['file']}
                      control={control}
                      name="upload-orgAvatar"
                      ref={fileInputRef}
                    />
                  )
                }}
              </Form>
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
