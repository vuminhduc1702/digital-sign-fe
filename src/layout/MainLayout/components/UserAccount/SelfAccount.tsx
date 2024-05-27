import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { useSpinDelay } from 'spin-delay'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useUserInfo } from '@/cloud/orgManagement/api/userAPI'
import { Button } from '@/components/ui/button'
import {
  emptyInputSchema,
  emptySelectSchema,
  phoneSchemaRegex,
} from '@/utils/schemaValidation'
import { useAreaList } from './api/getAreaList'
import {
  useMutationSelfAccountInfo,
  type UpdateSelfAccountInfoDTO,
} from './api/updateSelfAccountInfo'
import TitleBar from '@/components/Head/TitleBar'
import { Spinner } from '@/components/Spinner'

import narrowLeft from '@/assets/icons/narrow-left.svg'
import { ContentLayout } from '@/layout/ContentLayout'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const selfInfoSchema = z.object({
  name: emptyInputSchema,
  phone: phoneSchemaRegex,
  email: z.string().optional(),
  profile: z.object({
    district: emptySelectSchema,
    full_address: z.string().optional(),
    province: emptySelectSchema,
    tax_code: emptyInputSchema,
    ward: emptySelectSchema,
  }),
})

const SelfAccount = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate, isLoading } = useMutationSelfAccountInfo()

  //get user info
  const { data: userInfoData, isLoading: userInfoIsLoading } = useUserInfo({})

  const form = useForm<UpdateSelfAccountInfoDTO['data']>({
    resolver: selfInfoSchema && zodResolver(selfInfoSchema),
  })
  const {
    register,
    formState,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
  } = form

  useEffect(() => {
    if (userInfoData != null) {
      reset({
        name: userInfoData?.name,
        phone: userInfoData?.phone,
        email: userInfoData?.email,
        profile: {
          tax_code: userInfoData?.profile?.tax_code,
          province: userInfoData?.profile?.province,
          district: userInfoData?.profile?.district,
          ward: userInfoData?.profile?.ward,
          full_address: userInfoData?.profile?.full_address,
        },
      })
    }
  }, [userInfoData])

  const { data: provinceList, isLoading: provinceListIsLoading } = useAreaList({
    parentCode: '',
    type: 'PROVINCE',
  })

  const { data: districtList } = useAreaList({
    parentCode: getValues('profile.province'),
    type: 'DISTRICT',
    config: {
      enabled: !!getValues('profile.province'),
    },
  })

  const { data: wardList } = useAreaList({
    parentCode: getValues('profile.district'),
    type: 'WARD',
    config: {
      enabled: !!getValues('profile.district'),
    },
  })

  const showSpinner = useSpinDelay(userInfoIsLoading || provinceListIsLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <ContentLayout title={t('user:user_info')}>
      <div className="flex h-full w-2/3 flex-col self-center py-8">
        <div className="flex items-center">
          <div
            className="mr-auto flex cursor-pointer rounded-md border border-secondary-700 px-3 py-2 text-base font-medium"
            onClick={() => navigate(-1)}
          >
            <img
              src={narrowLeft}
              alt="left"
              className="aspect-square w-[20px]"
            />
            <span className="ml-2">{t('form:back')}</span>
          </div>
          <div className="mr-auto text-h1">{t('form:title')}</div>
        </div>

        <TitleBar
          title={t('billing:subcription.popup.customer_info')}
          className="mb-4 mt-12 rounded-md bg-secondary-700 pl-3"
        />

        {userInfoIsLoading || provinceListIsLoading ? (
          <div className="flex grow items-center justify-center">
            <Spinner showSpinner={showSpinner} size="xl" />
          </div>
        ) : (
          <>
            <Form {...form}>
              <form
                id="update-self-account-info"
                onSubmit={handleSubmit(values =>
                  mutate({
                    data: { ...values },
                    tenant_id: userInfoData?.user_id as string,
                  }),
                )}
                className="w-full space-y-6 pr-32"
              >
                <div className="grid grid-cols-4 gap-4">
                  <FormLabel
                    className={`col-start-1 flex items-center justify-end ${formState.errors.name ? 'text-destructive' : ''}`}
                  >
                    {t('form:enter_name')}
                    <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormLabel
                    className={`col-start-3 flex items-center justify-end ${formState.errors?.profile?.tax_code ? 'text-destructive' : ''}`}
                  >
                    {t('form:enter_tax')}
                    <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="profile.tax_code"
                    render={({ field }) => (
                      <FormItem>
                        <div>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormLabel
                    className={`col-start-1 flex items-center justify-end ${formState.errors.phone ? 'text-destructive' : ''}`}
                  >
                    {t('form:enter_phone_num')}
                    <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <div>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormLabel
                    className={`col-start-3 flex items-center justify-end ${formState.errors.email ? 'text-destructive' : ''}`}
                  >
                    {t('form:email')}
                    <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormLabel
                    className={`col-start-1 flex items-center justify-end ${formState.errors?.profile?.province ? 'text-destructive' : ''}`}
                  >
                    {t(
                      'cloud:org_manage.event_manage.add_event.action.address',
                    )}
                    <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="profile.province"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <div>
                          <Select
                            {...field}
                            onValueChange={e => {
                              onChange(e)
                              setValue('profile.district', '')
                              setValue('profile.ward', '')
                            }}
                            value={value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    'cloud:org_manage.user_manage.add_user.province',
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {provinceList?.map((template: any) => (
                                <SelectItem
                                  key={template.label}
                                  value={template.value}
                                >
                                  {template.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormField
                      control={form.control}
                      name="profile.district"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <div>
                            <Select
                              {...field}
                              onValueChange={e => {
                                onChange(e)
                                setValue('profile.ward', '')
                              }}
                              value={value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t(
                                      'cloud:org_manage.user_manage.add_user.district',
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {districtList?.map((template: any) => (
                                  <SelectItem
                                    key={template.label}
                                    value={template.value}
                                  >
                                    {template.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="profile.ward"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <div>
                            <Select
                              {...field}
                              onValueChange={e => onChange(e)}
                              value={value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t(
                                      'cloud:org_manage.user_manage.add_user.ward',
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {wardList?.map((template: any) => (
                                  <SelectItem
                                    key={template.label}
                                    value={template.value}
                                  >
                                    {template.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormLabel className="col-start-1 flex items-center justify-end">
                    {t('form:enter_address')}
                  </FormLabel>
                  <div className="col-start-2 col-end-5">
                    <FormField
                      control={form.control}
                      name="profile.full_address"
                      render={({ field }) => (
                        <FormItem>
                          <div>
                            <FormControl>
                              <Input {...field} className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>

            <div className="mt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                className="rounded-md"
                form="update-self-account-info"
                type="submit"
                isLoading={isLoading}
              >
                {t('btn:save')}
              </Button>
            </div>
          </>
        )}
      </div>
    </ContentLayout>
  )
}

export default SelfAccount
