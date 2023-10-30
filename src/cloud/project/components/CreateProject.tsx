import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useTranslation } from 'react-i18next'
import { nullable, z } from 'zod'

import { Button } from '~/components/Button'
import { FormDialog } from '~/components/FormDialog'
import {
  type CreateProjectDTO,
  useCreateProject,
  CreateProjectSchema,
  restoreProjectSchema,
  ACCEPTED_RESTORE_FILE,
} from '../api/createProject'
import { Form, InputField, TextAreaField } from '~/components/Form'
import {
  type UploadImageDTO,
  useUploadImage,
} from '~/layout/OrgManagementLayout/api'
import FileField from '~/components/Form/FileField'
import { useUpdateProject } from '../api'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  uploadImageSchema,
} from '~/layout/OrgManagementLayout/components/CreateOrg'

import defaultProjectImage from '~/assets/images/default-project.png'
import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { RestoreProjectDTO, useRestoreProject } from '../api/restoreProject'
import btnRemoveIcon from '~/assets/icons/btn-remove.svg'

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateProject() {
  const { t } = useTranslation()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { mutateAsync: mutateAsyncUploadImage } = useUploadImage()
  const { mutateAsync: mutateAsyncUploadProjectFile } = useRestoreProject()

  const { mutate: mutateUpdateProject } = useUpdateProject({
    isOnCreateProject: true,
  })

  const avatarRef = useRef<HTMLImageElement>(null)
  const {
    control: controlUploadImage,
    setValue: setValueUploadImage,
    getValues: getValueUploadImage,
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })

  const {
    mutateAsync: mutateAsyncCreateProject,
    isLoading: isLoadingCreateProject,
    isSuccess: isSuccessCreateProject,
  } = useCreateProject()

  function handleResetDefaultImage() {
    setUploadImageErr('')
    if (getValueUploadImage('file') != null) {
      if (avatarRef.current != null) {
        avatarRef.current.src = defaultProjectImage
      }
      fetch(defaultProjectImage)
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

  const {
    control: controlUploadRestoreProject,
    setValue: setValueUploadRestoreProject,
    getValues: getValueUploadRestoreProject,
  } = useForm<RestoreProjectDTO>({
    resolver: restoreProjectSchema && zodResolver(restoreProjectSchema),
  })
  const [uploadRestoreProjectErr, setUploadRestoreProjectErr] = useState('')
  const [restoreProjectFileName, setRestoreProjectFileName] = useState('')

  return (
    <FormDialog
      size="md"
      title={t('cloud:project_manager.add_project.title')}
      isDone={isSuccessCreateProject}
      resetData={handleResetDefaultImage}
      body={
        <Form<CreateProjectDTO['data'], typeof CreateProjectSchema>
          id="create-project"
          className="flex flex-col justify-between"
          onSubmit={async values => {
            const dataCreateProject = await mutateAsyncCreateProject({
              data: {
                name: values.name,
                description: values.description,
              },
            })
            if (getValueUploadImage('file') != null) {
              const dataUploadImage = await mutateAsyncUploadImage({
                data: {
                  project_id: dataCreateProject.id,
                  file: getValueUploadImage('file'),
                },
              })
              mutateUpdateProject({
                data: {
                  name: dataCreateProject.name,
                  description: dataCreateProject.description,
                  image: dataUploadImage.data.link,
                },
                projectId: dataCreateProject.id,
              })
            }
            if (getValueUploadRestoreProject('backup') != null) {
              await mutateAsyncUploadProjectFile({
                projectId: dataCreateProject.id,
                backup: getValueUploadRestoreProject('backup')
              })
              mutateUpdateProject({
                data: {
                  name: dataCreateProject.name,
                  description: dataCreateProject.description
                },
                projectId: dataCreateProject.id,
              })
            }
          }}
          schema={CreateProjectSchema}
        >
          {({ register, formState }) => {
            console.log('formState errors: ', formState.errors)

            return (
              <div className="grid grid-cols-1 md:grid-cols-[60%_40%]">
                <div>
                  <InputField
                    label={t('cloud:project_manager.add_project.name')}
                    error={formState.errors['name']}
                    registration={register('name')}
                    className="mb-5"
                  />
                  <TextAreaField
                    label={t('cloud:project_manager.add_project.description')}
                    error={formState.errors['description']}
                    registration={register('description')}
                    rows={9}
                  />
                </div>
                <div className="pl-5">
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
                    src={defaultProjectImage}
                    alt="Project"
                    className="mb-3 h-36 w-32"
                    ref={avatarRef}
                  />
                  <Button
                    className="mb-3 justify-start border-none"
                    variant="secondaryLight"
                    size="square"
                    onClick={handleResetDefaultImage}
                  >
                    {t('cloud:project_manager.add_project.upload_ava_default')}
                  </Button>
                  <div className="mb-3 text-body-xs">
                    {t('cloud:project_manager.add_project.upload_instruction')}
                  </div>
                  <div className="mb-3 space-y-1">
                    <FileField
                      label={t('cloud:project_manager.add_project.restore_project')}
                      control={controlUploadRestoreProject}
                      name="restore-project"
                      ref={fileInputRef}
                      onChange={event => {
                        setUploadRestoreProjectErr('')
                      const file = event.target.files[0]
                        setRestoreProjectFileName(file.name)
                        const reader = new FileReader()
                        reader.readAsText(file)
                        reader.onload = e => {
                          const formData = new FormData()
                          formData.append('backup', e.target?.result as unknown as string)
                          setValueUploadRestoreProject(
                            'backup',
                            formData.get('backup') as unknown as string,
                          )

                          if (!ACCEPTED_RESTORE_FILE.includes(file.type)) {
                            setUploadRestoreProjectErr(t('validate:json_type'))
                            return false
                          }
                        }
                      }}
                    />
                    <div className="flex items-center text-body-sm">
                      {restoreProjectFileName}
                      {
                        restoreProjectFileName ? (
                          <div className="pl-4">
                            <img
                              height={12}
                              width={12}
                              src={btnRemoveIcon}
                              className="text-secondary-700 hover:text-primary-400 cursor-pointer"
                              onClick={() => {
                                setValueUploadRestoreProject('backup', null)
                                setRestoreProjectFileName('')
                              }}
                            />
                          </div>
                        ) : (<></>)
                      }
                    </div>
                    <p className="text-body-sm text-primary-400">
                      {uploadRestoreProjectErr}
                    </p>
                  </div>
                </div>
              </div>
            )
          }}
        </Form>
      }
      triggerButton={
        <Button
          className="h-9 w-9 rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      confirmButton={
        <Button
          isLoading={isLoadingCreateProject}
          form="create-project"
          type="submit"
          size="md"
          className="rounded-md border bg-primary-400"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
