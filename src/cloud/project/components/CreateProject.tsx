
import { useTranslation } from "react-i18next"
import { Button } from "~/components/Button"
import { FormDialog } from "~/components/FormDialog"
import { PlusIcon } from "~/components/SVGIcons"
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { CreateProjectDTO, useCreateProject } from "../api/createProject"
import { Form, InputField, TextAreaField } from "~/components/Form"
import { z } from "zod"
import { nameSchema } from "~/utils/schemaValidation"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UploadImageDTO, useUploadImage } from "~/layout/OrgManagementLayout/api"
import defaultProjectImage from '~/assets/images/default-project.png'
import FileField from "~/components/Form/FileField"

export const projectSchema = z.object({
  name: nameSchema,
  description: z.string(),
  image: z.string().optional()
})

const MAX_FILE_SIZE = 500000
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
    mutate: mutateProject,
    isLoading: isLoadingProject,
    isSuccess: isSuccessProject,
  } = useCreateProject()

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
  console.log('zod image upload error: ', formStateUploadImage.errors)


  return (
    <FormDialog
      className="project-popup"
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
                image: dataUploadImage?.data?.link
              },
            })
          }}
          schema={projectSchema}
        >
          {({ register, formState }) => {
            return (
              <div>
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
              <img
                src={defaultProjectImage}
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.onerror = null
                  target.src = defaultProjectImage
                }}
                alt="Organization"
                className="h-36 w-32"
                ref={avatarRef}
              />
              <Button
                className="border-none"
                style={{ justifyContent: 'flex-start' }}
                variant="primary"
                size="square"
                onClick={handleSubmitUploadImage(values => {
                  mutateUploadImage({
                    data: {
                      project_id: projectId,
                      file: values.file,
                    },
                  })
                  setValueUploadImage('file', { file: null as unknown as File })
                })}
                isLoading={isLoadingUploadImage}
              >
                {t('cloud:org_manage.org_manage.add_org.upload_ava')}
              </Button>
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
          className="bg-primary-400"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}