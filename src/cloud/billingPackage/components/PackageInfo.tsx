import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import btnAddIcon from '@/assets/icons/btn-add.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnEdit from '@/assets/icons/edit.svg'
import { ConfirmDialog } from '@/components/ConfirmDialog'
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
import { Textarea } from '@/components/ui/textarea'
import { PATHS } from '@/routes/PATHS'
import { useDisclosure } from '@/utils/hooks'
import { cn } from '@/utils/misc'
import storage from '@/utils/storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useDeletePlan, useUpdatePlan, type UpdatePlanDTO } from '../api'
import { usePlanById } from '../api/getPackageById'
import { type PlanlvList } from '../types'
import { entityPlanSchema } from './CreatePackage'

export function PackageInfo() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const [type, setType] = useState('')
  const [paymentType, setPaymentType] = useState('')
  const [periodType, setPeriodType] = useState('')
  const [expectedPayment, setExpectedPayment] = useState('')
  const [expectedNumber, setExpectedNumber] = useState('')

  const params = useParams()
  const projectId = storage.getProject()?.id

  const packageId = params.packageId as string
  const {
    mutate: mutateDelete,
    isLoading: isLoadingDelete,
    isSuccess: isSuccessDelete,
  } = useDeletePlan()

  const { mutate, isLoading, isSuccess } = useUpdatePlan()

  const { data, refetch: refetchData } = usePlanById({ planId: packageId })
  const { close, open, isOpen } = useDisclosure()

  useEffect(() => {
    setEstimates(data?.data?.estimate || '')
    setType(data?.data?.type || '')
    setPaymentType(data?.data?.payment_type || '')
    setPeriodType(data?.data?.type_period || '')
    setIsDisabled(true)
    setExpectedPayment('')
    setExpectedNumber('')
    if (data?.data?.estimate === 'fix') {
      handleOnChange(
        '',
        data?.data?.tax?.toString() || '',
        data?.data?.price?.toString() || '',
        data?.data?.fix_cost?.toString() || '',
        data?.data?.quantity_free?.toString() || '',
        data?.data?.plan_lv || [],
        true,
      )
    }
  }, [data])

  useEffect(() => {
    if (isSuccessDelete) {
      navigate(`${PATHS.BILLING_PACKAGE}/${projectId}`)
      close()
    }
  }, [isSuccessDelete])

  useEffect(() => {
    if (isSuccess) {
      setIsDisabled(true)
      refetchData()
    }
  }, [isSuccess])

  const parseNumber = (value: any) => {
    return value ? parseInt(value) : 0
  }

  const parseNumberCalUnit = (value: any, type: string) => {
    let result: any
    switch (type) {
      case 'day':
        result = parseNumber(value)
        break
      case 'week':
        result = parseNumber(value) * 7
        break
      case 'month':
        result = parseNumber(value) * 30
        break
      case 'year':
        result = parseNumber(value) * 365
        break
      default:
        break
    }
    return result
  }

  const handleOnChange = (
    expected_number?: string,
    tax?: string,
    price?: string,
    fix_cost?: string,
    quantity_free?: string,
    plan_lv?: PlanlvList[],
    first?: boolean,
  ) => {
    let result: any
    if (estimates === 'fix' || (first && data?.data?.estimate === 'fix')) {
      result = parseNumber(price) + parseNumber(fix_cost)
    }
    if (estimates === 'unit' && !first) {
      result =
        parseNumber(expected_number) - parseNumber(quantity_free) < 0
          ? parseNumber(fix_cost)
          : (parseNumber(expected_number) - parseNumber(quantity_free)) *
              parseNumber(price) +
            parseNumber(fix_cost)
    }
    if (estimates === 'mass' && !first) {
      plan_lv?.length &&
        plan_lv.forEach((item: PlanlvList, i: number) => {
          if (
            parseNumber(item.level) >= parseNumber(expected_number) &&
            (i > 0 ? parseNumber(plan_lv[i - 1].level) : 1) <
              parseNumber(expected_number)
          ) {
            result =
              parseNumber(expected_number) - parseNumber(item.free) < 0
                ? parseNumber(fix_cost)
                : (parseNumber(expected_number) - parseNumber(item.free)) *
                    parseNumber(item.price) +
                  parseNumber(fix_cost)
          }
        })
    }
    if (estimates === 'step' && !first) {
      let arr: PlanlvList[] = []
      plan_lv?.length &&
        plan_lv.forEach((item: PlanlvList, i: number) => {
          if (parseNumber(item.level) >= parseNumber(expected_number)) {
            arr.length < 1 && arr.push(item)
          }
        })
      result =
        (arr.length ? parseNumber(arr[0].price) : 0) + parseNumber(fix_cost)
    }
    if (estimates === 'accumulated' && !first) {
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
    const resultString = result <= 0 ? 0 : result
    setExpectedPayment(result <= 0 ? 0 : result)
    setValue('expected_payment', resultString.toString())
  }

  const form = useForm<UpdatePlanDTO['data']>({
    resolver: entityPlanSchema && zodResolver(entityPlanSchema),
    values: {
      name: data?.data?.name || '',
      type: data?.data?.type || '',
      description: data?.data?.description || '',
      status: data?.data?.status,
      payment_type: data?.data?.payment_type || '',
      type_period: data?.data?.type_period || '',
      period: data?.data?.period?.toString() || '',
      cal_unit: data?.data?.cal_unit || '',
      fix_cost: data?.data?.fix_cost?.toString() || '',
      charging_unit: data?.data?.charging_unit || '',
      estimate: data?.data?.estimate || '',
      price: data?.data?.price?.toString() || '',
      quantity_free: data?.data?.quantity_free?.toString() || '',
      plan_lv: data?.data?.plan_lv || [],
      tax: data?.data?.tax?.toString() || '',
      expiry:
        (
          (data?.data?.expiry ? data?.data?.expiry : 0) /
          (24 * 60 * 60)
        )?.toString() || '',
    },
  })
  const {
    register,
    formState,
    getValues,
    setValue,
    setError,
    watch,
    handleSubmit,
    control,
    reset,
    clearErrors,
  } = form
  const { fields, append, remove } = useFieldArray({
    name: 'plan_lv',
    control,
  })

  const renderPaymentType = () => {
    const result =
      type === 'trial'
        ? [
            {
              label: t('billing:package_manage.popup.pre_pay'),
              value: 'PREPAY',
            },
          ]
        : [
            {
              label: t('billing:package_manage.popup.pre_pay'),
              value: 'PREPAY',
            },
            {
              label: t('billing:package_manage.popup.post_paid'),
              value: 'POSTPAID',
            },
          ]
    return result
  }

  const renderTypePeriod = () => {
    const result =
      type === 'official' && paymentType === 'PREPAY'
        ? [
            {
              label: t('billing:package_manage.popup.periodic'),
              value: 'PERIODIC',
            },
            {
              label: t('billing:package_manage.popup.once'),
              value: 'ONCE',
            },
          ]
        : [
            {
              label: t('billing:package_manage.popup.periodic'),
              value: 'PERIODIC',
            },
          ]
    return result
  }

  const renderEstimate = () => {
    const result =
      type === 'official' &&
      paymentType === 'POSTPAID' &&
      periodType === 'PERIODIC'
        ? [
            {
              label: t('billing:package_manage.popup.mass'),
              value: 'mass',
            },
            {
              label: t('billing:package_manage.popup.fix'),
              value: 'fix',
            },
            {
              label: t('billing:package_manage.popup.unit'),
              value: 'unit',
            },
            {
              label: t('billing:package_manage.popup.accumulate'),
              value: 'accumulated',
            },
            {
              label: t('billing:package_manage.popup.step'),
              value: 'step',
            },
          ]
        : [
            {
              label: t('billing:package_manage.popup.permanent'),
              value: 'fix',
            },
            {
              label: t('billing:package_manage.popup.by_unit'),
              value: 'unit',
            },
          ]
    return result
  }

  return (
    <>
      <Form {...form}>
        <form
          id="update-plan"
          className="flex max-h-[82vh] flex-col justify-between overflow-auto"
          onSubmit={values => {
            let plan_lvBE: PlanlvList[] = []
            if (
              estimates === 'mass' ||
              estimates === 'accumulated' ||
              estimates === 'step'
            ) {
              plan_lvBE = values.plan_lv?.map(item => ({
                level: (item.level && parseInt(item.level)) || null,
                price: (item.price && parseInt(item.price)) || null,
                free: (item.free && parseInt(item.free)) || null,
                estimate: values.estimate,
              }))
            }
            const expiryNumber =
              values?.expiry && parseInt(values?.expiry) * 24 * 60 * 60
            mutate({
              data: {
                ...values,
                project_id: projectId,
                plan_lv: plan_lvBE,
                tax: (values.tax && parseInt(values.tax)) || null,
                fix_cost:
                  (values.fix_cost && parseInt(values.fix_cost)) || null,
                period: (values.period && parseInt(values.period)) || null,
                quantity_free:
                  (values.quantity_free && parseInt(values.quantity_free)) ||
                  null,
                price: (values.price && parseInt(values.price)) || null,
                expiry: expiryNumber || null,
              },
              planId: packageId,
            })
          }}
        >
          <>
            <p className="flex items-start rounded-md border bg-gray-200 text-lg font-semibold md:p-2">
              {t('billing:package_manage.title')}
            </p>
            <div className="!mt-2 grid grow	grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:package_manage.popup.name')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('billing:package_manage.input.iname')}
                          disabled={isDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:package_manage.popup.type')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={e => {
                          setType(e)
                          setPaymentType('PREPAY')
                          setValue('payment_type', 'PREPAY')
                          onChange(e)
                        }}
                        value={value}
                        disabled={isDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {[
                            {
                              label: t(
                                'billing:package_manage.input.lofficial',
                              ),
                              value: 'official',
                            },
                            {
                              label: t('billing:package_manage.input.ltrial'),
                              value: 'trial',
                            },
                          ]?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:package_manage.popup.description')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Textarea
                          disabled={isDisabled}
                          {...field}
                          placeholder={t(
                            'billing:package_manage.input.tdescribe',
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="relative w-full">
                <label>{t('billing:package_manage.popup.status')}</label>
                <div className="mt-1 items-center">
                  {[
                    {
                      label: t('billing:package_manage.input.ldisplay'),
                      value: 'present',
                    },
                    {
                      label: t('billing:package_manage.input.lhide'),
                      value: 'hidden',
                    },
                  ].map((option, idx) => (
                    <div key={idx} className="my-2 mr-4 flex items-center">
                      <input
                        type="radio"
                        id={`radio-${option.value}`}
                        {...register('status')}
                        value={option.value}
                        disabled={isDisabled}
                        className="mr-3 h-4 w-4 cursor-pointer"
                      />
                      <label
                        htmlFor={`radio-${option.value}`}
                        className="cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="!mt-2 flex items-start rounded-md border bg-gray-200 text-lg font-semibold md:p-2">
              {t('billing:package_manage.popup.data_plan')}
            </p>
            <div className="!mt-2 grid grow	grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
              <FormField
                control={form.control}
                name="payment_type"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:package_manage.popup.payment_type')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={e => {
                          setPaymentType(e)
                          setPeriodType('PERIODIC')
                          setValue('type_period', 'PERIODIC')
                          onChange(e)
                          setEstimates('fix')
                          setValue('estimate', 'fix')
                        }}
                        disabled={isDisabled}
                        value={value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {renderPaymentType()?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center">
                {paymentType === 'POSTPAID' && (
                  <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          {t('billing:package_manage.popup.expiry')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              disabled={isDisabled}
                              value={value}
                              onChange={e => {
                                onChange(e)
                                if (
                                  parseNumber(e.target.value) >
                                  parseNumberCalUnit(
                                    getValues('period'),
                                    getValues('cal_unit'),
                                  )
                                ) {
                                  setError('expiry', {
                                    message: t(
                                      'billing:package_manage.popup.choose_expiry',
                                    ),
                                  })
                                } else clearErrors('expiry')
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
              </div>
              <FormField
                control={form.control}
                name="type_period"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:package_manage.popup.type_period')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={e => {
                          setPeriodType(e)
                          onChange(e)
                        }}
                        value={value}
                        disabled={isDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {renderTypePeriod()?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {periodType === 'PERIODIC' ? (
                <div
                  className={cn('', {
                    'flex items-center': !formState?.errors?.period?.message,
                  })}
                >
                  <div className="grid grow	grid-cols-1 gap-x-10 md:grid-cols-2">
                    <div className="flex flex-col gap-2 md:col-span-1">
                      <FormField
                        control={form.control}
                        name="period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('billing:package_manage.popup.period')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="1"
                                  disabled={isDisabled}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-4 flex flex-col gap-2 md:col-span-1">
                      <FormField
                        control={form.control}
                        name="cal_unit"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel></FormLabel>
                            <FormControl>
                              <Select
                                {...field}
                                onValueChange={onChange}
                                value={value}
                                disabled={isDisabled}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  {[
                                    {
                                      label: t(
                                        'billing:package_manage.popup.day',
                                      ),
                                      value: 'day',
                                    },
                                    {
                                      label: t(
                                        'billing:package_manage.popup.week',
                                      ),
                                      value: 'week',
                                    },
                                    {
                                      label: t(
                                        'billing:package_manage.popup.month',
                                      ),
                                      value: 'month',
                                    },
                                    {
                                      label: t(
                                        'billing:package_manage.popup.year',
                                      ),
                                      value: 'year',
                                    },
                                  ]?.map(option => (
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-body-sm text-primary-400">
                    {formState?.errors?.period?.message}
                  </p>
                </div>
              ) : (
                <div></div>
              )}
              <FormField
                control={form.control}
                name="fix_cost"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:package_manage.popup.fix_cost')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input
                          disabled={isDisabled}
                          value={value}
                          onChange={e => {
                            onChange(e)
                            setValue('expected_payment', '')
                            setValue('expected_number', '')
                          }}
                          placeholder="200"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="charging_unit"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:package_manage.popup.charging_unit')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={onChange}
                        value={value}
                        disabled={isDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {[
                            {
                              label: t('billing:package_manage.popup.connect'),
                              value: 'message',
                            },
                            {
                              label: t('billing:package_manage.popup.device'),
                              value: 'device',
                            },
                            { label: 'API', value: 'api' },
                          ]?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="!mt-2 flex items-start rounded-md border bg-gray-200 text-lg font-semibold md:p-2">
              {t('billing:package_manage.popup.estimate')}
            </p>
            <div className="!mt-3 grid grow	grid-cols-1 gap-x-10 gap-y-1">
              <div className="grid grow	grid-cols-1 gap-x-10 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="estimate"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing:package_manage.popup.estimate')}
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={e => {
                            setEstimates(e)
                            setValue('plan_lv', [
                              {
                                level: '',
                                price: 0,
                                free: 0,
                              },
                            ])
                            setValue('quantity_free', '')
                            setValue('price', '')
                            onChange(e)
                          }}
                          value={value}
                          disabled={isDisabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {renderEstimate()?.map(option => (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(estimates === 'mass' ||
                  estimates === 'accumulated' ||
                  estimates === 'step') && (
                  <div className="flex items-center">
                    <img
                      onClick={() => {
                        let arrPlan = getValues('plan_lv')
                        const index = getValues('plan_lv')?.length - 1
                        if (arrPlan[index]?.level) {
                          append({
                            level: '',
                            price: 0,
                            free: 0,
                          })
                        }
                      }}
                      src={btnAddIcon}
                      alt="add-icon"
                      className="icon-container mt-5 flex h-7 w-7 cursor-pointer items-center justify-center"
                    />
                  </div>
                )}
              </div>
              <div className="mr-8 max-h-[122px] overflow-auto">
                {estimates === 'mass' ||
                estimates === 'accumulated' ||
                estimates === 'step'
                  ? fields.map((field, index) => {
                      return (
                        <section className="flex w-full" key={field.id}>
                          <div
                            className={cn('grid w-full grid-cols-1 gap-x-4', {
                              'md:grid-cols-3':
                                estimates === 'accumulated' ||
                                estimates === 'step' ||
                                estimates === 'mass',
                            })}
                          >
                            <FormField
                              control={form.control}
                              name={`plan_lv.${index}.level`}
                              render={({
                                field: { onChange, value, onBlur, ...field },
                              }) => (
                                <FormItem className="flex items-center gap-x-3">
                                  <FormLabel>
                                    {estimates === 'step'
                                      ? t('billing:package_manage.popup.max')
                                      : t(
                                          'billing:package_manage.popup.level',
                                        ).replace(
                                          '{{NUMBER}}',
                                          index >= 1
                                            ? (typeof getValues('plan_lv')?.[
                                                index - 1
                                              ]?.level === 'string'
                                                ? parseInt(
                                                    getValues('plan_lv')?.[
                                                      index - 1
                                                    ].level,
                                                  )
                                                : getValues('plan_lv')?.[
                                                    index - 1
                                                  ].level) + 1
                                            : '1',
                                        )}
                                  </FormLabel>
                                  <div>
                                    <FormControl>
                                      <Input
                                        disabled={isDisabled}
                                        value={value}
                                        onBlur={e => {
                                          if (
                                            index ===
                                              getValues('plan_lv').length - 1 &&
                                            e.target.value
                                          ) {
                                            append({
                                              level: '',
                                              price: 0,
                                              free: 0,
                                            })
                                          }
                                        }}
                                        onChange={e => {
                                          onChange(e)
                                          setValue('expected_payment', '')
                                          setValue('expected_number', '')
                                        }}
                                        type="number"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`plan_lv.${index}.price`}
                              render={({
                                field: { onChange, value, onBlur, ...field },
                              }) => (
                                <FormItem className="flex items-center gap-x-3">
                                  <FormLabel>
                                    {t('billing:package_manage.popup.price')}
                                  </FormLabel>
                                  <div>
                                    <FormControl>
                                      <Input
                                        value={value}
                                        type="number"
                                        onChange={e => {
                                          onChange(e)
                                          setValue('expected_payment', '')
                                          setValue('expected_number', '')
                                        }}
                                        disabled={isDisabled}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />
                            {estimates === 'mass' && (
                              <FormField
                                control={form.control}
                                name={`plan_lv.${index}.free`}
                                render={({
                                  field: { onChange, value, onBlur, ...field },
                                }) => (
                                  <FormItem className="flex items-center gap-x-3">
                                    <FormLabel>
                                      {t('billing:package_manage.popup.free')}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Input
                                          value={value}
                                          type="number"
                                          onChange={e => {
                                            onChange(e)
                                            setValue('expected_payment', '')
                                            setValue('expected_number', '')
                                          }}
                                          disabled={isDisabled}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                          <Button
                            type="button"
                            size="square"
                            variant="trans"
                            disabled={isDisabled}
                            className="border-none shadow-none"
                            onClick={() => remove(index)}
                            startIcon={
                              <img
                                src={btnDeleteIcon}
                                alt="Delete condition"
                                className="icon-container ml-2 flex h-6 w-6 items-center justify-center"
                              />
                            }
                          />
                        </section>
                      )
                    })
                  : null}
              </div>
              {(estimates === 'fix' || estimates === 'unit') && (
                <div className="grid grow	grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({
                      field: { onChange, value, onBlur, ...field },
                    }) => (
                      <FormItem className="flex items-center gap-x-3">
                        <FormLabel>
                          {t('billing:package_manage.popup.price')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              value={value}
                              type="number"
                              onChange={e => {
                                onChange(e)
                                if (estimates === 'fix') {
                                  handleOnChange(
                                    '',
                                    getValues('tax'),
                                    e.target.value,
                                    getValues('fix_cost'),
                                    getValues('quantity_free'),
                                    getValues('plan_lv'),
                                  )
                                } else {
                                  setValue('expected_payment', '')
                                  setValue('expected_number', '')
                                }
                              }}
                              disabled={isDisabled}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  {estimates === 'unit' && (
                    <FormField
                      control={form.control}
                      name="quantity_free"
                      render={({
                        field: { onChange, value, onBlur, ...field },
                      }) => (
                        <FormItem className="flex items-center gap-x-3">
                          <FormLabel>
                            {t('billing:package_manage.popup.quantity_free')}
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input
                                value={value}
                                type="number"
                                onChange={e => {
                                  onChange(e)
                                  setValue('expected_payment', '')
                                  setValue('expected_number', '')
                                }}
                                disabled={isDisabled}
                                placeholder={t(
                                  'billing:package_manage.popup.quantity',
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
            </div>
            <p className="!mt-3">
              {t('billing:package_manage.popup.estimated_payment')}
            </p>
            <div className="!mt-2 grid grow	grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-3">
              <FormField
                control={form.control}
                name="tax"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="flex items-center gap-x-3">
                    <FormLabel>
                      {t('billing:package_manage.popup.tax')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input
                          value={value}
                          type="number"
                          onChange={e => {
                            onChange(e)
                            setValue('expected_payment', '')
                            setValue('expected_number', '')
                          }}
                          disabled={isDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex items-center">(mặc định 10%)</div>
              <div className="flex items-center"></div>
              {estimates !== 'fix' && (
                <FormField
                  control={form.control}
                  name="expected_number"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem className="flex items-center gap-x-3">
                      <FormLabel>
                        {t('billing:package_manage.popup.expected_number')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            value={value}
                            type="number"
                            onChange={e => {
                              onChange(e)
                              handleOnChange(
                                e.target.value,
                                getValues('tax'),
                                getValues('price'),
                                getValues('fix_cost'),
                                getValues('quantity_free'),
                                getValues('plan_lv'),
                              )
                            }}
                            placeholder={t(
                              'billing:package_manage.popup.enter_quantity',
                            )}
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
                name="expected_payment"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="flex items-center gap-x-3">
                    <FormLabel>
                      {t('billing:package_manage.popup.expected_payment')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input {...field} value={expectedPayment} disabled />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            {!isDisabled && (
              <div className="absolute bottom-3 right-11 flex gap-3">
                <Button
                  onClick={() => {
                    setValue('name', data?.data?.name || '')
                    setValue('type', data?.data?.type || '')
                    setValue('description', data?.data?.description || '')
                    setValue('status', data?.data?.status || '')
                    setValue('payment_type', data?.data?.payment_type || '')
                    setValue('type_period', data?.data?.type_period || '')
                    setValue('period', data?.data?.period?.toString() || '')
                    setValue('cal_unit', data?.data?.cal_unit || '')
                    setValue('fix_cost', data?.data?.fix_cost?.toString() || '')
                    setValue('charging_unit', data?.data?.charging_unit || '')
                    setValue('estimate', data?.data?.estimate || '')
                    setValue('price', data?.data?.price?.toString() || '')
                    setValue(
                      'quantity_free',
                      data?.data?.quantity_free?.toString() || '',
                    )
                    setValue('plan_lv', data?.data?.plan_lv || [])
                    setValue('tax', data?.data?.tax?.toString() || '')
                    setValue(
                      'expiry',
                      (
                        (data?.data?.expiry ? data?.data?.expiry : 0) /
                        (24 * 60 * 60)
                      )?.toString() || '',
                    )
                    setEstimates(data?.data?.estimate || '')
                    setIsDisabled(!isDisabled)
                    handleOnChange(
                      getValues('expected_number'),
                      getValues('tax'),
                      getValues('price'),
                      getValues('fix_cost'),
                      getValues('quantity_free'),
                      getValues('plan_lv'),
                    )
                    setPaymentType(data?.data?.payment_type ?? '')
                  }}
                  className="rounded-md"
                  variant="trans"
                  size="square"
                >
                  {t('btn:cancel')}
                </Button>
                <Button
                  isLoading={isLoading}
                  form="update-plan"
                  type="submit"
                  size="md"
                  className="rounded-md bg-primary-400"
                >
                  {t('btn:save')}
                </Button>
              </div>
            )}
          </>
        </form>
      </Form>
      {isDisabled && (
        <div className="flex">
          <div className="absolute bottom-1 w-[100px] rounded-md bg-gray-100">
            <Button
              className="w-full justify-center border-none hover:text-primary-400"
              variant="trans"
              size="square"
              onClick={open}
              startIcon={
                <img
                  src={btnDeleteIcon}
                  alt="Delete thing"
                  className="h-5 w-5"
                />
              }
            >
              {t('btn:delete')}
            </Button>
          </div>
          {/* <div className="absolute bottom-3 right-[2/5] rounded-md"> */}
          <Button
            type="button"
            size="md"
            disabled={!data?.data?.updatable}
            className="absolute bottom-1 right-11 rounded-md bg-primary-400"
            onClick={() => setIsDisabled(!isDisabled)}
          >
            {t('btn:update')}
            <img src={btnEdit} alt="Delete thing" className="h-5 w-5" />
          </Button>
          {/* </div> */}
        </div>
      )}

      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('billing:package_manage.delete_plan')}
          body={t('billing:package_manage.delete_plan_confirm').replace(
            '{{PLAN_NAME}}',
            data?.data?.name || '',
          )}
          close={close}
          isOpen={isOpen}
          isSuccessDelete={isSuccessDelete}
          handleSubmit={() => {
            mutateDelete({ id: packageId })
          }}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}
