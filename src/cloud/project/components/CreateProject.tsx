import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '~/components/Button'
import { FormDialog } from '~/components/FormDialog'
import {
  type CreateProjectDTO,
  useCreateProject,
  CreateProjectSchema,
} from '../api/createProject'
import { Form, InputField, TextAreaField } from '~/components/Form'
import {
  type UploadImageDTO,
  useUploadImage,
} from '~/layout/OrgManagementLayout/api'
import FileField from '~/components/Form/FileField'
import { useUpdateProject } from '../api'

import { uploadImageSchema } from '~/layout/OrgManagementLayout/components/CreateOrg'

import defaultProjectImage from '~/assets/images/default-project.png'
import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateProject() {
  const { t } = useTranslation()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const {
    data: dataUploadImage,
    mutate: mutateUploadImage,
    isLoading: isLoadingUploadImage,
    isSuccess: isSuccessUploadImage,
  } = useUploadImage()

  const { mutate: mutateUpdateProject } = useUpdateProject()

  const avatarRef = useRef<HTMLImageElement>(null)
  const {
    formState: formStateUploadImage,
    control: controlUploadImage,
    setValue: setValueUploadImage,
    getValues: getValueUploadImage,
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })

  const {
    data: dataCreateProject,
    mutate: mutateCreateProject,
    isLoading: isLoadingCreateProject,
    isSuccess: isSuccessCreateProject,
  } = useCreateProject()

  useEffect(() => {
    if (isSuccessCreateProject && dataCreateProject != null) {
      mutateUploadImage({
        data: {
          project_id: dataCreateProject.id,
          file: getValueUploadImage('file'),
        },
      })
      handleResetDefaultImage()
    }
  }, [dataCreateProject])

  useEffect(() => {
    if (
      isSuccessUploadImage &&
      dataUploadImage != null &&
      dataCreateProject != null
    ) {
      mutateUpdateProject({
        data: {
          name: dataCreateProject.name,
          description: dataCreateProject.description,
          image: dataUploadImage.data.link,
        },
        projectId: dataCreateProject.id,
      })
    }
  }, [dataUploadImage])

  function handleResetDefaultImage() {
    if (avatarRef.current != null) {
      avatarRef.current.src = defaultProjectImage
      fetch(avatarRef.current.src)
        .then(res => res.blob())
        .then(blob => {
          const defaultFile = new File([blob], 'default-project.png', blob)
          const formData = new FormData()
          formData.append('file', defaultFile)
          setValueUploadImage('file', formData.get('file'))
        })
    }
  }

  return (
    <FormDialog
      className="project-popup"
      size="md"
      title={t('cloud:project_manager.add_project.title')}
      id="create-project-screen"
      isDone={isSuccessCreateProject}
      body={
        <Form<CreateProjectDTO['data'], typeof CreateProjectSchema>
          id="create-project"
          className="flex flex-col justify-between"
          onSubmit={values => {
            mutateCreateProject({
              data: {
                name: values.name,
                description: values.description,
              },
            })
          }}
          schema={CreateProjectSchema}
        >
          {({ register, formState }) => {
            console.log('formState errors: ', formState.errors)

            return (
              <div className="grid grid-cols-1 md:grid-cols-[70%_30%]">
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
                <div className="pl-4">
                  <div className="mb-3">
                    <FileField
                      label={t('cloud:project_manager.add_project.avatar')}
                      error={formStateUploadImage?.errors?.['file']}
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
                  </div>
                  <img
                    src={defaultProjectImage}
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
          isLoading={isLoadingCreateProject || isLoadingUploadImage}
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
