import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useEffect, useState } from 'react'
import btnAddIcon from '~/assets/icons/btn-add.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEdit from '~/assets/icons/edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { Checkbox } from '~/components/Checkbox'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import {
  FormMultipleFields,
  InputField,
  SelectField,
  TextAreaField,
} from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { useDeletePlan, useUpdatePlan, type UpdatePlanDTO } from '../api'
import { usePlanById } from '../api/getPackageById'
import { type PlanlvList } from '../types'
import { entityPlanSchema } from './CreatePackage'
import { cn } from '~/utils/misc'

export function PackageInfo() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const [type, setType] = useState('')
  const [paymentType, setPaymentType] = useState('')
  const [periodType, setPeriodType] = useState('')
  const [expectedPayment, setExpectedPayment] = useState()

  const params = useParams()
  const { id: projectId } = storage.getProject()

  const packageId = params.packageId as string
  const {
    mutate: mutateDelete,
    isLoading: isLoadingDelete,
    isSuccess: isSuccessDelete,
  } = useDeletePlan()

  const { mutate, isLoading, isSuccess } = useUpdatePlan()

  const { data, refetch: refetchData } = usePlanById({ planId: packageId })

  useEffect(() => {
    setEstimates(data?.data?.estimate || '')
    setType(data?.data?.type || '')
    setPaymentType(data?.data?.payment_type || '')
    setPeriodType(data?.data?.type_period || '')
    setIsDisabled(true)
  }, [data])

  useEffect(() => {
    if (isSuccessDelete) {
      navigate(`${PATHS.BILLING_PACKAGE}/${projectId}`)
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
  ) => {
    let result: any
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
    setExpectedPayment(result)
  }

  return (
    <>
      {/* <TitleBar title={t('billing:package_manage.title')} /> */}
      <FormMultipleFields<UpdatePlanDTO['data'], typeof entityPlanSchema>
        id="update-plan"
        className="flex flex-col justify-between"
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
              fix_cost: (values.fix_cost && parseInt(values.fix_cost)) || null,
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
        schema={entityPlanSchema}
        name={['plan_lv']}
        options={{
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
          },
        }}
      >
        {(
          { register, formState, setValue, getValues, setError },
          { append: planlvAppend, fields: planlvFields, remove: planlvRemove },
        ) => {
          return (
            <>
              {/* <p className="flex p-3 md:p-1 items-start rounded-md border bg-gray-200 text-lg font-semibold">{t('billing:package_manage.title')}</p> */}
              <p className="flex md:p-2 items-start rounded-md border bg-gray-200 text-lg font-semibold">{t('billing:package_manage.title')}</p>
              <div className="!mt-2 grid grow	grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
                <InputField
                  label={t('billing:package_manage.popup.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                  classnamefieldwrapper=""
                  disabled={isDisabled}
                  classlabel="w-full"
                  classchild="w-full"
                />
                <SelectField
                  label={t('billing:package_manage.popup.type')}
                  error={formState.errors['type']}
                  registration={register('type')}
                  options={[
                    { label: 'Chính thức', value: 'official' },
                    { label: 'Dùng thử', value: 'trial' },
                  ]}
                  onChange={e => {
                    setType(e.target.value)
                    setPaymentType('PREPAY')
                  }}
                  classnamefieldwrapper=""
                  disabled={isDisabled}
                  classlabel="w-full"
                  classchild="w-full"
                />
                <TextAreaField
                  label={t('billing:package_manage.popup.description')}
                  error={formState.errors['description']}
                  registration={register('description')}
                  classnamefieldwrapper=""
                  disabled={isDisabled}
                  classlabel="w-full"
                  classchild="w-full"
                />
                <div className="relative w-full">
                  <label>{t('billing:package_manage.popup.status')}</label>
                  <div className="items-center mt-1">
                    {[
                      { label: 'Hiển thị', value: 'present' },
                      { label: 'Ẩn', value: 'hidden' },
                    ].map((option, idx) => (
                      <div key={idx} className="flex items-center mt-2 mb-2 mr-4 ">
                        <input
                          type="radio"
                          id={`radio-${option.value}`}
                          {...register('status')}
                          value={option.value}
                          disabled={isDisabled}
                          className="w-4 h-4 mr-3 cursor-pointer"
                        />
                        <label htmlFor={`radio-${option.value}`} className="cursor-pointer">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="!mt-2 flex md:p-2 items-start rounded-md border bg-gray-200 text-lg font-semibold">
                {t('billing:package_manage.popup.data_plan')}
              </p>
              <div className="!mt-2 grid grow	grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
                <SelectField
                  label={t('billing:package_manage.popup.payment_type')}
                  error={formState.errors['payment_type']}
                  registration={register('payment_type')}
                  onChange={e => {
                    setPaymentType(e.target.value)
                    setValue('payment_type', e.target.value)
                    setPeriodType('PERIODIC')
                  }}
                  options={
                    type === 'trial'
                      ? [{ label: 'Trả trước', value: 'PREPAY' }]
                      : [
                          { label: 'Trả trước', value: 'PREPAY' },
                          { label: 'Trả sau', value: 'POSTPAID' },
                        ]
                  }
                  classnamefieldwrapper=""
                  disabled={isDisabled}
                  classlabel="w-full"
                  classchild="w-full"
                />
                <div className="flex items-center">
                  {paymentType === 'POSTPAID' && (
                    <InputField
                      label={t('billing:package_manage.popup.expiry')}
                      error={formState.errors['expiry']}
                      registration={register('expiry')}
                      type="number"
                      classnamefieldwrapper=""
                      classlabel="w-full"
                      classchild="w-full"
                      onChange={e => {
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
                        } else setError('expiry', { message: '' })
                      }}
                    />
                  )}
                </div>
                <SelectField
                  label={t('billing:package_manage.popup.type_period')}
                  error={formState.errors['type_period']}
                  registration={register('type_period')}
                  options={
                    type === 'official' && paymentType === 'PREPAY'
                      ? [
                          { label: 'Định kỳ', value: 'PERIODIC' },
                          { label: 'Một lần', value: 'ONCE' },
                        ]
                      : [{ label: 'Định kỳ', value: 'PERIODIC' }]
                  }
                  onChange={e => setPeriodType(e.target.value)}
                  classnamefieldwrapper=""
                  disabled={isDisabled}
                  classlabel="w-full"
                  classchild="w-full"
                />
                {periodType === 'PERIODIC' ? (
                  <div
                    className={cn('', {
                      'flex items-center': !formState?.errors?.period?.message,
                    })}
                  >
                    <div className="grid grow	grid-cols-1 gap-x-10 md:grid-cols-2">
                      <div className="flex flex-col gap-2 md:col-span-1">
                        <InputField
                          label={t('billing:package_manage.popup.period')}
                          error={formState.errors['period']}
                          registration={register('period')}
                          classlabel="w-full"
                          classchild="w-full"
                          type="number"
                          classnamefieldwrapper=""
                          disabled={isDisabled}
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-1 mt-4">
                        <SelectField
                          error={formState.errors['cal_unit']}
                          registration={register('cal_unit')}
                          options={[
                            { label: 'Ngày', value: 'day' },
                            { label: 'Tuần', value: 'week' },
                            { label: 'Tháng', value: 'month' },
                            { label: 'Năm', value: 'year' },
                          ]}
                          className="px-2"
                          disabled={isDisabled}
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
                <InputField
                  label={t('billing:package_manage.popup.fix_cost')}
                  error={formState.errors['fix_cost']}
                  registration={register('fix_cost')}
                  type="number"
                  classnamefieldwrapper=""
                  disabled={isDisabled}
                  classlabel="w-full"
                  classchild="w-full"
                />
                <SelectField
                  label={t('billing:package_manage.popup.charging_unit')}
                  error={formState.errors['charging_unit']}
                  registration={register('charging_unit')}
                  options={[
                    { label: 'Kết nối', value: 'message' },
                    { label: 'Thiết bị', value: 'device' },
                    { label: 'API', value: 'api' },
                  ]}
                  className="!mt-0"
                  classnamefieldwrapper=""
                  disabled={isDisabled}
                  classlabel="w-full"
                  classchild="w-full"
                />
              </div>
              <p className="!mt-2 flex md:p-2 items-start rounded-md border bg-gray-200 text-lg font-semibold">
                {t('billing:package_manage.popup.estimate')}
              </p>
              <div className="!mt-3 grid grow	grid-cols-1 gap-x-10 gap-y-1">
                <div className="grid grow	grid-cols-1 gap-x-10 md:grid-cols-2">
                  <SelectField
                    label={t('billing:package_manage.popup.estimate')}
                    error={formState.errors['estimate']}
                    registration={register('estimate')}
                    disabled={isDisabled}
                    options={
                      type === 'official' &&
                      paymentType === 'POSTPAID' &&
                      periodType === 'PERIODIC'
                        ? [
                            { label: 'Theo khối lượng', value: 'mass' },
                            { label: 'Cố định', value: 'fix' },
                            { label: 'Theo đơn vị', value: 'unit' },
                            { label: 'Theo lũy kế', value: 'accumulated' },
                            { label: 'Theo bậc thang', value: 'step' },
                          ]
                        : [
                            { label: 'Cố định', value: 'fix' },
                            { label: 'Theo đơn vị', value: 'unit' },
                          ]
                    }
                    onChange={e => {
                      setEstimates(e.target.value)
                      setValue('plan_lv', [
                        {
                          level: '',
                          price: '',
                          free: '',
                        },
                      ])
                      setValue('quantity_free', '')
                      setValue('price', '')
                    }}
                    classnamefieldwrapper=""
                    classlabel="w-full"
                    classchild="w-full"
                  />
                  {(estimates === 'mass' ||
                    estimates === 'accumulated' ||
                    estimates === 'step') && (
                    <div className="flex items-center">
                      <img
                        onClick={() => {
                          let arrPlan = getValues('plan_lv')
                          const index = getValues('plan_lv')?.length - 1
                          if (arrPlan[index].level) {
                            planlvAppend({
                              level: '',
                              price: '',
                              free: '',
                            })
                          }
                        }}
                        src={btnAddIcon}
                        alt="add-icon"
                        className="icon-container w-7 h-7 flex items-center justify-center cursor-pointer mt-5"
                      />
                    </div>
                  )}
                </div>
                <div className="max-h-[122px] overflow-auto mr-8">
                  {estimates === 'mass' ||
                  estimates === 'accumulated' ||
                  estimates === 'step'
                    ? planlvFields.map((field, index) => {
                        return (
                          <section className="flex w-full" key={field.id}>
                            <div
                              className={cn('grid w-full grid-cols-1 gap-x-4', {
                                // 'md:grid-cols-2':
                                //   estimates === 'accumulated' ||
                                //   estimates === 'step',
                                // 'md:grid-cols-3': estimates === 'mass',
                                'md:grid-cols-3':
                                      estimates === 'accumulated' ||
                                      estimates === 'step'||
                                      estimates === 'mass',
                              })}
                            >
                              <InputField
                                label={
                                  estimates === 'step'
                                    ? t('billing:package_manage.popup.max')
                                    : t(
                                        'billing:package_manage.popup.level',
                                      ).replace(
                                        '{{NUMBER}}',
                                        index >= 1
                                          ? getValues('plan_lv')?.[
                                              index - 1
                                            ].level?.toString()
                                          : '1',
                                      )
                                }
                                registration={register(
                                  `plan_lv.${index}.level`,
                                )}
                                type="number"
                                classnamefieldwrapper="flex items-center gap-x-3"
                                disabled={isDisabled}
                                classlabel="w-2/12"
                                classchild="w-10/12"
                              />
                              <div>
                                <InputField
                                  label={
                                    estimates === 'step'
                                      ? t('billing:package_manage.popup.price')
                                      : t(
                                          'billing:package_manage.popup.unit_price',
                                        )
                                  }
                                  registration={register(
                                    `plan_lv.${index}.price`,
                                  )}
                                  min="1"
                                  type="number"
                                  disabled={isDisabled}
                                  classnamefieldwrapper="flex items-center gap-x-3"
                                  classlabel="w-2/12"
                                  classchild="w-10/12"
                                />
                                <p className="text-body-sm text-primary-400">
                                  {
                                    formState?.errors?.plan_lv?.[index]?.price
                                      ?.message
                                  }
                                </p>
                              </div>
                              {estimates === 'mass' && (
                                <InputField
                                  label={t('billing:package_manage.popup.free')}
                                  registration={register(
                                    `plan_lv.${index}.free`,
                                  )}
                                  type="number"
                                  classnamefieldwrapper="flex items-center gap-x-3"
                                  disabled={isDisabled}
                                  classlabel="w-2/12"
                                  classchild="w-10/12"
                                />
                              )}
                            </div>
                            <Button
                              type="button"
                              size="square"
                              variant="trans"
                              disabled={isDisabled}
                              className="border-none shadow-none"
                              onClick={() => planlvRemove(index)}
                              startIcon={
                                <img
                                  src={btnDeleteIcon}
                                  alt="Delete condition"
                                  className="icon-container w-6 h-6 flex items-center justify-center ml-2"
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
                    <InputField
                      label={t('billing:package_manage.popup.price')}
                      error={formState.errors['price']}
                      registration={register('price')}
                      classnamefieldwrapper="flex items-center gap-x-3"
                      type="number"
                      onChange={e =>
                        estimates === 'fix' &&
                        handleOnChange(
                          '',
                          getValues('tax'),
                          e.target.value,
                          getValues('fix_cost'),
                          getValues('quantity_free'),
                          getValues('plan_lv'),
                        )
                      }
                      disabled={isDisabled}
                      classlabel="w-1/5"
                      classchild="w-1/2"
                    />
                    {estimates === 'unit' && (
                      <InputField
                        label={t('billing:package_manage.popup.quantity_free')}
                        error={formState.errors['quantity_free']}
                        registration={register('quantity_free')}
                        classnamefieldwrapper="flex items-center gap-x-3"
                        type="number"
                        disabled={isDisabled}
                        classlabel="w-1/5"
                        classchild="w-1/2"
                      /> 
                    )}
                  </div>
                )}
              </div>
              <p className="!mt-3">
                {t('billing:package_manage.popup.estimated_payment')}
              </p>
              <div className="!mt-2 grid grow	grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-3">
                <InputField
                  label={t('billing:package_manage.popup.tax')}
                  error={formState.errors['tax']}
                  registration={register('tax')}
                  disabled={isDisabled}
                  classnamefieldwrapper="flex items-center"
                  classlabel="w-2/5"
                  classchild="w-3/5"
                />
                <div className="flex items-center">(mặc định 10%)</div>
                <div className="flex items-center"></div>
                {estimates !== 'fix' && (
                  <InputField
                    label={t('billing:package_manage.popup.expected_number')}
                    onChange={e =>
                      handleOnChange(
                        e.target.value,
                        getValues('tax'),
                        getValues('price'),
                        getValues('fix_cost'),
                        getValues('quantity_free'),
                        getValues('plan_lv'),
                      )
                    }
                    classnamefieldwrapper="flex items-center "
                    classlabel="w-2/5"
                    classchild="w-3/5"
                  />
                )}
                <InputField
                  label={t('billing:package_manage.popup.expected_payment')}
                  disabled
                  value={expectedPayment}
                  classnamefieldwrapper="flex items-center"
                  classlabel="w-2/5"
                  classchild="w-3/5"
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
                      setValue(
                        'fix_cost',
                        data?.data?.fix_cost?.toString() || '',
                      )
                      setValue('charging_unit', data?.data?.charging_unit || '')
                      setValue('estimate', data?.data?.estimate || '')
                      setValue('price', data?.data?.price?.toString() || '')
                      setValue(
                        'quantity_free',
                        data?.data?.quantity_free?.toString() || '',
                      )
                      setValue('plan_lv', data?.data?.plan_lv || [])
                      setValue('tax', data?.data?.tax?.toString() || '')
                      setEstimates(data?.data?.estimate || '')
                      setIsDisabled(!isDisabled)
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
          )
        }}
      </FormMultipleFields>

      {isDisabled && (
        <div className="flex">
          <div className="absolute w-[100px] bottom-1 bg-gray-100 rounded-md">
            <ConfirmationDialog
              isDone={isSuccessDelete}
              icon="danger"
              title={t('billing:package_manage.delete_plan')}
              body={
                t('billing:package_manage.delete_plan_confirm').replace(
                  '{{PLAN_NAME}}',
                  data?.data?.name || '',
                ) ?? 'Confirm delete?'
              }
              triggerButton={
                <Button
                  className="w-full justify-center border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
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
              }
              confirmButton={
                <Button
                  isLoading={isLoadingDelete}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutateDelete({ id: packageId })}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
          {/* <div className="absolute bottom-3 right-[2/5] rounded-md"> */}
          <Button
            type="button"
            size="md"
            className="absolute bottom-1 right-11 bg-primary-400 rounded-md"
            onClick={() => setIsDisabled(!isDisabled)}
          >
            {t('btn:update')}
            <img
              src={btnEdit}
              alt="Delete thing"
              className="h-5 w-5"
            />
          </Button>
          {/* </div> */}
        </div>
      )}
    </>
  )
}
