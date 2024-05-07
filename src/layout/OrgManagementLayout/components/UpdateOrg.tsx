import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/Button'
import { InputField, TextAreaField } from '@/components/Form'
import {
  type UpdateOrgDTO,
  useUpdateOrg,
  useUploadImage,
  useOrgById,
} from '../api'
import { orgSchema } from './CreateOrg'
import FileField from '@/components/Form/FileField'
import { API_URL } from '@/config'
import { useUpdateOrgForOrg } from '../api/updateOrgForOrg'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  useResetDefaultImage,
} from '@/utils/hooks'
import { useGetOrgs } from '@/layout/MainLayout/api'
import storage from '@/utils/storage'
import { type Org } from '@/layout/MainLayout/types'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import defaultOrgImage from '@/assets/images/default-org.png'
import { SelectSuperordinateOrgTree } from '@/components/SelectSuperordinateOrgTree'
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

const orgUpdateSchema = orgSchema.required({ org_id: true })

export function UpdateOrg({
  close,
  isOpen,
  selectedUpdateOrg,
}: {
  close: () => void
  isOpen: boolean
  selectedUpdateOrg: Org
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
  } = useResetDefaultImage(defaultOrgImage, 'default-org.png')

  const projectId = storage.getProject()?.id

  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const { mutate, isLoading, isSuccess } = useUpdateOrg()
  const {
    mutateAsync: mutateAsyncUploadImage,
    isLoading: isLoadingUploadImage,
  } = useUploadImage()

  const { mutate: mutateUpdateOrgForOrg } = useUpdateOrgForOrg()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const form = useForm<UpdateOrgDTO['data']>({
    resolver: orgUpdateSchema && zodResolver(orgUpdateSchema),
    defaultValues: {
      name: selectedUpdateOrg.name,
      description: selectedUpdateOrg.description,
      org_id: selectedUpdateOrg.org_id,
    },
  })
  const { register, formState, control, setValue, getValues, handleSubmit } =
    form
  const selectedOrgBelonged = selectedUpdateOrg.org_id
  const { data: orgDataById } = useOrgById({ orgId: selectedOrgBelonged })

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  useEffect(() => {
    if (selectedUpdateOrg) {
      setValue('name', selectedUpdateOrg.name)
      setValue('description', selectedUpdateOrg.description)
      setValue('org_id', selectedUpdateOrg.org_id)
    }
    setUploadImageErr('')
  }, [isOpen, selectedUpdateOrg])

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
            {t('cloud:org_manage.org_manage.add_org.edit')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="update-org"
              className="w-full space-y-6"
              onSubmit={handleSubmit(async values => {
                if (
                  getValues('org_id') !== selectedUpdateOrg.org_id &&
                  getValues('org_id') != null
                ) {
                  mutateUpdateOrgForOrg({
                    data: {
                      ids: [selectedUpdateOrg.id],
                      org_id: values.org_id !== no_org_val ? values.org_id : '',
                    },
                  })
                }
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
                      org_id: values.org_id !== no_org_val ? values.org_id : '',
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
                      org_id: values.org_id !== no_org_val ? values.org_id : '',
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
                  <p className="text-body-sm text-primary-400">
                    {uploadImageErr}
                  </p>
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
              form="update-org"
              type="submit"
              size="lg"
              isLoading={isLoading || isLoadingUploadImage}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
              disabled={isLoading}
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
