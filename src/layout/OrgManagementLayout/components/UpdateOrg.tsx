import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '~/components/Button'
import {
  InputField,
  SelectDropdown,
  type SelectOptionString,
  TextAreaField,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { type UpdateOrgDTO, useUpdateOrg, useUploadImage } from '../api'
import { orgSchema } from './CreateOrg'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import FileField from '~/components/Form/FileField'
import { API_URL } from '~/config'
import { useUpdateOrgForOrg } from '../api/updateOrgForOrg'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  useResetDefaultImage,
} from '~/utils/hooks'

import { type OrgMapType } from './OrgManageSidebar'
import { type OrgList } from '~/layout/MainLayout/types'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import defaultOrgImage from '~/assets/images/default-org.png'

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
  } = useResetDefaultImage(defaultOrgImage)

  const [optionOrg, setOptionOrg] = useState<SelectOptionString>()

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
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
    .sort((a, b) => a.value.length - b.value.length)
    .filter(
      org =>
        org.value !== selectedUpdateOrg.id &&
        !selectedUpdateOrgChildren.some(child => child.id === org.value),
    )

  useEffect(() => {
    if (selectedUpdateOrg.id) {
      if (selectedUpdateOrg.parent_name === 'undefined') {
        setOptionOrg({
          label: t('cloud:org_manage.org_manage.add_org.no_org'),
          value: '',
        })
      } else {
        setOptionOrg({
          label: selectedUpdateOrg.parent_name,
          value: selectedUpdateOrg.id,
        })
      }
    }
  }, [selectedUpdateOrg])

  const { mutate, isLoading, isSuccess } = useUpdateOrg()
  const {
    mutateAsync: mutateAsyncUploadImage,
    isLoading: isLoadingUploadImage,
  } = useUploadImage()

  const { mutate: mutateUpdateOrgForOrg } = useUpdateOrgForOrg()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { register, formState, control, setValue, handleSubmit } = useForm<
    UpdateOrgDTO['data']
  >({
    resolver: orgSchema && zodResolver(orgSchema),
    defaultValues: {
      name: selectedUpdateOrg.name,
      description:
        selectedUpdateOrg?.description !== 'undefined'
          ? selectedUpdateOrg?.description
          : '',
      org_id: selectedUpdateOrg?.id,
    },
  })
  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    setUploadImageErr('')
  }, [isOpen])

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
          />
        </>
      )}
    >
      <form
        id="update-org"
        className="w-full space-y-6"
        onSubmit={handleSubmit(async values => {
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
                org_id: optionOrg?.value,
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
                org_id: optionOrg?.value,
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
                orgSelectOptions || [{ label: t('loading:org'), value: '' }]
              }
              onChange={e => {
                setOptionOrg(e)
                mutateUpdateOrgForOrg({
                  data: {
                    ids: [selectedUpdateOrg.id],
                    org_id: e.value,
                  },
                })
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
