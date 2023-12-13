import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import * as z from 'zod'

import {
  useCreateEntityThing,
  type CreateEntityThingDTO,
  useGetEntityThings,
} from '~/cloud/customProtocol/api/entityThing'
import { thingTypeList } from '~/cloud/customProtocol/components'
import { Button } from '~/components/Button'
import { InputField, SelectDropdown, SelectField } from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import storage from '~/utils/storage'
import { cn } from '~/utils/misc'

import { type EntityThingType } from '~/cloud/customProtocol'
import { nameSchema } from '~/utils/schemaValidation'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { PlusIcon } from '~/components/SVGIcons'

export const entityThingSchema = z
  .object({
    name: nameSchema,
    project_id: z.string().optional(),
    description: z.string(),
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
}: {
  thingType: EntityThingType
  classNameTriggerBtn?: string
}) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id

  const { register, formState, handleSubmit, control, watch, setValue } =
    useForm<CreateEntityThingDTO['data']>({
      resolver: entityThingSchema && zodResolver(entityThingSchema),
    })

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

  useEffect(() => {
    setValue('type', thingType)
  }, [])

  return (
    <FormDialog
      isDone={isSuccessCreateThing}
      title={t('cloud:custom_protocol.thing.create')}
      body={
        <form
          id="create-entityThing"
          className="flex w-full flex-col justify-between space-y-6"
          onSubmit={handleSubmit(values => {
            // console.log('thing values', values)
            if (values.type === 'thing') {
              mutateThing({
                data: {
                  name: values.name,
                  project_id: projectId,
                  description: values.description,
                  type: values.type,
                  base_template: values.base_template,
                },
              })
            }
            if (values.type === 'template') {
              mutateThing({
                data: {
                  name: values.name,
                  project_id: projectId,
                  description: values.description,
                  type: values.type,
                  base_shapes: [values.base_shapes],
                },
              })
            }
            if (values.type === 'shape') {
              mutateThing({
                data: {
                  name: values.name,
                  project_id: projectId,
                  description: values.description,
                  type: values.type,
                },
              })
            }
          })}
        >
          <>
            <InputField
              label={t('cloud:custom_protocol.thing.name')}
              error={formState.errors['name']}
              registration={register('name')}
            />
            <SelectField
              label={t('cloud:custom_protocol.thing.type')}
              error={formState.errors['type']}
              registration={register('type')}
              options={thingTypeList
                .filter(item => item.value === thingType)
                .map(item => ({ ...item, selected: true }))}
              disabled
            />
            {watch('type') === 'thing' ? (
              <SelectDropdown
                label={t('cloud:custom_protocol.thing.base_template')}
                name="base_template"
                control={control}
                options={thingSelectData}
                isOptionDisabled={option => option.label === t('loading:base')}
                noOptionsMessage={() => t('table:no_base_template')}
                isLoading={isLoadingThing}
                maxMenuHeight={150}
                error={formState?.errors?.base_template}
              />
            ) : watch('type') === 'template' ? (
              <SelectDropdown
                label={t('cloud:custom_protocol.thing.base_shapes')}
                name="base_shapes"
                control={control}
                options={thingSelectData}
                isOptionDisabled={option => option.label === t('loading:base')}
                noOptionsMessage={() => t('table:no_base_shapes')}
                isLoading={isLoadingThing}
                maxMenuHeight={150}
                error={formState?.errors?.base_shapes}
              />
            ) : null}
            <InputField
              label={t('cloud:custom_protocol.thing.description')}
              error={formState.errors['description']}
              registration={register('description')}
            />
          </>
        </form>
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
