import { useEffect, useRef } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
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

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn, flattenOrgs } from '@/utils/misc'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

type CreateOrgProps = {
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export function CreateOrg({ open, close, isOpen }: CreateOrgProps) {
  const { t } = useTranslation()

  const {
    handleResetDefaultImage,
    avatarRef,
    uploadImageErr,
    setUploadImageErr,
    controlUploadImage,
    setValueUploadImage,
    getValueUploadImage,
  } = useResetDefaultImage(defaultOrgImage, 'default-org.png')

  const projectId = storage.getProject()?.id

  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const { mutate: mutateUpdateOrg, isSuccess: isSuccessUpdateOrg } =
    useUpdateOrg({ isOnCreateOrg: true })

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
  const { handleSubmit, reset } = form

  useEffect(() => {
    if (isSuccessCreateOrg) {
      close?.()
    }
  }, [isSuccessCreateOrg])

  useEffect(() => {
    reset()
  }, [isOpen])

  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>
            {t('cloud:org_manage.org_manage.add_org.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
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
                      image: dataUploadImage.link,
                    },
                    org_id: dataCreateOrg.id,
                  })
                }
              })}
            >
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.org_manage.add_org.name')}
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
                                    ? orgDataFlatten.find(
                                        item => item.id === value,
                                      )?.name
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
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.org_manage.add_org.desc')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <div className="mb-3 space-y-1">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { ref, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:project_manager.add_project.avatar')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              type="file"
                              className="mt-2 border-none p-0 shadow-none"
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

                                if (file.size > MAX_FILE_SIZE) {
                                  setUploadImageErr(
                                    t('validate:image_max_size'),
                                  )
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
                                    avatarRef.current.src = e.target
                                      .result as string
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
        </div>

        <SheetFooter>
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
              form="create-org"
              type="submit"
              size="lg"
              isLoading={isLoadingCreateOrg || isLoadingUploadImage}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
