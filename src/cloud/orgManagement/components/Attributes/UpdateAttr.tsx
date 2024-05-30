import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'

import { Button } from '@/components/ui/button'
import { booleanSelectOption, numberInput, valueTypeList } from './CreateAttr'
import { type EntityType, useUpdateAttr } from '../../api/attrAPI'
import { Checkbox } from '@/components/ui/checkbox'
import { useUpdateLogged } from '../../api/attrAPI/updateLogged'

import { type Attribute } from '@/types'
import { attrSchema } from '@/utils/schemaValidation'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

type UpdateAttrProps = {
  entityId: string
  entityType: EntityType
  attributeKey: string
  value: any
  value_type: Attribute['value_type']
  logged: boolean
  close: () => void
  isOpen: boolean
}

export function UpdateAttr({
  entityId,
  entityType,
  attributeKey,
  value,
  value_type,
  logged,
  close,
  isOpen,
}: UpdateAttrProps) {
  const { t } = useTranslation()
  const dataDefault = {
    attribute_key: attributeKey,
    logged: String(logged) === 'true',
    value:
      JSON.parse(JSON.stringify(value)) === ''
        ? undefined
        : JSON.stringify(value),
    value_t: value_type,
  }

  const { mutateAsync: mutateAsyncUpdateLogged } = useUpdateLogged({}, false)
  const { mutate, isLoading, isSuccess } = useUpdateAttr()

  const form = useForm<z.infer<typeof attrSchema>>({
    resolver: attrSchema && zodResolver(attrSchema),
    defaultValues: dataDefault,
  })
  const { formState, handleSubmit, watch, reset } = form

  useEffect(
    () =>
      reset({
        attribute_key: attributeKey,
        logged: String(logged) === 'true',
        value:
          JSON.parse(JSON.stringify(value)) === ''
            ? undefined
            : JSON.stringify(value),
        value_t: value_type,
      }),
    [],
  )

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  const resetForm = () => {
    close()
    reset(dataDefault)
  }

  return (
    <Sheet open={isOpen} onOpenChange={resetForm} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>
            {t('cloud:org_manage.org_manage.add_attr.edit_full')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="update-attr"
              className="w-full space-y-6"
              onSubmit={handleSubmit(async values => {
                if (formState.dirtyFields.logged) {
                  await mutateAsyncUpdateLogged({
                    data: {
                      logged: values.logged,
                    },
                    device_id: entityId,
                    attribute_key: attributeKey,
                    entityType: entityType,
                  })
                }
                mutate({
                  data: {
                    attributes: [
                      {
                        attribute_key: attributeKey,
                        logged: values.logged,
                        value: values.value,
                        value_t: values.value_t,
                      },
                    ],
                  },
                  entityType,
                  entityId,
                })
              })}
            >
              <>
                <section className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4">
                  <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="value_t"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              'cloud:org_manage.org_manage.add_attr.value_type',
                            )}
                          </FormLabel>
                          <div>
                            <Select
                              {...field}
                              onValueChange={e => onChange(e)}
                              value={value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t('placeholder:select')}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {valueTypeList.map(valueType => (
                                  <SelectItem
                                    key={valueType.name}
                                    value={valueType.type}
                                  >
                                    {valueType.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    {watch(`value_t`) === 'BOOL' ? (
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:org_manage.org_manage.add_attr.value')}
                            </FormLabel>
                            <div>
                              <Select
                                {...field}
                                onValueChange={e => onChange(e)}
                                value={value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t('placeholder:select')}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {booleanSelectOption.map(attr => (
                                    <SelectItem
                                      key={attr.label}
                                      value={attr.value}
                                    >
                                      {attr.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:org_manage.org_manage.add_attr.value')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input
                                  {...field}
                                  step={0.000001}
                                  type={
                                    numberInput.includes(
                                      watch(
                                        `value_t`,
                                      ) as (typeof numberInput)[number],
                                    )
                                      ? 'number'
                                      : 'text'
                                  }
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
                      name="logged"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem className="flex flex-col justify-around">
                          <FormLabel>
                            {t('cloud:org_manage.org_manage.add_attr.logged')}
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Checkbox
                                {...field}
                                checked={value}
                                onCheckedChange={onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
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
              onClick={resetForm}
              startIcon={
                <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
              }
            />
            <Button
              className="rounded border-none"
              form="update-attr"
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
