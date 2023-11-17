import { useRef, useState } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'

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
  useUpdateOrg,
} from '../api'
import { descSchema, nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { type OrgList } from '~/layout/MainLayout/types'
import { queryClient } from '~/lib/react-query.ts'
import { flattenData } from '~/utils/misc.ts'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  useResetDefaultImage,
} from '~/utils/hooks'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import defaultOrgImage from '~/assets/images/default-org.png'

export const orgSchema = z.object({
  name: nameSchema,
  org_id: z.string().optional(),
  description: descSchema,
  image: z.string().optional(),
  project_id: z.string().optional(),
})

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateOrg() {
  const { t } = useTranslation()

  const {
    handleResetDefaultImage,
    avatarRef,
    uploadImageErr,
    setUploadImageErr,
    controlUploadImage,
    setValueUploadImage,
    getValueUploadImage,
  } = useResetDefaultImage(defaultOrgImage)

  const { id: projectId } = storage.getProject()

  const [optionOrg, setOptionOrg] = useState<SelectOptionString | null>()
  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData
    ?.map(org => ({
      label: org?.name,
      value: org?.id,
    }))
    .sort((a, b) => a.value.length - b.value.length)

  const clearData = () => {
    setOptionOrg(null)
    setUploadImageErr('')
    handleResetDefaultImage(defaultOrgImage)
  }

  const { mutate: mutateUpdateOrg } = useUpdateOrg({ isOnCreateOrg: true })

  const {
    mutateAsync: mutateAsyncCreateOrg,
    isLoading: isLoadingCreateOrg,
    isSuccess: isSuccessCreateOrg,
  } = useCreateOrg()

  const {
    mutateAsync: mutateAsyncUploadImage,
    isLoading: isLoadingUploadImage,
  } = useUploadImage()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <FormDrawer
      isDone={isSuccessCreateOrg}
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
          isLoading={isLoadingCreateOrg || isLoadingUploadImage}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateOrgDTO['data'], typeof orgSchema>
        id="create-org"
        onSubmit={async values => {
          const dataCreateOrg = await mutateAsyncCreateOrg({
            data: {
              project_id: projectId,
              org_id: optionOrg?.value,
              name: values.name,
              description: values.description,
            },
          })
          if (getValueUploadImage('file') != null) {
            const dataUploadImage = await mutateAsyncUploadImage({
              data: {
                project_id: projectId,
                file: getValueUploadImage('file'),
              },
            })
            mutateUpdateOrg({
              data: {
                name: dataCreateOrg.name,
                description: dataCreateOrg.description,
                org_id: dataCreateOrg.org_id,
                image: dataUploadImage.data.link,
              },
              org_id: dataCreateOrg.id,
            })
          }
        }}
        schema={orgSchema}
      >
        {({ register, formState, control, setValue }) => {
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
                    orgSelectOptions || [{ label: t('loading:org'), value: '' }]
                  }
                  onChange={e => {
                    setOptionOrg(e)
                    setValue('org_id', e?.value)
                  }}
                  value={optionOrg}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.org_id?.message}
                </p>
              </div>
              <TextAreaField
                label={t('cloud:org_manage.org_manage.add_org.desc')}
                error={formState.errors['description']}
                registration={register('description')}
              />
              <div className="mb-3 space-y-1">
                <FileField
                  label={t('cloud:project_manager.add_project.avatar')}
                  control={controlUploadImage}
                  name="upload-image"
                  ref={fileInputRef}
                  onChange={event => {
                    setUploadImageErr('')
                    const file = event.target.files[0]
                    const formData = new FormData()
                    formData.append('file', event.target.files[0])
                    setValueUploadImage(
                      'file',
                      formData.get('file') as unknown as { file: File },
                    )

                    if (file.size > MAX_FILE_SIZE) {
                      setUploadImageErr(t('validate:image_max_size'))
                      return false
                    }
                    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                      setUploadImageErr(t('validate:image_type'))
                      return false
                    }

                    const reader = new FileReader()
                    reader.readAsDataURL(file)
                    reader.onload = e => {
                      if (
                        avatarRef.current != null &&
                        e.target != null &&
                        reader.readyState === 2
                      ) {
                        avatarRef.current.src = e.target.result as string
                      }
                    }
                  }}
                />
                <p className="text-body-sm text-primary-400">
                  {uploadImageErr}
                </p>
              </div>
              <img
                src={defaultOrgImage}
                alt="Project"
                className="mb-3 h-36 w-32"
                ref={avatarRef}
              />
              <Button
                className="mb-3 border-none"
                variant="secondaryLight"
                size="square"
                onClick={handleResetDefaultImage}
              >
                {t('cloud:project_manager.add_project.upload_ava_default')}
              </Button>
              <div className="text-body-xs">
                {t('cloud:project_manager.add_project.upload_instruction')}
              </div>
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
