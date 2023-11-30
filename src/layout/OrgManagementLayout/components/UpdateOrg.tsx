import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '~/components/Button'
import { InputField, SelectDropdown, TextAreaField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { type UpdateOrgDTO, useUpdateOrg, useUploadImage } from '../api'
import { orgSchema } from './CreateOrg'
import { flattenData } from '~/utils/misc'
import FileField from '~/components/Form/FileField'
import { API_URL } from '~/config'
import { useUpdateOrgForOrg } from '../api/updateOrgForOrg'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  useResetDefaultImage,
} from '~/utils/hooks'
import { useGetOrgs } from '~/layout/MainLayout/api'
import storage from '~/utils/storage'

import { type OrgMapType } from './OrgManageSidebar'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import defaultOrgImage from '~/assets/images/default-org.png'

const orgUpdateSchema = orgSchema.required({ org_id: true })

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

  const {
    handleResetDefaultImage,
    avatarRef,
    uploadImageErr,
    setUploadImageErr,
    controlUploadImage,
    setValueUploadImage,
    getValueUploadImage,
    formStateUploadImage,
  } = useResetDefaultImage(defaultOrgImage)

  const { id: projectId } = storage.getProject()

  const { data: orgData } = useGetOrgs({ projectId })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const { acc: selectedUpdateOrgChildren } = flattenData(
    selectedUpdateOrg.children,
    ['id'],
    'children',
  )
  const orgSelectOptions = orgFlattenData
    ?.map(org => ({
      label: org?.name,
      value: org?.id,
    }))
    .filter(
      org =>
        org.value !== selectedUpdateOrg.id &&
        !selectedUpdateOrgChildren.some(child => child.id === org.value),
    )

  const { mutate, isLoading, isSuccess } = useUpdateOrg()
  const {
    mutateAsync: mutateAsyncUploadImage,
    isLoading: isLoadingUploadImage,
  } = useUploadImage()

  const { mutate: mutateUpdateOrgForOrg } = useUpdateOrgForOrg()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { register, formState, control, setValue, getValues, handleSubmit } =
    useForm<UpdateOrgDTO['data']>({
      resolver: orgUpdateSchema && zodResolver(orgUpdateSchema),
      defaultValues: {
        name: selectedUpdateOrg.name,
        description:
          selectedUpdateOrg.description !== 'undefined'
            ? selectedUpdateOrg.description
            : '',
        org_id: selectedUpdateOrg.org_id,
      },
    })

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    if (selectedUpdateOrg) {
      setValue('name', selectedUpdateOrg.name)
      setValue(
        'description',
        selectedUpdateOrg.description !== 'undefined'
          ? selectedUpdateOrg.description
          : '',
      )
      setValue('org_id', selectedUpdateOrg.org_id)
    }
    setUploadImageErr('')
  }, [isOpen, selectedUpdateOrg])

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
            isLoading={isLoading || isLoadingUploadImage}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
            // disabled={!formState.isDirty && !formStateUploadImage.isDirty}
          />
        </>
      )}
    >
      <form
        id="update-org"
        className="w-full space-y-6"
        onSubmit={handleSubmit(async values => {
          if (
            getValues('org_id') !== selectedUpdateOrg.org_id &&
            getValues('org_id') != null
          ) {
            mutateUpdateOrgForOrg({
              data: {
                ids: [selectedUpdateOrg.id],
                org_id: getValues('org_id'),
              },
            })
          }
          const defaultFileName = avatarRef.current?.src.split('/')
          if (getValueUploadImage('file') != null) {
            const dataUploadImage = await mutateAsyncUploadImage({
              data: {
                project_id: selectedUpdateOrg.id,
                file: getValueUploadImage('file'),
              },
            })
            mutate({
              data: {
                name: values.name,
                description: values.description,
                org_id: getValues('org_id'),
                image: dataUploadImage?.data?.link,
              },
              org_id: selectedUpdateOrg?.id,
            })
          }

          if (
            getValueUploadImage('file') == null ||
            (getValueUploadImage('file') != null &&
              defaultFileName?.[defaultFileName?.length - 1] ===
                'default-project.png')
          ) {
            mutate({
              data: {
                name: values.name,
                description: values.description,
                org_id: values.org_id,
              },
              org_id: selectedUpdateOrg?.id,
            })
          }
        })}
      >
        <>
          <InputField
            label={t('cloud:org_manage.org_manage.add_org.name')}
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
                orgSelectOptions != null
                  ? orgSelectOptions
                  : [{ label: t('loading:org'), value: '' }]
              }
              noOptionsMessage={() => t('table:no_in_org')}
              placeholder={t('cloud:org_manage.org_manage.add_org.choose_org')}
              defaultValue={orgSelectOptions.find(
                org => org.value === selectedUpdateOrg.org_id,
              )}
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
            <p className="text-body-sm text-primary-400">{uploadImageErr}</p>
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
      </form>
    </Drawer>
  )
}