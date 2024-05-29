import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { type CreateUserDTO, useCreateUser } from '../../api/userAPI'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneSchemaRegex,
} from '@/utils/schemaValidation'
import storage from '@/utils/storage'
import i18n from '@/i18n'
import { useGetRoles } from '@/cloud/role/api'
import { useAreaList } from '@/layout/MainLayout/components/UserAccount/api/getAreaList'
import { useGetOrgs } from '@/layout/MainLayout/api'

import { EyeHide, EyeShow, PlusIcon } from '@/components/SVGIcons'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
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
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn, flattenOrgs } from '@/utils/misc'
import { Input } from '@/components/ui/input'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'

export const userInfoSchema = z.object({
  name: nameSchema,
  phone: phoneSchemaRegex,
  password: passwordSchema,
  confirmPassword: passwordSchema.optional(),
  email: emailSchema,
  org_id: z.string().optional(),
  role_id: z.string().optional(),
  project_id: z.string().optional(),
  profile: z
    .object({
      province: z.string().optional(),
      district: z.string().optional(),
      ward: z.string().optional(),
      full_address: z.string(),
    })
    .optional(),
})
export const userSchema = userInfoSchema.superRefine(
  ({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: i18n.t('auth:pass_invalid'),
      })
    }
  },
)

type CreateUserProps = {
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export function CreateUser({ open, close, isOpen }: CreateUserProps) {
  const { t } = useTranslation()

  const form = useForm<CreateUserDTO['data']>({
    resolver: userSchema && zodResolver(userSchema),
  })
  const { register, formState, handleSubmit, control, watch, reset, setValue } =
    form
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const { mutate, isLoading, isSuccess } = useCreateUser()

  const projectId = storage.getProject()?.id

  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])

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

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

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
            {t('cloud:org_manage.user_manage.add_user.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="create-user"
              className="w-full space-y-6"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    project_id: projectId,
                    org_id: values.org_id !== no_org_val ? values.org_id : '',
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role_id: values.role_id,
                    phone: values.phone,
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
                })
              })}
            >
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.user_manage.add_user.name')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t(
                              'cloud:org_manage.event_manage.add_event.input_placeholder',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.user_manage.add_user.phone')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            placeholder={t(
                              'cloud:org_manage.event_manage.add_event.input_placeholder',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.user_manage.add_user.email')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t(
                              'cloud:org_manage.event_manage.add_event.input_placeholder',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.user_manage.add_user.password')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                            placeholder={t(
                              'cloud:org_manage.event_manage.add_event.input_placeholder',
                            )}
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
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t(
                          'cloud:org_manage.user_manage.add_user.confirm_password',
                        )}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
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
                            {...field}
                            placeholder={t(
                              'cloud:org_manage.event_manage.add_event.input_placeholder',
                            )}
                          />
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
                  name="role_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.user_manage.add_user.role')}{' '}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <NewSelectDropdown
                            customOnChange={onChange}
                            options={roleOptions}
                            isOptionDisabled={option =>
                              option.label === t('loading:role') ||
                              option.label === t('table:no_role')
                            }
                            noOptionsMessage={() => t('table:no_role')}
                            loadingMessage={() => t('loading:role')}
                            isLoading={roleIsLoading}
                            placeholder={t(
                              'cloud:role_manage.add_role.choose_role',
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-x-2">
                  <FormLabel className="col-start-1 col-end-4 mb-2">
                    {t('cloud:org_manage.user_manage.add_user.address')}
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="profile.province"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <div>
                          <FormControl>
                            <NewSelectDropdown
                              isClearable={true}
                              customOnChange={(e: string) => {
                                onChange(e)
                                setValue('profile.district', '')
                                setValue('profile.ward', '')
                              }}
                              options={provinceList}
                              placeholder={t(
                                'cloud:org_manage.user_manage.add_user.province',
                              )}
                              {...field}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profile.district"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <div>
                          <FormControl>
                            <NewSelectDropdown
                              isClearable={true}
                              customOnChange={(e: string) => {
                                onChange(e)
                                setValue('profile.ward', '')
                              }}
                              options={districtList}
                              placeholder={t(
                                'cloud:org_manage.user_manage.add_user.district',
                              )}
                              {...field}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profile.ward"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <div>
                          <FormControl>
                            <NewSelectDropdown
                              isClearable={true}
                              customOnChange={(e: string) => {
                                onChange(e)
                              }}
                              options={wardList}
                              placeholder={t(
                                'cloud:org_manage.user_manage.add_user.ward',
                              )}
                              {...field}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={control}
                  name="profile.full_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form:enter_address')} </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
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
              form="create-user"
              type="submit"
              size="lg"
              isLoading={isLoading}
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
