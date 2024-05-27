import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/FormDialog'
import {
  type CreateProjectDTO,
  useCreateProject,
  CreateProjectSchema,
  restoreProjectSchema,
  ACCEPTED_RESTORE_FILE,
} from '../api/createProject'
import { useUploadImage } from '@/layout/OrgManagementLayout/api'
import { useUpdateProject } from '../api'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  useResetDefaultImage,
} from '@/utils/hooks'
import {
  type RestoreProjectDTO,
  useRestoreProject,
} from '../api/restoreProject'

import defaultProjectImage from '@/assets/images/default-project.png'
import { PlusIcon } from '@/components/SVGIcons'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnRemoveIcon from '@/assets/icons/btn-remove.svg'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateProject() {
  const { t } = useTranslation()

  const {
    handleResetDefaultImage,
    avatarRef,
    uploadImageErr,
    setUploadImageErr,
    controlUploadImage,
    setValueUploadImage,
    getValueUploadImage,
  } = useResetDefaultImage(defaultProjectImage, 'default-project.png')

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<CreateProjectDTO['data']>({
    resolver: CreateProjectSchema && zodResolver(CreateProjectSchema),
  })

  const { register, formState, handleSubmit, reset } = form

  const { mutateAsync: mutateAsyncUploadImage } = useUploadImage()

  const { mutateAsync: mutateAsyncUploadProjectFile } = useRestoreProject()

  const { mutate: mutateUpdateProject } = useUpdateProject({
    isOnCreateProject: true,
  })

  const {
    mutateAsync: mutateAsyncCreateProject,
    isLoading: isLoadingCreateProject,
    isSuccess: isSuccessCreateProject,
  } = useCreateProject()

  function handleResetRestoreProject() {
    setValueUploadRestoreProject('backup', null)
    setRestoreProjectFileName('')
    setUploadRestoreProjectErr('')
  }

  function handleResetForm() {
    reset()
    handleResetDefaultImage()
    handleResetRestoreProject()
  }

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
      resetData={handleResetForm}
      body={
        <form
          id="create-project"
          className="flex w-full flex-col justify-between space-y-6"
          onSubmit={handleSubmit(async values => {
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
                  image: dataUploadImage.link,
                },
                projectId: dataCreateProject.id,
              })
            }
            if (getValueUploadRestoreProject('backup') != null) {
              const dataBackup = JSON.parse(
                getValueUploadRestoreProject('backup'),
              )
              await mutateAsyncUploadProjectFile({
                projectId: dataCreateProject.id,
                backup: {
                  backup: dataBackup,
                },
              })
            }
          })}
        >
          <div className="grid grid-cols-1 md:grid-cols-[60%_40%]">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:project_manager.add_project.name')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:project_manager.add_project.description')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Textarea {...field} rows={11} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="pl-5">
              <div className="mb-3 space-y-1">
                <FormField
                  control={controlUploadImage}
                  name="file.file"
                  render={({ field: { ref, ...field } }) => (
                    <FormItem>
                      <FormLabel className="flex w-fit cursor-pointer items-center justify-center gap-x-2 rounded-md border bg-primary-400 px-3 py-2 font-medium text-white shadow-sm hover:opacity-80">
                        {t('cloud:project_manager.add_project.avatar')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            type="file"
                            className="mt-2 border-none p-2 shadow-none"
                            {...controlUploadImage.register('file')}
                            ref={fileInputRef}
                            {...field}
                            onChange={event => {
                              setUploadImageErr('')
                              const file = event.target.files[0]
                              const formData = new FormData()
                              formData.append('file', event.target.files[0])
                              setValueUploadImage(
                                'file',
                                formData.get('file') as unknown as {
                                  file: File
                                },
                              )

                              if (file && file.size > MAX_FILE_SIZE) {
                                setUploadImageErr(t('validate:image_max_size'))
                                return false
                              }
                              if (
                                file &&
                                !ACCEPTED_IMAGE_TYPES.includes(file.type)
                              ) {
                                setUploadImageErr(t('validate:image_type'))
                                return false
                              }

                              if (file) {
                                const reader = new FileReader()
                                reader.readAsDataURL(file)
                                reader.onload = e => {
                                  if (
                                    avatarRef.current != null &&
                                    e.target != null &&
                                    reader.readyState === 2
                                  ) {
                                    avatarRef.current.src = e.target
                                      .result as string
                                  }
                                }
                              }
                              event.target.value = ''
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
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
                <FormField
                  control={controlUploadRestoreProject}
                  name="backup"
                  render={({ field: { ref, ...field } }) => (
                    <FormItem>
                      <FormLabel className="flex w-fit cursor-pointer items-center justify-center gap-x-2 rounded-md border bg-primary-400 px-3 py-2 font-medium text-white shadow-sm hover:opacity-80">
                        {t('cloud:project_manager.add_project.restore_project')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            type="file"
                            className="mt-2 border-none p-0 shadow-none"
                            {...controlUploadRestoreProject.register('backup')}
                            ref={fileInputRef}
                            {...field}
                            onChange={event => {
                              setUploadRestoreProjectErr('')
                              const file = event.target.files[0]
                              setRestoreProjectFileName(file.name)
                              const reader = new FileReader()
                              reader.readAsText(file)
                              reader.onload = e => {
                                const formData = new FormData()
                                formData.append(
                                  'backup',
                                  e.target?.result as unknown as string,
                                )
                                setValueUploadRestoreProject(
                                  'backup',
                                  formData.get('backup') as unknown as string,
                                )

                                if (
                                  !ACCEPTED_RESTORE_FILE.includes(file.type)
                                ) {
                                  setUploadRestoreProjectErr(
                                    t('validate:json_type'),
                                  )
                                  return false
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex items-center text-body-sm">
                  {restoreProjectFileName}
                  {restoreProjectFileName ? (
                    <div className="pl-4">
                      <img
                        height={12}
                        width={12}
                        src={btnRemoveIcon}
                        className="cursor-pointer text-secondary-700 hover:text-primary-400"
                        onClick={handleResetRestoreProject}
                        alt="import project"
                      />
                    </div>
                  ) : null}
                </div>
                <p className="text-body-sm text-primary-400">
                  {uploadRestoreProjectErr}
                </p>
              </div>
            </div>
          </div>
        </form>
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
