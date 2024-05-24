import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { format } from 'date-fns'
import { LuCalendar } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { FormDialog } from '@/components/FormDialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import i18n from '@/i18n'
import { useAreaList } from '@/layout/MainLayout/components/UserAccount/api/getAreaList'
import { cn } from '@/utils/misc'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneSchemaRegex,
} from '@/utils/schemaValidation'

import { HiOutlineXMark } from 'react-icons/hi2'
import 'react-day-picker/dist/style.css'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import {
  useCreateCustomer,
  type CreateEntityCustomerDTO,
} from '../api/createTenantApi'
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

export const entityCustomerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchemaRegex,
    password: passwordSchema,
    confirm_password: passwordSchema.or(z.string().optional()),

    dob: z.string().optional(),
    gender: z.string().optional(),
    province: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    full_address: z.string().optional(),
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        path: ['confirm_password'],
        code: 'custom',
        message: i18n.t('auth:pass_invalid'),
      })
    }
  })

export function CreateCustomer() {
  const { t } = useTranslation()
  const listGender = [
    { label: t('form:male'), value: 'male' },
    { label: t('form:female'), value: 'female' },
  ]

  const form = useForm<CreateEntityCustomerDTO['data']>({
    resolver: entityCustomerSchema && zodResolver(entityCustomerSchema),
    defaultValues: {
      name: '',
      gender: 'male',
      province: '',
      district: '',
      ward: '',
      password: '',
      confirm_password: '',
      full_address: '',
      email: '',
      phone: '',
    },
  })
  const { formState, handleSubmit, reset, setValue } = form

  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())

  const { data: provinceList } = useAreaList({
    parentCode: '',
    type: 'PROVINCE',
  })

  const { data: districtList } = useAreaList({
    parentCode: provinceCode,
    type: 'DISTRICT',
    config: {
      enabled: !!provinceCode,
    },
  })

  const { data: wardList } = useAreaList({
    parentCode: districtCode,
    type: 'WARD',
    config: {
      enabled: !!districtCode,
    },
  })

  const { mutate, isLoading, isSuccess } = useCreateCustomer()

  return (
    <FormDialog
      size="lg"
      isDone={isSuccess}
      title={t('form:tenant.create')}
      resetData={() => reset()}
      body={
        <Form {...form}>
          <form
            id="create-tenant"
            className="flex flex-col justify-between"
            onSubmit={handleSubmit(values => {
              mutate({
                data: {
                  email: values.email,
                  password: values.password,
                  name: values.name,
                  phone: values.phone,
                  profile: {
                    dob: date,
                    gender: values.gender,
                    province: values.province,
                    district: values.district,
                    ward: values.ward,
                    full_address: values.full_address,
                  },
                },
              })
            })}
          >
            <>
              <div className="mb-3 text-base font-semibold text-black">
                {t('cloud:dashboard.table.tenant_info')}
              </div>
              <div className="mb-3 grid grid-cols-4 gap-4">
                <FormLabel
                  htmlFor="name"
                  className={`text-end ${formState.errors.name ? 'text-destructive' : ''}`}
                >
                  Tenant<span className="text-red-600">*</span>
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
                <FormLabel className="text-end">{t('form:dob')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="trans"
                      className={cn(
                        'relative h-[37px] w-full justify-start rounded-md text-left font-normal ',
                        !date && 'text-muted-foreground',
                      )}
                    >
                      <LuCalendar className="mr-2 h-4 w-4" />
                      {date ? (
                        date ? (
                          <>{format(date, 'dd/MM/y')}</>
                        ) : (
                          format(date, 'dd MM, y')
                        )
                      ) : (
                        <span className="text-sm">
                          {t('cloud:dashboard.config_chart.pick_date')}
                        </span>
                      )}
                      {date && (
                        <HiOutlineXMark
                          onClick={() => setDate(undefined)}
                          className="absolute right-3 top-2.5 h-4 w-4 "
                        />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <FormLabel className="text-end">{t('form:sex')}</FormLabel>
                <FormField
                  control={form.control}
                  name="gender"
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
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {listGender.map(template => (
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
                <FormLabel className="col-start-1 text-end">
                  {t('cloud:org_manage.event_manage.add_event.action.address')}
                </FormLabel>
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <div>
                        <Select
                          {...field}
                          onValueChange={e => {
                            onChange(e)
                            setProvinceCode(e)
                            setValue('district', '')
                            setValue('ward', '')
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('form:province_city')}
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
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <div>
                        <Select
                          {...field}
                          onValueChange={e => {
                            onChange(e)
                            setDistrictCode(e)
                            setValue('ward', '')
                          }}
                          value={value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('form:district')} />
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
                <FormField
                  control={form.control}
                  name="ward"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <div>
                        <Select
                          {...field}
                          onValueChange={e => {
                            onChange(e)
                            setDistrictCode(e)
                          }}
                          value={value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('form:village')} />
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
                <FormLabel className="col-start-1 text-end">
                  {t('form:detail_address')}
                </FormLabel>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="full_address"
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
                </div>
              </div>

              <div className="mb-3 text-base font-semibold text-black">
                {t('form:account_info')}
              </div>
              <div className="grid grid-cols-4 gap-4">
                <FormLabel
                  className={`text-end ${formState.errors.email ? 'text-destructive' : ''}`}
                >
                  Email<span className="text-red-600">*</span>
                </FormLabel>
                <FormField
                  control={form.control}
                  name="email"
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
                  className={`text-end ${formState.errors.phone ? 'text-destructive' : ''}`}
                >
                  {t('cloud:org_manage.user_manage.add_user.phone')}
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
                  className={`text-end ${formState.errors.password ? 'text-destructive' : ''}`}
                >
                  {t('cloud:org_manage.user_manage.add_user.password')}
                  <span className="text-red-600">*</span>
                </FormLabel>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormLabel
                  className={`text-end ${formState.errors.confirm_password ? 'text-destructive' : ''}`}
                >
                  {t('form:confirm_password')}
                  <span className="text-red-600">*</span>
                </FormLabel>
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <div>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </>
          </form>
        </Form>
      }
      triggerButton={
        <Button className="h-[38px] rounded border-none">
          {t('cloud:tenant.button')}
        </Button>
      }
      confirmButton={
        <Button
          isLoading={isLoading}
          form="create-tenant"
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
