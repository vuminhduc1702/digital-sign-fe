import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  type CreateAttrDTO,
  useCreateAttr,
  type EntityType,
} from '@/cloud/orgManagement/api/attrAPI'
import { Checkbox } from '@/components/ui/checkbox'
import TitleBar from '@/components/Head/TitleBar'

import { attrListSchema } from '@/utils/schemaValidation'

import { PlusIcon } from '@/components/SVGIcons'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'
import { useEffect } from 'react'
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

type CreateAttrProps = {
  entityId: string
  entityType: EntityType
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export const attrListCreateSchema = z.object({
  entity_id: z.string(),
  attributes: attrListSchema,
})

export const valueTypeList = [
  { type: 'STR', name: 'String' },
  { type: 'BOOL', name: 'Boolean' },
  { type: 'LONG', name: 'Long' },
  { type: 'DBL', name: 'Double' },
  { type: 'JSON', name: 'JSON' },
] as const

export const valueConvertTypeList = [
  { type: 'STR', name: 'String' },
  { type: 'BOOL', name: 'Boolean' },
  { type: 'LONG', name: 'Long' },
  { type: 'LONG', name: 'Integer' },
  { type: 'LONG', name: 'Unsigned Integer' },
  { type: 'DBL', name: 'Double' },
  { type: 'JSON', name: 'JSON' },
] as const

export const booleanSelectOption = [
  { label: 'False', value: 'false' },
  { label: 'True', value: 'true' },
] as const

export const numberInput = ['DBL', 'LONG']

export function CreateAttr({
  entityId,
  entityType,
  open,
  close,
  isOpen,
}: CreateAttrProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useCreateAttr()

  const valueTypeOptions = valueTypeList.map(valueType => ({
    label: valueType.name,
    value: valueType.type,
  }))

  const form = useForm<CreateAttrDTO['data']>({
    resolver: attrListCreateSchema && zodResolver(attrListCreateSchema),
    defaultValues: {
      entity_id: entityId,
      entity_type: entityType,
      attributes: [{ attribute_key: '', value: '', logged: true, value_t: '' }],
    },
  })
  const { control, watch, handleSubmit, reset } = form

  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  })

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
            {t('cloud:org_manage.org_manage.add_attr.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="create-attr"
              className="w-full space-y-5"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    entity_id: entityId,
                    entity_type: entityType,
                    attributes: [...values.attributes],
                  },
                })
              })}
            >
              <>
                <div className="flex justify-between space-x-3">
                  <TitleBar
                    title={t('cloud:org_manage.org_manage.attr_list')}
                    className="w-full rounded-md bg-secondary-700 pl-3"
                  />
                  <Button
                    className="rounded-md"
                    variant="trans"
                    size="square"
                    startIcon={
                      <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                    }
                    onClick={() =>
                      append({
                        attribute_key: '',
                        value: '',
                        logged: true,
                        value_t: '',
                      })
                    }
                  />
                </div>
                {fields.map((field, index) => (
                  <section
                    className="mt-3 flex justify-between rounded-md bg-slate-200 px-2 py-4"
                    key={field.id}
                  >
                    <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`attributes.${index}.attribute_key`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:org_manage.org_manage.add_attr.name')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`attributes.${index}.value_t`}
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
                                  {valueTypeOptions.map(template => (
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
                      {watch(`attributes.${index}.value_t`) === 'BOOL' ? (
                        <FormField
                          control={form.control}
                          name={`attributes.${index}.value`}
                          render={({
                            field: { onChange, value, ...field },
                          }) => (
                            <FormItem>
                              <FormLabel>
                                {t(
                                  'cloud:org_manage.org_manage.add_attr.value',
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
                                    {booleanSelectOption.map(template => (
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
                      ) : (
                        <FormField
                          control={form.control}
                          name={`attributes.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t(
                                  'cloud:org_manage.org_manage.add_attr.value',
                                )}
                              </FormLabel>
                              <div>
                                <FormControl>
                                  <Input
                                    {...field}
                                    step={0.000001}
                                    type={
                                      numberInput.includes(
                                        watch(`attributes.${index}.value_t`),
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
                        name={`attributes.${index}.logged`}
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
                    <Button
                      type="button"
                      size="square"
                      variant="trans"
                      className="mt-3 border-none"
                      onClick={() => remove(index)}
                      startIcon={
                        <img
                          src={btnDeleteIcon}
                          alt="Delete device template"
                          className="h-8 w-8"
                        />
                      }
                    />
                  </section>
                ))}
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
              form="create-attr"
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
