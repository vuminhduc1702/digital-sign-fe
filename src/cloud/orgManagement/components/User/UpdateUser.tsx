import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/Button'
import { InputField, SelectDropdown, SelectField } from '@/components/Form'
import { useUpdateUser, type UpdateUserDTO } from '../../api/userAPI'
import i18n from '@/i18n'
import storage from '@/utils/storage'
import { useGetRoles } from '@/cloud/role/api'
import { useAreaList } from '@/layout/MainLayout/components/UserAccount/api/getAreaList'
import { useGetOrgs } from '@/layout/MainLayout/api'

import { userInfoSchema } from './CreateUser'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { EyeHide, EyeShow } from '@/components/SVGIcons'
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

type UpdateUserProps = {
  userId: string
  name: string
  email: string
  close: () => void
  isOpen: boolean
  org_id: string
  org_name: string
  role_id: string
  role_name: string
  phone: string
  profile: string
}

export const updatedUserSchema = userInfoSchema
  .omit({ password: true, confirmPassword: true })
  .and(
    z.object({
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    }),
  )
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: i18n.t('auth:pass_invalid'),
      })
    }
  })

export function UpdateUser({
  userId,
  name,
  close,
  isOpen,
  email,
  org_id,
  role_id,
  phone,
  profile,
  org_name,
}: UpdateUserProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateUser()

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  const form = useForm<UpdateUserDTO['data']>({
    resolver: updatedUserSchema && zodResolver(updatedUserSchema),
    defaultValues: {
      name,
      email,
      phone,
      org_id,
      role_id,
      profile,
    },
  })
  const { register, formState, handleSubmit, control, getValues, watch } = form

  const projectId = storage.getProject()?.id
  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const { data: roleData, isLoading: roleIsLoading } = useGetRoles({
    projectId,
  })
  const roleOptions = roleData?.roles?.map(item => ({
    label: item.name,
    value: item.id,
  }))

  const { data: provinceList } = useAreaList({
    parentCode: '',
    type: 'PROVINCE',
  })
  const { data: districtList } = useAreaList({
    parentCode: watch('profile.province'),
    type: 'DISTRICT',
    config: {
      enabled: !!watch('profile.province'),
    },
  })
  const { data: wardList } = useAreaList({
    parentCode: watch('profile.district'),
    type: 'WARD',
    config: {
      enabled: !!watch('profile.district'),
    },
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)
  const toggleRePasswordVisibility = () => {
    setShowRePassword(prev => !prev)
  }
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

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
            {t('cloud:org_manage.user_manage.add_user.edit')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="update-user"
              className="w-full space-y-6"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    name: values.name,
                    phone: values.phone,
                    password: values.password,
                    email: values.email,
                    org_id: values.org_id !== no_org_val ? values.org_id : '',
                    role_id: values.role_id,
                    profile:
                      values.profile != null
                        ? {
                            province: values.profile.province,
                            district: values.profile.district,
                            ward: values.profile.ward,
                            full_address: values.profile.full_address,
                          }
                        : undefined,
                  },
                  userId,
                })
              })}
            >
              <>
                <InputField
                  label={t('cloud:org_manage.user_manage.add_user.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                />
                <InputField
                  label={t('cloud:org_manage.user_manage.add_user.phone')}
                  type="number"
                  error={formState.errors['phone']}
                  registration={register('phone')}
                />
                <InputField
                  label={t('cloud:org_manage.user_manage.add_user.email')}
                  error={formState.errors['email']}
                  registration={register('email')}
                />
                <InputField
                  label={t('cloud:org_manage.user_manage.add_user.password')}
                  error={formState.errors['password']}
                  registration={register('password')}
                  type={showPassword ? 'text' : 'password'}
                  endIcon={
                    showPassword ? (
                      <EyeShow
                        height={30}
                        width={30}
                        viewBox="0 0 30 30"
                        className="absolute bottom-0 right-2 z-20"
                        onClick={togglePasswordVisibility}
                      />
                    ) : (
                      <EyeHide
                        height={30}
                        width={30}
                        viewBox="0 0 30 30"
                        className="absolute bottom-0 right-2 z-20"
                        onClick={togglePasswordVisibility}
                      />
                    )
                  }
                />
                <InputField
                  label={t(
                    'cloud:org_manage.user_manage.add_user.confirm_password',
                  )}
                  error={formState.errors['confirmPassword']}
                  registration={register('confirmPassword')}
                  type={showRePassword ? 'text' : 'password'}
                  endIcon={
                    showRePassword ? (
                      <EyeShow
                        height={30}
                        width={30}
                        viewBox="0 0 30 30"
                        className="absolute bottom-0 right-2 z-20"
                        onClick={toggleRePasswordVisibility}
                      />
                    ) : (
                      <EyeHide
                        height={30}
                        width={30}
                        viewBox="0 0 30 30"
                        className="absolute bottom-0 right-2 z-20"
                        onClick={toggleRePasswordVisibility}
                      />
                    )
                  }
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

                <SelectDropdown
                  label={t('cloud:org_manage.user_manage.add_user.role')}
                  name="role_id"
                  control={control}
                  options={roleOptions}
                  isOptionDisabled={option =>
                    option.label === t('loading:role') ||
                    option.label === t('table:no_role')
                  }
                  noOptionsMessage={() => t('table:no_role')}
                  loadingMessage={() => t('loading:role')}
                  isLoading={roleIsLoading}
                  placeholder={t('cloud:role_manage.add_role.choose_role')}
                  defaultValue={roleOptions?.find(
                    item => item.value === getValues('role_id'),
                  )}
                  error={formState?.errors?.role_id}
                />

                <div className="grid grid-cols-3 gap-x-2">
                  <div className="col-start-1 col-end-4">
                    {t('cloud:org_manage.user_manage.add_user.address')}
                  </div>
                  <SelectField
                    error={formState?.errors?.profile?.province}
                    registration={register('profile.province')}
                    options={provinceList}
                    classchild="w-full"
                    placeholder={t(
                      'cloud:org_manage.user_manage.add_user.province',
                    )}
                  />
                  <SelectField
                    error={formState?.errors?.profile?.district}
                    registration={register('profile.district')}
                    options={districtList}
                    placeholder={t(
                      'cloud:org_manage.user_manage.add_user.district',
                    )}
                  />
                  <SelectField
                    error={formState?.errors?.profile?.ward}
                    registration={register('profile.ward')}
                    options={wardList}
                    placeholder={t(
                      'cloud:org_manage.user_manage.add_user.ward',
                    )}
                  />
                </div>
                <InputField
                  label={t('form:enter_address')}
                  registration={register('profile.full_address')}
                />
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
              form="update-user"
              type="submit"
              size="lg"
              isLoading={isLoading}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
              disabled={!formState.isDirty || isLoading}
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
