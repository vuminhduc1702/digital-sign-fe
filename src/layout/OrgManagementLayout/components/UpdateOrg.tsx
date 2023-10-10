import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  type SelectOptionString,
  TextAreaField,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { type UpdateOrgDTO, useUpdateOrg, useUploadImage, UploadImageDTO } from '../api'
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE, orgSchema, uploadImageSchema } from './CreateOrg'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'

import { type OrgMapType } from './OrgManageSidebar'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { type OrgList } from '~/layout/MainLayout/types'
import { useUpdateOrgForOrg } from '../api/updateOrgForOrg'
import defaultOrgImage from '~/assets/images/default-org.png'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FileField from '~/components/Form/FileField'
import { API_URL } from '~/config'

export type UpdateOrg = {
  name: string,
  description: string,
  org_id?: string,
  image?: string
}

export function UpdateOrg({
  close,
  isOpen,
  selectedUpdateOrg,
}: {
  close: () => void
  isOpen: boolean
  selectedUpdateOrg: OrgMapType
}) {
  const { t } = useTranslation()

  const defaultOrgOptions = 
  {
    label: t('cloud:org_manage.org_manage.add_org.no_org'),
    value: ''
  }

  const [optionOrg, setOptionOrg] = useState<SelectOptionString>()

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
  .filter(org => org.value != selectedUpdateOrg.id)

  useEffect(() => {
    if (selectedUpdateOrg.id) {
      if (selectedUpdateOrg.parent_name) {
        setOptionOrg({
          label: selectedUpdateOrg.parent_name,
          value: selectedUpdateOrg.id,
        })
      } else {
        setOptionOrg(defaultOrgOptions)
      }
    }
  }, [selectedUpdateOrg])

  const { mutate: mutate, isLoading, isSuccess } = useUpdateOrg()
  const {
    data: dataUploadImage,
    mutate: mutateUploadImage,
    isSuccess: isSuccessUploadImage,
  } = useUploadImage()

  const { mutate: mutateUpdateOrgForOrg } = useUpdateOrgForOrg()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const avatarRef = useRef<HTMLImageElement>(null)
  const {
    control: controlUploadImage,
    setValue: setValueUploadImage,
    getValues: getValueUploadImage,
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })

  function handleResetDefaultImage() {
    if (avatarRef.current != null) {
      avatarRef.current.src = defaultOrgImage
      fetch(avatarRef.current.src)
        .then(res => res.blob())
        .then(blob => {
          const defaultFile = new File([blob], 'default-org.png', blob)
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

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const [updateDataForm, setUpdateDataForm] = useState<UpdateOrg>({
    name: '',
    description: '',
    org_id: '',
    image: ''
  })

  function handleSubmitUpdate(updateData: UpdateOrg) {
    mutate({
      data: {
        name: updateData.name,
        description: updateData.description,
        org_id: optionOrg?.value,
        image: dataUploadImage?.data?.link
      },
      org_id: selectedUpdateOrg?.id,
    })
  }
  useEffect(() => {
    if (isSuccessUploadImage && dataUploadImage != null) {
      handleSubmitUpdate(updateDataForm)
    }
  }, [dataUploadImage])


  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.org_manage.add_org.edit')}
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
            form="update-org"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      <Form<UpdateOrgDTO['data'], typeof orgSchema>
        id="update-org"
        onSubmit={values => {
          mutateUploadImage({
            data: {
              project_id: selectedUpdateOrg.id,
              file: getValueUploadImage('file'),
            },
          })
          handleResetDefaultImage()
          setUpdateDataForm(values)
        }}
        options={{
          defaultValues: {
            name: selectedUpdateOrg.name,
            description:
              selectedUpdateOrg?.description !== 'undefined'
                ? selectedUpdateOrg?.description
                : '',
            org_id: selectedUpdateOrg?.id,
          },
        }}
        schema={orgSchema}
      >
        {({ register, formState, control, setValue }) => {
          return (
            <>
              <InputField
                label={t('cloud:org_manage.org_manage.add_org.name') ?? 'Name'}
                error={formState.errors['name']}
                registration={register('name')}
              />
              <div className="space-y-1">
                <SelectDropdown
                  isClearable={false}
                  label={t('cloud:org_manage.device_manage.add_device.parent')}
                  name="org_id"
                  control={control}
                  options={
                    orgSelectOptions || [{ label: t('loading:org'), value: '' }]
                  }
                  onChange={e => {
                    setOptionOrg(e)
                    mutateUpdateOrgForOrg({
                      data: {
                        ids: [e?.value],
                        org_id: selectedUpdateOrg?.id,
                      },
                    })
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
                label={
                  t('cloud:org_manage.org_manage.add_org.desc') ?? 'Description'
                }
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
                src={`${
                  selectedUpdateOrg?.image !== ''
                    ? `${API_URL}/file/${selectedUpdateOrg?.image}`
                    : defaultOrgImage
                }`}
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
    </Drawer>
  )
}
