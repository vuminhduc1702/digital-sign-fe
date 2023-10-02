import { useRef, useState } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '~/components/Button'
import {
  Form,
  FormDrawer,
  InputField,
  SelectDropdown,
  TextAreaField,
  type SelectOptionString,
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
import defaultOrgImage from '~/assets/images/default-org.png'

export const orgSchema = z.object({
  name: nameSchema,
  org_id: z.string().optional(),
  description: descSchema,
  image: z.string().optional(),
})

const MAX_FILE_SIZE = 500000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
export const uploadImageSchema = z.object({
  file: z
    .instanceof(File, { message: 'Vui lòng chọn ảnh tải lên' })
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      `Ảnh cho phép dung lượng tối đa 5MB`,
    )
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Chỉ cho phép tải ảnh định dạng .jpg, .jpeg, .png',
    ),
})

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateOrg() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useCreateOrg()
  const [optionOrg, setOptionOrg] = useState<SelectOptionString | null>()

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const clearData = () => {
    setOptionOrg(null)
  }

  const fileInputRef = useRef()
  const {
    data: dataUploadImage,
    mutate: mutateUploadImage,
    isLoading: isLoadingUploadImage,
  } = useUploadImage()
  const {
    formState: formStateUploadImage,
    control: controlUploadImage,
    handleSubmit: handleSubmitUploadImage,
    setValue: setValueUploadImage,
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })
  const avatarRef = useRef<HTMLImageElement>(null)
  console.log('zod image upload error: ', formStateUploadImage.errors)

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
              org_id: optionOrg?.value,
              name: values.name,
              description: values.description,
              image: dataUploadImage?.data?.link,
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
                    orgFlattenData?.map(org => ({
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
              <FileField
                label={t('cloud:org_manage.org_manage.add_org.avatar')}
                error={formStateUploadImage.errors['file']}
                control={controlUploadImage}
                name="upload-orgAvatar"
                ref={fileInputRef}
                onChange={event => {
                  const formData = new FormData()
                  formData.append('file', event.target.files[0])
                  setValueUploadImage('file', formData.get('file'))
                  const reader = new FileReader()
                  reader.readAsDataURL(event.target.files[0])
                  reader.onload = e => {
                    if (avatarRef.current != null && e.target != null) {
                      avatarRef.current.src = e.target.result as string
                    }
                  }
                }}
              />
              <img
                src={defaultOrgImage}
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.onerror = null
                  target.src = defaultOrgImage
                }}
                alt="Organization"
                className="h-36 w-32"
                ref={avatarRef}
              />
              <Button
                className="border-none"
                style={{ justifyContent: 'flex-start' }}
                variant="primary"
                size="square"
                onClick={handleSubmitUploadImage(values => {
                  mutateUploadImage({
                    data: {
                      project_id: projectId,
                      file: values.file,
                    },
                  })
                  setValueUploadImage('file', { file: null as unknown as File })
                })}
                isLoading={isLoadingUploadImage}
              >
                {t('cloud:org_manage.org_manage.add_org.upload_ava')}
              </Button>
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
