
import { useTranslation } from "react-i18next"
import { Button } from "~/components/Button"
import { FormDialog } from "~/components/FormDialog"
import { PlusIcon } from "~/components/SVGIcons"
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { CreateProjectDTO, useCreateProject } from "../api/createProject"
import { Form, InputField, TextAreaField } from "~/components/Form"
import { z } from "zod"
import { nameSchema } from "~/utils/schemaValidation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UploadImageDTO, useUploadImage } from "~/layout/OrgManagementLayout/api"
import defaultProjectImage from '~/assets/images/default-project.png'
import FileField from "~/components/Form/FileField"
import { useUpdateProject } from "../api"

export const projectSchema = z.object({
  name: nameSchema,
  description: z.string(),
  image: z.string().optional()
})

const MAX_FILE_SIZE = 5000000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
export const uploadImageSchema = z.object({
  file: z
    .instanceof(File, { message: 'Vui lòng chọn ảnh tải lên' })
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      `Ảnh cho phép dung lượng tối đa 5MB`,
    )
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Chỉ cho phép tải ảnh định dạng .jpg, .jpeg, .png',
    ),
})

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateProject(){
  const { t } = useTranslation()

  const {
    data: dataCreateProject,
    mutate: mutateProject,
    isLoading: isLoadingProject,
    isSuccess: isSuccessProject,
  } = useCreateProject()

  const fileInputRef = useRef()
  const {
    data: dataUploadImage,
    mutate: mutateUploadImage,
    isLoading: isLoadingUploadImage,
    isSuccess: isSuccessUploadImage
  } = useUploadImage()

  const { mutate: mutateUpdateProject } = useUpdateProject()

  const {
    formState: formStateUploadImage,
    control: controlUploadImage,
    handleSubmit: handleSubmitUploadImage,
    setValue: setValueUploadImage,
    getValues: getValueUploadImage
  } = useForm<UploadImageDTO['data']>({
    resolver: uploadImageSchema && zodResolver(uploadImageSchema),
  })
  const avatarRef = useRef<HTMLImageElement>(null)
  const [newProjectId, setNewProjectId] = useState('')
  const [uploadImage, setUploadImage] = useState('')
  useEffect(() => {
    if(isSuccessProject) {
      setNewProjectId(dataCreateProject.id)
      setUploadImage(dataUploadImage?.link as string)
    }
  }, [isSuccessProject, isSuccessUploadImage, dataUploadImage, dataCreateProject])
  
  return (
    <FormDialog
      className='project-popup'
      size='md'
      title={t('cloud:project_manager.add_project.title')}
      id='create-project-screen'
      isDone={isSuccessProject}
      body={
        <Form<CreateProjectDTO['data'], typeof projectSchema>
          id="create-project"
          className="flex flex-col justify-between"
          onSubmit={values => {
            mutateProject({
              data: {
                name: values.name,
                description: values.description,
                image: defaultProjectImage ?? values.image
              },
            })
            if (isSuccessProject) {
              mutateUploadImage({
                data: {
                  project_id: newProjectId,
                  file: getValueUploadImage().file
                }
              })
              if (isSuccessUploadImage) {
                mutateUpdateProject({
                  data: {
                    name: values.name,
                    description: values.description,
                    image: dataUploadImage.link
                  },
                  projectId: newProjectId
                })
              }
            }
          }}
          schema={projectSchema}
        >
          {({ register, formState }) => {
            return (
              <div className="grid grid-cols-1 md:grid-cols-[70%_30%]">
                <div style={{height: '250px'}}>
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
                    rows={7}
                  />
                </div>
                <div className="pl-4">
                  <div className="mb-3">
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
                  </div>
                  <img
                    src={defaultProjectImage}
                    onError={e => {
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.src = defaultProjectImage
                    }}
                    alt="Project"
                    className="h-36 w-32 mb-3"
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
                  <Button
                    className="border-none mb-3"
                    style={{ justifyContent: 'flex-start' }}
                    variant="secondaryLight"
                    size="square"
                    onClick={() => {
                      if (avatarRef.current != null) {
                        avatarRef.current.src = defaultProjectImage as string
                      }
                    }}
                    isLoading={isLoadingUploadImage}
                  >
                    {t('cloud:project_manager.add_project.upload_ava_default')}
                  </Button>
                  <Button
                    className="border-none mb-3"
                    style={{ justifyContent: 'flex-start' }}
                    variant="secondaryLight"
                    size="square"
                    onClick={handleSubmitUploadImage(values => {
                      setValueUploadImage('file', { file: null as unknown as File })
                    })}
                    isLoading={isLoadingUploadImage}
                  >
                    {t('cloud:project_manager.add_project.upload_ava')}
                  </Button>
                  <div style={{fontSize: '12px'}}>{t('cloud:project_manager.add_project.upload_instruction')}</div>
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
          isLoading={isLoadingProject}
          form="create-project"
          type="submit"
          size="md"
          className="bg-primary-400 rounded-md border"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}