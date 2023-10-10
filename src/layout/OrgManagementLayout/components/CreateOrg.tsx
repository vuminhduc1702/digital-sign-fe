import { useEffect, useRef, useState } from 'react'
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
  useUpdateOrg,
} from '../api'
import { descSchema, nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { type OrgList } from '~/layout/MainLayout/types'
import { queryClient } from '~/lib/react-query.ts'
import { flattenData } from '~/utils/misc.ts'
import { useDefaultCombobox } from '~/utils/hooks.ts'
import i18n from '~/i18n'

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

export const MAX_FILE_SIZE = 5000000
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
export const uploadImageSchema = z.object({
  file: z
    .instanceof(File, {
      message: i18n.t('cloud:org_manage.org_manage.add_org.choose_avatar'),
    })
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      i18n.t('validate:image_max_size'),
    )
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('validate:image_type'),
    ),
})

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateOrg() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const defaultOrgOptions = 
  {
    label: t('cloud:org_manage.org_manage.add_org.no_org'),
    value: ''
  }

  const [optionOrg, setOptionOrg] = useState<SelectOptionString | null>(defaultOrgOptions)

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData?.map(org => ({
    label: org?.name,
    value: org?.id
  })).concat(defaultOrgOptions)
  .sort((a,b) => a.value.length - b.value.length)

  const clearData = () => {
    setOptionOrg(null)
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const avatarRef = useRef<HTMLImageElement>(null)
  const {
    control: controlUploadImage,
    setValue: setValueUploadImage,
    getValues: getValueUploadImage,
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })
  const { mutate: mutateUpdateOrg } = useUpdateOrg()

  const {
    data: dataCreateOrg,
    mutate: mutateCreateOrg,
    isLoading: isLoadingCreateOrg,
    isSuccess: isSuccessCreateOrg,
  } = useCreateOrg()

  const {
    data: dataUploadImage,
    mutate: mutateUploadImage,
    isSuccess: isSuccessUploadImage,
  } = useUploadImage()

  useEffect(() => {
    if (isSuccessCreateOrg && dataCreateOrg != null) {
      mutateUploadImage({
        data: {
          project_id: projectId,
          file: getValueUploadImage('file'),
        },
      })
      handleResetDefaultImage()
    }
  }, [dataCreateOrg])

  useEffect(() => {
    if (
      isSuccessUploadImage &&
      dataUploadImage != null &&
      dataCreateOrg != null
    ) {
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
  }, [dataUploadImage])

  function handleResetDefaultImage() {
    if (avatarRef.current != null) {
      avatarRef.current.src = defaultOrgImage
      fetch(avatarRef.current.src)
        .then(res => res.blob())
        .then(blob => {
          const defaultFile = new File([blob], 'default-project.png', blob)
          const formData = new FormData()
          formData.append('file', defaultFile)
          setValueUploadImage(
            'file',
            formData.get('file') as unknown as { file: File },
          )
        })
    }
  }

  const [uploadImageErr, setUploadImageErr] = useState('')

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
          isLoading={isLoadingCreateOrg}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateOrgDTO['data'], typeof orgSchema>
        id="create-org"
        onSubmit={values => {
          mutateCreateOrg({
            data: {
              project_id: projectId,
              org_id: optionOrg?.value,
              name: values.name,
              description: values.description,
            },
          })
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
              <div className="mb-3 space-y-1">
                <FileField
                  label={t('cloud:project_manager.add_project.avatar')}
                  control={controlUploadImage}
                  name="upload-image"
                  ref={fileInputRef}
                  onChange={event => {
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
                style={{ justifyContent: 'flex-start' }}
                variant="secondaryLight"
                size="square"
                onClick={handleResetDefaultImage}
              >
                {t('cloud:project_manager.add_project.upload_ava_default')}
              </Button>
              <div style={{ fontSize: '12px' }}>
                {t('cloud:project_manager.add_project.upload_instruction')}
              </div>
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
