import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  useDeleteSubcription,
  useSubcriptionById,
  useUpdateSubcription,
  type UpdateSubcriptionDTO,
} from '../../api/subcriptionAPI'

import { HiOutlineXMark } from 'react-icons/hi2'
import * as z from 'zod'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useDisclosure } from '@/utils/hooks'
import { getVNDateFormat } from '@/utils/misc'

export const entitySubcriptionUpdateSchema = z.object({
  register: z.string(),
  c_name: z.string().optional(),
  c_customer_code: z.string().optional(),
  p_name: z.string().optional(),
  status: z.string().optional(),
  price_method: z.string().optional(),
  p_payment_type: z.string().optional(),
  s_date_register: z.string().optional(),
  period: z.string().optional(),
  s_cycle_now: z.string().optional(),
})

type UpdateSubcriptionProps = {
  id: string
  close: () => void
  isOpen: boolean
}
export function UpdateSubcription({
  id,
  close,
  isOpen,
}: UpdateSubcriptionProps) {
  const { t } = useTranslation()
  const [isUpdate, setIsUpdate] = useState(false)
  const cancelButtonRef = useRef(null)

  const { data, refetch } = useSubcriptionById({
    id,
  })

  const { mutateAsync, isLoading, isSuccess } = useUpdateSubcription()

  const { close: closeDelete, open, isOpen: isOpenDelete } = useDisclosure()

  const {
    mutate: mutateDelete,
    isLoading: isLoadingDelete,
    isSuccess: isSuccessDelete,
  } = useDeleteSubcription()

  useEffect(() => {
    if (isSuccess || isSuccessDelete) {
      close()
      setIsUpdate(false)
    }
  }, [isSuccess, close, isSuccessDelete])

  const valuePriceMethod = () => {
    let result = ''
    if (data?.data?.p_estimate) {
      switch (data?.data?.p_estimate) {
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
    if (data?.data?.p_cal_unit) {
      switch (data?.data?.p_cal_unit) {
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
      data?.data?.p_period ? data?.data?.p_period + result : '',
    )
  }

  const valueStatus = () => {
    let result = ''
    if (data?.data?.s_status) {
      switch (data?.data?.s_status) {
        case 'Active':
          result = 'Hoạt động'
          break
        case 'Pending Cancel':
          result = 'Chờ hủy'
          break
        case 'Cancelled':
          result = 'Đã hủy'
          break
        case 'Pending Active':
          result = 'Chờ kích hoạt'
          break
        case 'Finished':
          result = 'Đã kết thúc'
          break
        default:
          break
      }
    }
    return setValue('status', result)
  }

  const form = useForm<UpdateSubcriptionDTO['data']>({
    resolver:
      entitySubcriptionUpdateSchema &&
      zodResolver(entitySubcriptionUpdateSchema),
    values: {
      register: data?.data?.s_register?.toString() || '',
    },
  })
  const { control, handleSubmit, setValue, formState, register, reset } = form

  useEffect(() => {
    setValue('register', data?.data?.s_register?.toString() ?? '')
    setValue('c_name', data?.data?.c_name ?? '')
    setValue('c_customer_code', data?.data?.c_customer_code ?? '')
    setValue('p_name', data?.data?.p_name ?? '')
    setValue(
      'p_payment_type',
      data?.data?.p_payment_type
        ? data?.data?.p_payment_type === 'PREPAY'
          ? 'Trả trước'
          : 'Trả sau'
        : '',
    )
    setValue(
      's_date_register',
      getVNDateFormat({
        date: (data?.data?.s_date_register || 0) * 1000,
      }) ?? '',
    )
    setValue(
      's_cycle_now',
      data?.data?.s_cycle_now ? (data?.data?.s_cycle_now).toString() : '',
    )
    valueStatus()
    valuePeriod()
    valuePriceMethod()
  }, [data, isOpen])

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="mx-auto text-2xl font-semibold ">
              {isUpdate
                ? t('billing:subcription.edit')
                : t('billing:subcription.title')}
            </DialogTitle>
            <div className="flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={() => {
                  close()
                  reset()
                  setIsUpdate(false)
                }}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <Form {...form}>
            <form
              id="update-subcription"
              className="flex w-full flex-col justify-between space-y-6"
              onSubmit={handleSubmit(async values => {
                await mutateAsync({
                  data: {
                    register: parseInt(values.register),
                  },
                  id: id || '',
                })
                refetch()
              })}
            >
              <>
                <div className="mt-2 flex justify-between gap-2 py-2 ">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold">
                      {t('billing:subcription.table.sub_code')} : {id}
                    </p>
                  </div>
                  {(data?.data?.s_status === 'Active' ||
                    data?.data?.s_status === 'Pending Active') &&
                    !isUpdate && (
                      <div>
                        <Button
                          className="w-full rounded-md border-none bg-orange-500 text-white shadow-none"
                          style={{ justifyContent: 'flex-start' }}
                          variant="trans"
                          onClick={open}
                          size="square"
                        >
                          {t('billing:subcription.delete')}
                        </Button>
                      </div>
                    )}
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 ">
                  <div className="flex gap-3">
                    <p className="text-lg font-semibold">
                      {t('billing:subcription.popup.customer_info')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="c_name"
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
                    name="c_customer_code"
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
                <div className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2">
                  <div className="flex gap-3">
                    <p className="text-lg font-semibold">
                      {t('billing:subcription.popup.service_info')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="p_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('billing:subcription.popup.package')}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('billing:subcription.table.status')}
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
                  {data?.data?.p_estimate !== 'fix' && (
                    <FormField
                      control={form.control}
                      name="register"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('billing:subcription.popup.quantity')}
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                disabled={!isUpdate}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2">
                  <div className="flex gap-3">
                    <p className="text-lg font-semibold">
                      {t('billing:subcription.popup.billing_info')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="p_payment_type"
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
                  <FormField
                    control={form.control}
                    name="s_date_register"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('billing:subcription.table.start_date')}
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
                  <FormField
                    control={form.control}
                    name="s_cycle_now"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('billing:subcription.table.cycle_now')}
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
        </div>
        <div className="mt-4 flex justify-center space-x-3">
          {!isUpdate ? (
            <>
              <Button
                type="button"
                className="w-[100px] rounded-md"
                variant="trans"
                onClick={close}
                ref={cancelButtonRef}
              >
                {t('btn:close')}
              </Button>
              {data?.data?.s_status !== 'Cancelled' &&
                data?.data?.p_estimate !== 'fix' && (
                  <Button
                    onClick={() => setIsUpdate(true)}
                    size="md"
                    className="w-[100px] rounded-md bg-primary-400"
                  >
                    {t('btn:update')}
                  </Button>
                )}
            </>
          ) : (
            <Button
              isLoading={isLoading}
              form="update-subcription"
              type="submit"
              size="md"
              className="bg-primary-400 "
            >
              {t('btn:save')}
            </Button>
          )}
        </div>
      </div>
      <ConfirmDialog
        icon="danger"
        title={t('billing:subcription.delete')}
        body={t('billing:subcription.delete_sub_confirm').replace(
          '{{SUBCRIPTION}}',
          id,
        )}
        close={closeDelete}
        isOpen={isOpenDelete}
        isSuccessDelete={isSuccessDelete}
        handleSubmit={() => mutateDelete({ id })}
        isLoading={isLoadingDelete}
      />
    </Dialog>
  )
}
