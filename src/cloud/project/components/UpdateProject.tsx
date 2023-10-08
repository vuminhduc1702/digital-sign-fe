import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { XMarkIcon } from '@heroicons/react/20/solid'

import { Form, InputField, TextAreaField } from '~/components/Form'
import { type UpdateProjectDTO, useUpdateProject } from '../api/updateProject'
import { CreateProjectSchema } from '../api'
import { Button } from '~/components/Button'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { useEffect, useRef, useState } from 'react'
import { type Project } from '../routes/ProjectManage'
import FileField from '~/components/Form/FileField'
import {
  type UploadImageDTO,
  useUploadImage,
} from '~/layout/OrgManagementLayout/api'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  uploadImageSchema,
} from '~/layout/OrgManagementLayout/components/CreateOrg'

import defaultProjectImage from '~/assets/images/default-project.png'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { API_URL } from '~/config'

export type UpdateProject = {
  name?: string
  description?: string
  image?: string
}

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
    isSuccess: isSuccessUploadImage,
  } = useUploadImage()
  const {
    control: controlUploadImage,
    setValue: setValueUploadImage,
    getValues: getValueUploadImage,
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })
  const avatarRef = useRef<HTMLImageElement>(null)
  const [uploadImageErr, setUploadImageErr] = useState('')

  function handleResetDefaultImage() {
    if (avatarRef.current != null) {
      avatarRef.current.src = defaultProjectImage
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
  const [updateDataForm, setUpdateDataForm] = useState<UpdateProject>({})

  function handleSubmitUpdate(updateData: UpdateProject) {
    mutate({
      data: {
        name: updateData.name,
        description: updateData.description,
        image: dataUploadImage?.data?.link,
      },
      projectId: selectedUpdateProject.id,
    })
  }

  useEffect(() => {
    if (isSuccessUploadImage && dataUploadImage != null) {
      handleSubmitUpdate(updateDataForm)
    }
  }, [dataUploadImage])

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[48rem] sm:p-6 sm:align-middle">
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
              mutateUploadImage({
                data: {
                  project_id: selectedUpdateProject.id,
                  file: getValueUploadImage('file'),
                },
              })
              handleResetDefaultImage()
              setUpdateDataForm(values)
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
                <div className="grid grid-cols-1 md:grid-cols-[60%_40%]">
                  <div style={{ height: '250px' }}>
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
                        selectedUpdateProject?.image !== ''
                          ? `${API_URL}/file/${selectedUpdateProject?.image}`
                          : defaultProjectImage
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
                      {t(
                        'cloud:project_manager.add_project.upload_ava_default',
                      )}
                    </Button>
                    <div style={{ fontSize: '12px' }}>
                      {t(
                        'cloud:project_manager.add_project.upload_instruction',
                      )}
                    </div>
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
