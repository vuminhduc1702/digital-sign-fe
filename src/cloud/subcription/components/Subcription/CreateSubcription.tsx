import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { type PlanlvList } from '@/cloud/billingPackage'
import { useGetPlans } from '@/cloud/billingPackage/api'
import { usePlanById } from '@/cloud/billingPackage/api/getPackageById'
import { useGetUsers } from '@/cloud/orgManagement/api/userAPI'
import { type SelectOption } from '@/components/Form'
import { FormDialog } from '@/components/FormDialog'
import { Button } from '@/components/ui/button'
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
import i18n from '@/i18n'
import storage from '@/utils/storage'
import {
  useCreateSubcription,
  type CreateSubcriptionDTO,
} from '../../api/subcriptionAPI/createSubcription'

export const entitySubcriptionSchema = z.object({
  plan_id: z
    .string()
    .min(1, { message: i18n.t('billing:subcription.popup.choose_plan') }),
  user_id: z
    .string()
    .min(1, { message: i18n.t('billing:subcription.popup.choose_user') }),
  register: z.string().optional(),
  customer_code: z.string().optional(),
  customer_name: z.string().optional(),
  price_method: z.string().optional(),
  payment_type: z.string().optional(),
  register_value: z.string().optional(),
  period: z.string().optional(),
})

