import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectField,
} from '~/components/Form'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import {
  useCreateEntityThing,
  type CreateEntityThingDTO,
} from '../../api/thingAPI'


import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'

export const deviceSchema = z.object({
  name: nameSchema,
  org_id: selectOptionSchema(),
})

export const entityThingSchema = z
  .object({
    name: nameSchema,
    project_id: z.string().optional(),
    description: z.string(),
    base_template: z.string().nullable(),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.enum(['thing', 'template'] as const),
        base_template: z.string().nullable(),
      }),
      z.object({
        type: z.literal('shape'),
        base_shapes: z.string().nullable(),
      }),
    ]),
  )

export function CreateThing() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const {
    data: dataCreateThing,
    mutate: mutateThing,
    isLoading: isLoadingThing,
    isSuccess: isSuccessThing,
  } = useCreateEntityThing()

  return (

    <FormDialog
      isDone={isSuccessThing}
      title={t('cloud:custom_protocol.thing.create')}
      body={
        <Form<CreateEntityThingDTO['data'], typeof entityThingSchema>
          id="create-entityThing"
          className="flex flex-col justify-between"
          onSubmit={values => {
            // console.log('thing values', values)
            if (values.type === 'thing' || values.type === 'template') {
              mutateThing({
                data: {
                  name: values.name,
                  project_id: projectId,
                  description: values.description,
                  type: values.type,
                  base_template: values.base_template || null,
                },
              })
            }
          }}
          schema={entityThingSchema}
        >
          {({ register, formState }) => {
            return (
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
                  options={[
                    {
                      label: t('cloud:custom_protocol.thing.thing'),
                      value: 'thing',
                      selected: true,
                    },
                    {
                      label: t('cloud:custom_protocol.thing.template'),
                      value: 'template',
                    },
                    {
                      label: t('cloud:custom_protocol.thing.shape'),
                      value: 'shape',
                    },
                  ]}
                />
                <InputField
                  label={t('cloud:custom_protocol.thing.base_template')}
                  error={formState.errors['base_template']}
                  registration={register('base_template')}
                />
                <InputField
                  label={t('cloud:custom_protocol.thing.description')}
                  error={formState.errors['description']}
                  registration={register('description')}
                />
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
          isLoading={isLoadingThing}
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
