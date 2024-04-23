import { useRef } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/Button'
import { FormDrawer, InputField, TextAreaField } from '@/components/Form'
import FileField from '@/components/Form/FileField'
import {
  useCreateOrg,
  useUploadImage,
  type CreateOrgDTO,
  useUpdateOrg,
} from '../api'
import { descSchema, nameSchema } from '@/utils/schemaValidation'
import storage from '@/utils/storage'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  useResetDefaultImage,
} from '@/utils/hooks'
import { useGetOrgs } from '@/layout/MainLayout/api'

import { PlusIcon } from '@/components/SVGIcons'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import defaultOrgImage from '@/assets/images/default-org.png'
import { SelectSuperordinateOrgTree } from '@/components/SelectSuperordinateOrgTree'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { cn, flattenOrgs } from '@/utils/misc'

export const orgSchema = z.object({
  name: nameSchema,
  org_id: z.string().optional(),
  description: descSchema.optional(),
  image: z.string().optional(),
  project_id: z.string().optional(),
})

export const uploadImageResSchema = z.object({
  link: z.string(),
  last_modified: z.number(),
})

export function CreateOrg() {
  const { t } = useTranslation()

  const {
    handleResetDefaultImage1,
    avatarRef1,
    uploadImageErr,
    setUploadImageErr,
    controlUploadImage,
    setValueUploadImage,
    getValueUploadImage,
  } = useResetDefaultImage(defaultOrgImage)

  const projectId = storage.getProject()?.id

  const { data: orgData } = useGetOrgs({ projectId, level: 1 })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const { mutate: mutateUpdateOrg } = useUpdateOrg({ isOnCreateOrg: true })

  const {
    mutateAsync: mutateAsyncCreateOrg,
    isLoading: isLoadingCreateOrg,
    isSuccess: isSuccessCreateOrg,
  } = useCreateOrg()

  const {
    mutateAsync: mutateAsyncUploadImage,
    isLoading: isLoadingUploadImage,
  } = useUploadImage()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const form = useForm<CreateOrgDTO['data']>({
    resolver: orgSchema && zodResolver(orgSchema),
  })
  const { register, formState, handleSubmit, reset } = form

  const clearData = () => {
    setUploadImageErr('')
    handleResetDefaultImage1()
    reset()
  }

  return (
    <FormDrawer
      isDone={isSuccessCreateOrg}
      resetData={clearData}
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:org_manage.org_manage.add_org.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-org"
          type="submit"
          size="lg"
          isLoading={isLoadingCreateOrg || isLoadingUploadImage}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form {...form}>
        <form
          className="w-full space-y-6"
          id="create-org"
          onSubmit={handleSubmit(async values => {
            const dataCreateOrg = await mutateAsyncCreateOrg({
              data: {
                project_id: projectId,
                org_id: values.org_id !== no_org_val ? values.org_id : '',
                name: values.name,
                description: values.description,
              },
            })
            if (getValueUploadImage('file') != null) {
              const dataUploadImage = await mutateAsyncUploadImage({
                data: {
                  project_id: projectId,
                  file: getValueUploadImage('file'),
                },
              })
              mutateUpdateOrg({
                data: {
                  name: dataCreateOrg.name,
                  description: dataCreateOrg.description,
                  org_id: dataCreateOrg.org_id,
                  image: dataUploadImage.data.link,
                },
                org_id: dataCreateOrg.id,
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
            <FormField
              control={form.control}
              name="org_id"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>
                    {t('cloud:org_manage.device_manage.add_device.parent')}
                  </FormLabel>
                  <div>
                    <FormControl>
                      <div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="org_id"
                              className={cn(
                                'block w-full rounded-md border border-secondary-600 bg-white px-3 py-2 !text-body-sm text-black placeholder-secondary-700 shadow-sm *:appearance-none focus:outline-2 focus:outline-focus-400 focus:ring-focus-400 disabled:cursor-not-allowed disabled:bg-secondary-500',
                                {
                                  'text-gray-500': !value && value !== '',
                                },
                              )}
                            >
                              {value
                                ? orgDataFlatten.find(item => item.id === value)
                                    ?.name
                                : value === ''
                                  ? t('tree:no_selection_org')
                                  : t('placeholder:select_org')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <SelectSuperordinateOrgTree
                              {...field}
                              onChangeValue={onChange}
                              value={value}
                              noSelectionOption={true}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

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
              src={defaultOrgImage}
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
      </Form>
    </FormDrawer>
  )
}
