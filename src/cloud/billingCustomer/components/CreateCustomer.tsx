import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { Calendar } from '~/components/Calendar'
import { Form, InputField, SelectField } from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'
import i18n from '~/i18n'
import { useAreaList } from '~/layout/MainLayout/components/UserAccount/api/getAreaList'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneSchemaRegex,
} from '~/utils/schemaValidation'
import {
  useCreateCustomer,
  type CreateEntityCustomerDTO,
} from '../api/createCustomerApi'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { cn } from '~/utils/misc'
import { format } from 'date-fns'
import { XMarkIcon } from '@heroicons/react/24/outline'

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
  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [wardCode, setWardCode] = useState('')
  const [date, setDate] = useState<Date | null>()

  //get province list
  const { data: provinceList } = useAreaList({
    config: {
      // suspense: false,
      select: (data: any) => {
        const transformArr = data.map((item: any) => {
          if (item.areaCode === provinceCode) {
            return { value: item.areaCode, label: item.name, selected: true }
          }
          return { value: item.areaCode, label: item.name }
        })
        transformArr.push({ value: '', label: t('form:province_city') })
        return transformArr
      },
    },
    param: {
      parentCode: '',
      type: 'PROVINCE',
      queryKey: 'province-list',
    },
  })

  // get district list
  const { data: districtList } = useAreaList({
    config: {
      suspense: false,
      select: (data: any) => {
        const transformArr = data.map((item: any) => {
          if (item.areaCode === districtCode) {
            return { value: item.areaCode, label: item.name, selected: true }
          }
          return { value: item.areaCode, label: item.name }
        })
        transformArr.push({ value: '', label: t('form:district') })
        return transformArr
      },
      enabled: !!provinceCode,
    },
    param: {
      parentCode: provinceCode,
      type: 'DISTRICT',
      queryKey: 'district-list',
    },
  })

  // get ward list
  const { data: wardList } = useAreaList({
    config: {
      suspense: false,
      select: (data: any) => {
        const transformArr = data.map((item: any) => {
          if (item.areaCode === wardCode) {
            return { value: item.areaCode, label: item.name, selected: true }
          }
          return { value: item.areaCode, label: item.name }
        })
        transformArr.push({ value: '', label: t('form:village') })
        return transformArr
      },
      enabled: !!districtCode,
    },
    param: {
      parentCode: districtCode,
      type: 'WARD',
      queryKey: 'ward-list',
    },
  })

  const { mutate, isLoading, isSuccess } = useCreateCustomer()

  return (
    <FormDialog
      size="lg"
      isDone={isSuccess}
      title={t('form:customer.create')}
      body={
        <Form<CreateEntityCustomerDTO['data'], typeof entityCustomerSchema>
          id="create-customer"
          className="flex flex-col justify-between"
          onSubmit={values => {
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
          }}
          schema={entityCustomerSchema}
          options={{
            defaultValues: {
              gender: 'male',
              province: '',
              district: '',
              ward: '',
              password: '',
              full_address: '',
            },
          }}
        >
          {({ register, formState }) => {
            return (
              <>
                <div className="mb-3 text-base font-semibold text-black">
                  {t('billing:subcription.popup.customer_info')}
                </div>
                <div className="mb-3 grid grid-cols-4 gap-4">
                  <div className="text-end">
                    {t('billing:subcription.popup.customer_name')}{' '}
                    <span className="text-red-600">*</span>
                  </div>
                  <InputField
                    autoComplete="off"
                    error={formState.errors['name']}
                    registration={register('name')}
                  />

                  <div className="text-end">{t('form:dob')}</div>
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
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          date ? (
                            <>{format(date, 'dd/MM/y')}</>
                          ) : (
                            format(date, 'dd MM, y')
                          )
                        ) : (
                          <span>
                            {t('cloud:dashboard.config_chart.pick_date')}
                          </span>
                        )}
                        {date && (
                          <XMarkIcon
                            onClick={() => setDate(null)}
                            className="absolute right-3 top-2.5 h-4 w-4 "
                          />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        defaultMonth={new Date(1990, 0)}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                        // fromYear={1960}
                        // toYear={2005}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="text-end">{t('form:sex')}</div>
                  <SelectField
                    error={formState.errors['gender']}
                    registration={register('gender')}
                    options={[
                      { label: t('form:male'), value: 'male' },
                      { label: t('form:female'), value: 'female' },
                    ]}
                  />

                  <div className="col-start-1 text-end">
                    {t(
                      'cloud:org_manage.event_manage.add_event.action.address',
                    )}
                  </div>
                  <SelectField
                    error={formState.errors['province']}
                    registration={register('province')}
                    options={
                      provinceList || [
                        { value: '', label: t('form:province_city') },
                      ]
                    }
                    classchild="w-full"
                    onChange={e => setProvinceCode(e.target.value)}
                  />
                  <SelectField
                    error={formState.errors['district']}
                    registration={register('district')}
                    options={
                      districtList || [{ value: '', label: t('form:district') }]
                    }
                    onChange={e => setDistrictCode(e.target.value)}
                  />
                  <SelectField
                    error={formState.errors['ward']}
                    registration={register('ward')}
                    options={
                      wardList || [{ value: '', label: t('form:village') }]
                    }
                  />

                  <div className="text-end">{t('form:detail_address')}</div>
                  <div className="col-span-3">
                    <InputField
                      autoComplete="off"
                      error={formState.errors['full_address']}
                      registration={register('full_address')}
                    />
                  </div>
                </div>

                <div className="mb-3 text-base font-semibold text-black">
                  {t('form:account_info')}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-end">
                    Email<span className="text-red-600">*</span>
                  </div>
                  <InputField
                    autoComplete="off"
                    error={formState.errors['email']}
                    registration={register('email')}
                  />

                  <div className="text-end">
                    {t('cloud:org_manage.user_manage.add_user.phone')}
                    <span className="text-red-600">*</span>
                  </div>
                  <InputField
                    type="number"
                    autoComplete="off"
                    error={formState.errors['phone']}
                    registration={register('phone')}
                    maxlength="10"
                  />

                  <div className="text-end">
                    {t('cloud:org_manage.user_manage.add_user.password')}
                    <span className="text-red-600">*</span>
                  </div>
                  <InputField
                    type="password"
                    autoComplete="off"
                    error={formState.errors['password']}
                    registration={register('password')}
                  />

                  <div className="text-end">
                    {t('form:confirm_password')}
                    <span className="text-red-600">*</span>
                  </div>
                  <InputField
                    type="password"
                    autoComplete="off"
                    error={formState.errors['confirm_password']}
                    registration={register('confirm_password')}
                  />
                </div>
              </>
            )
          }}
        </Form>
      }
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      confirmButton={
        <Button
          isLoading={isLoading}
          form="create-entityThing"
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