export function CreateSubcription() {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const [userId, setUserId] = useState('')
  const [planValue, setPlanValue] = useState<string | null>()
  const [customerName, setCustomerName] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [registerValue, setRegisterValue] = useState('')
  const [userOption, setUserOption] = useState<SelectOption[]>([
    { label: '', value: 'empty' },
  ])
  const [planOption, setPlanOption] = useState<SelectOption[]>([
    { label: '', value: 'empty' },
  ])

  const { data: UserData } = useGetUsers({ projectId, expand: true })

  const { data: PlanData } = useGetPlans({ projectId })

  const { data: PlanDataById } = usePlanById({
    planId: planValue || '',
    config: { enabled: !!planValue },
  })

  useEffect(() => {
    setUserOption(
      UserData?.users?.map(user => ({
        label: `${user.phone ? user.phone : '(SĐT)'} - ${user.email}`,
        value: `${user.customer_code} - ${user.user_id} - ${user.name}`,
      })) || [{ label: '', value: 'empty' }],
    )
  }, [UserData])

  useEffect(() => {
    setPlanOption(
      PlanData?.data?.map(plan => ({
        label: plan?.name,
        value: plan?.id,
      })) || [{ label: '', value: 'empty' }],
    )
  }, [PlanData])

  const { mutate, isLoading, isSuccess } = useCreateSubcription()
  const resetData = () => {
    setPlanValue(null)
    setCustomerCode('')
    setCustomerName('')
    setRegisterValue('')
    setUserId('')
    reset()
  }

  const parseNumber = (value: any) => {
    return value ? parseInt(value) : 0
  }

  useEffect(() => {
    setTimeout(() => {
      handleOnChange('')
    }, 500)
    setValue(
      'payment_type',
      PlanDataById?.data?.payment_type
        ? PlanDataById?.data?.payment_type === 'PREPAY'
          ? 'Trả trước'
          : 'Trả sau'
        : '',
    )
    valuePriceMethod()
    valuePeriod()
    if (PlanDataById?.data?.estimate === 'fix') {
      setValue('register', '')
    }
  }, [PlanDataById, planValue])

  const handleOnChange = (expected_number?: string) => {
    if (PlanDataById?.data) {
      let result: any
      const estimates = PlanDataById?.data?.estimate
      const price = PlanDataById?.data?.price
      const fix_cost = PlanDataById?.data?.fix_cost
      const quantity_free = PlanDataById?.data?.quantity_free
      const plan_lv = PlanDataById?.data?.plan_lv
      const tax = PlanDataById?.data?.tax
      if (estimates === 'fix') {
        result = parseNumber(price) + parseNumber(fix_cost)
      } else if (estimates === 'unit') {
        result =
          (parseNumber(expected_number) - parseNumber(quantity_free)) *
            parseNumber(price) +
          parseNumber(fix_cost)
      } else if (estimates === 'mass') {
        plan_lv?.length &&
          plan_lv.forEach((item: PlanlvList, i: number) => {
            if (
              parseNumber(item.level) > parseNumber(expected_number) &&
              (i > 0 ? parseNumber(plan_lv[i - 1].level) : 1) <
                parseNumber(expected_number)
            ) {
              result =
                (parseNumber(expected_number) - parseNumber(item.free)) *
                  parseNumber(item.price) +
                parseNumber(fix_cost)
            }
          })
      } else if (estimates === 'step') {
        let arr: PlanlvList[] = []
        plan_lv?.length &&
          plan_lv.forEach((item: PlanlvList, i: number) => {
            if (parseNumber(item.level) > parseNumber(expected_number)) {
              arr.length < 1 && arr.push(item)
            }
          })
        result =
          (arr.length ? parseNumber(arr[0].price) : 0) + parseNumber(fix_cost)
      } else if (estimates === 'accumulated') {
        let start = 0
        let end = 0
        let original = parseNumber(expected_number)
        let temp = original
        let index = 0
        let tempPrice = 0

        while (temp > 0) {
          end = parseNumber(plan_lv?.[index]?.level)
          if (original > end) {
            tempPrice += (end - start) * parseNumber(plan_lv?.[index]?.price)
            temp = original - end
          } else {
            tempPrice += temp * parseNumber(plan_lv?.[index]?.price)
            temp = 0
          }
          start = end
          index++
          if (index === plan_lv?.length) {
            tempPrice += temp * parseNumber(plan_lv?.[index - 1]?.price)
            break
          }
        }
        result = tempPrice + parseNumber(fix_cost)
      }

      result = parseNumber(result * ((100 + parseNumber(tax)) / 100))
      setRegisterValue(result < 0 ? parseNumber(fix_cost) : result)
      setValue(
        'register_value',
        result < 0 ? parseNumber(fix_cost).toString() : result.toString(),
      )
    }
  }

  const valuePriceMethod = () => {
    let result = ''
    if (PlanDataById?.data?.estimate) {
      switch (PlanDataById?.data?.estimate) {
        case 'mass':
          result = 'Theo khối lượng'
          break
        case 'fix':
          result = 'Cố định'
          break
        case 'unit':
          result = 'Theo đơn vị'
          break
        case 'accumulated':
          result = 'Theo lũy kế'
          break
        case 'step':
          result = 'Theo bậc thang'
          break
        default:
          break
      }
    }
    return setValue('price_method', result)
  }

  const valuePeriod = () => {
    let result = ''
    if (PlanDataById?.data?.cal_unit) {
      switch (PlanDataById?.data?.cal_unit) {
        case 'day':
          result = ' ngày'
          break
        case 'week':
          result = ' tuần'
          break
        case 'month':
          result = ' tháng'
          break
        case 'year':
          result = ' năm'
          break
        default:
          break
      }
    }
    return setValue(
      'period',
      PlanDataById?.data?.period ? PlanDataById?.data?.period + result : '',
    )
  }

  const form = useForm<CreateSubcriptionDTO['data']>({
    resolver: entitySubcriptionSchema && zodResolver(entitySubcriptionSchema),
    defaultValues: { plan_id: '', user_id: '' },
  })
  const { control, handleSubmit, setValue, formState, register, reset } = form
  return (
    <FormDialog
      resetData={resetData}
      isDone={isSuccess}
      title={t('billing:subcription.create')}
      size="md"
      body={
        <Form {...form}>
          <form
            id="create-firm-ware"
            className="flex w-full flex-col justify-between space-y-6"
            onSubmit={handleSubmit(values => {
              mutate({
                data: {
                  project_id: projectId,
                  plan_id: planValue || '',
                  user_id: userId || '',
                  register: parseInt(values.register || ''),
                },
              })
            })}
          >
            <>
              <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                <div className="flex gap-3">
                  <p className="text-table-header">
                    {t('billing:subcription.popup.customer_info')}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <div className="flex items-center gap-x-3">
                        <FormLabel className="w-3/12">
                          {t('billing:subcription.popup.search_customer_with')}
                        </FormLabel>
                        <div className="w-9/12">
                          <FormControl>
                            <Select
                              {...field}
                              onValueChange={e => {
                                const arrValue = e.split(' - ')
                                setValue('user_id', e)
                                setValue(
                                  'customer_name',
                                  arrValue[2] !== 'undefined'
                                    ? arrValue[2]
                                    : 'Tên khách hàng',
                                )
                                setValue('customer_code', arrValue[0])
                                setUserId(arrValue[1])
                                onChange(e)
                              }}
                              value={value}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {userOption?.map(option => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing:subcription.popup.customer_name')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing:subcription.popup.customer_code')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                <div className="flex gap-3">
                  <p className="text-table-header">
                    {t('billing:subcription.popup.service_info')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="plan_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing:subcription.popup.package')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={e => {
                              setValue('plan_id', e)
                              setPlanValue(e)
                              onChange(e)
                            }}
                            value={value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {planOption?.map(option => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing:subcription.popup.price_method')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {PlanDataById?.data?.estimate !== 'fix' && (
                  <FormField
                    control={form.control}
                    name="register"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {t('billing:subcription.popup.quantity')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              value={value}
                              onChange={e => {
                                onChange(e)
                                handleOnChange(e.target.value)
                              }}
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing:subcription.popup.payment_type')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                <div className="flex gap-3">
                  <p className="text-table-header">
                    {t('billing:subcription.popup.billing_info')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="register_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing:subcription.popup.estimated_payment')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing:subcription.popup.period')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} disabled />
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
          {t('billing:subcription.button')}
        </Button>
      }
      confirmButton={
        <Button
          isLoading={isLoading}
          form="create-firm-ware"
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
