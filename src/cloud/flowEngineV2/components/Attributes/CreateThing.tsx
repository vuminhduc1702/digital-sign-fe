import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import {
  useCreateEntityThing,
  useGetEntityThings,
  type CreateEntityThingDTO,
} from '@/cloud/customProtocol/api/entityThing'
import { thingTypeList } from '@/cloud/customProtocol/components'
import { FormDialog } from '@/components/FormDialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/misc'
import storage from '@/utils/storage'

import { type EntityThingType } from '@/cloud/customProtocol'
import { nameSchema } from '@/utils/schemaValidation'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import { PlusIcon } from '@/components/SVGIcons'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const entityThingSchema = z
  .object({
    name: nameSchema,
    // project_id: z.string().optional(),
    description: z.string(),
    share: z.boolean().optional(),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('thing'),
        base_template: z.string().optional(),
      }),
      z.object({
        type: z.literal('template'),
        base_shapes: z.string(),
      }),
      z.object({
        type: z.literal('shape'),
      }),
    ]),
  )

export function CreateThing({
  thingType,
  classNameTriggerBtn,
  open,
  close,
  isOpen,
}: {
  thingType: EntityThingType
  classNameTriggerBtn?: string
  open?: () => void
  close?: () => void
  isOpen?: boolean
}) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id

  const form = useForm<CreateEntityThingDTO['data']>({
    resolver: entityThingSchema && zodResolver(entityThingSchema),
  })

  const { control, handleSubmit, setValue, watch } = form

  const {
    mutate: mutateThing,
    isLoading: isLoadingCreateThing,
    isSuccess: isSuccessCreateThing,
  } = useCreateEntityThing()

  const { data: thingData, isLoading: isLoadingThing } = useGetEntityThings({
    projectId,
    type: thingType,
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const resetData = () => {
    setValue('name', '')
    setValue('description', '')
    setValue('type', thingType)
    setValue('share', false)
  }

  return (
    <FormDialog
      isDone={isSuccessCreateThing}
      resetData={resetData}
      title={t('cloud:custom_protocol.thing.create')}
      body={
        <Form {...form}>
          <form
            id="create-entityThing"
            className="flex w-full flex-col justify-between space-y-6"
            onSubmit={handleSubmit(values => {
              if (values.type === 'thing') {
                mutateThing({
                  data: {
                    name: values.name,
                    project_id: values.share ? undefined : projectId,
                    description: values.description,
                    type: values.type,
                    base_template: values.base_template,
                    share: values.share,
                  },
                })
              }
              if (values.type === 'template') {
                mutateThing({
                  data: {
                    name: values.name,
                    project_id: values.share ? undefined : projectId,
                    description: values.description,
                    type: values.type,
                    base_shapes: values.base_shapes,
                    share: values.share,
                  },
                })
              }
              if (values.type === 'shape') {
                mutateThing({
                  data: {
                    name: values.name,
                    project_id: values.share ? undefined : projectId,
                    description: values.description,
                    type: values.type,
                    share: values.share,
                  },
                })
              }
            })}
          >
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:custom_protocol.thing.name')}
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
                name="type"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:custom_protocol.thing.type')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <NewSelectDropdown
                          isPosition={false}
                          defaultValue={
                            thingTypeList
                              .filter(item => item.value === thingType)
                              .map(item => ({ ...item, selected: true })) ?? ''
                          }
                          isDisabled={true}
                          isClearable={false}
                          options={thingTypeList
                            .filter(item => item.value === thingType)
                            .map(item => ({ ...item, selected: true }))}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              {watch('type') === 'thing' ? (
                <FormField
                  control={form.control}
                  name="base_template"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:custom_protocol.thing.base_template')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <NewSelectDropdown
                            isPosition={false}
                            customOnChange={onChange}
                            isClearable={false}
                            options={thingSelectData}
                            isOptionDisabled={option =>
                              option.label === t('loading:base')
                            }
                            noOptionsMessage={() => t('table:no_base_template')}
                            isLoading={isLoadingThing}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              ) : watch('type') === 'template' ? (
                <FormField
                  control={form.control}
                  name="base_shapes"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:custom_protocol.thing.base_shapes')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <NewSelectDropdown
                            isPosition={false}
                            customOnChange={onChange}
                            isClearable={false}
                            options={thingSelectData}
                            isOptionDisabled={option =>
                              option.label === t('loading:base')
                            }
                            noOptionsMessage={() => t('table:no_base_shapes')}
                            isLoading={isLoadingThing}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              ) : null}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:custom_protocol.thing.description')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="share"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:custom_protocol.thing.shared')}
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
            </>
          </form>
        </Form>
      }
      triggerButton={
        <Button
          variant="trans"
          className={cn('rounded-md', classNameTriggerBtn)}
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      confirmButton={
        <Button
          isLoading={isLoadingCreateThing}
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
