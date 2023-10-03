import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { XMarkIcon } from '@heroicons/react/20/solid'

import { Form, InputField, TextAreaField } from '~/components/Form'
import { type UpdateProjectDTO, useUpdateProject } from '../api/updateProject'
import { CreateProjectSchema } from '../api'
import { Button } from '~/components/Button'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { useEffect, useRef } from 'react'
import { type Project } from '../routes/ProjectManage'
import FileField from '~/components/Form/FileField'
import {
  type UploadImageDTO,
  useUploadImage,
} from '~/layout/OrgManagementLayout/api'
import { uploadImageSchema } from '~/layout/OrgManagementLayout/components/CreateOrg'

import defaultProjectImage from '~/assets/images/default-project.png'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

export function UpdateProject({
  close,
  isOpen,
  selectedUpdateProject,
}: {
  close: () => void
  isOpen: boolean
  selectedUpdateProject: Project
}) {
  const { t } = useTranslation()

  const cancelButtonRef = useRef(null)

  const { mutate, isLoading, isSuccess } = useUpdateProject()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

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

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="mb-4 flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:project_manager.add_project.edit')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <Form<UpdateProjectDTO['data'], typeof CreateProjectSchema>
            id="update-project"
            className="flex flex-col justify-between"
            onSubmit={values => {
              mutate({
                data: {
                  name: values.name,
                  description: values.description,
                  image: dataUploadImage?.data?.link,
                },
                projectId: selectedUpdateProject.id,
              })
            }}
            schema={CreateProjectSchema}
            options={{
              defaultValues: {
                name: selectedUpdateProject?.name,
                description: selectedUpdateProject?.description,
                image: selectedUpdateProject?.image,
              },
            }}
          >
            {({ register, formState }) => {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div style={{ height: '250px' }}>
                    <InputField
                      label={t('cloud:project_manager.add_project.name')}
                      error={formState.errors['name']}
                      registration={register('name')}
                    />
                    <TextAreaField
                      label={t('cloud:project_manager.add_project.description')}
                      error={formState.errors['description']}
                      registration={register('description')}
                      rows={5}
                    />
                  </div>
                  <div className="pl-4">
                    <img
                      src={selectedUpdateProject.image}
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src = defaultProjectImage
                      }}
                      alt="Project"
                      className="mb-3 h-36 w-32"
                      ref={avatarRef}
                      onClick={event => {
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
                    <FileField
                      label={t('cloud:project_manager.add_project.avatar')}
                      error={formStateUploadImage.errors['file']}
                      control={controlUploadImage}
                      name="upload-image"
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
                    <Button
                      className="mt-3 border-none"
                      style={{ justifyContent: 'flex-start' }}
                      variant="primary"
                      size="square"
                      onClick={handleSubmitUploadImage(values => {
                        mutateUploadImage({
                          data: {
                            project_id: selectedUpdateProject.id,
                            file: values.file,
                          },
                        })
                        setValueUploadImage('file', {
                          file: null as unknown as File,
                        })
                      })}
                      isLoading={isLoadingUploadImage}
                    >
                      {t('cloud:org_manage.org_manage.add_org.upload_ava')}
                    </Button>
                  </div>
                </div>
              )
            }}
          </Form>
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
            }
            ref={cancelButtonRef}
          />
          <Button
            isLoading={isLoading}
            form="update-project"
            type="submit"
            size="md"
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </div>
      </div>
    </Dialog>
  )
}
