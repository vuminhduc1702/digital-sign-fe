import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import {
  useCreateEntityThing,
  type CreateEntityThingDTO,
  useGetEntityThings,
} from '~/cloud/customProtocol/api/entityThing'
import { Button } from '~/components/Button'
import { Form, InputField, SelectField } from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
export const deviceSchema = z.object({
  name: nameSchema,
  org_id: selectOptionSchema(),
})

export const entityThingSchema = z.object({
  name: nameSchema,
  project_id: z.string().optional(),
  description: z.string(),
  base_template: z.string().nullable(),
  type: z.string().nullable(),
})

export function CreateThing() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const { data: thingData, isSuccess } = useGetEntityThings({
    projectId,
    type: 'template',
  })

  const {
    data: dataCreateThing,
    mutate: mutateThing,
    isLoading: isLoadingThing,
    isSuccess: isSuccessThing,
  } = useCreateEntityThing()

  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  })) || [{ value: '', label: '' }]
  const { register, formState, control, setValue, handleSubmit } = useForm<
  CreateEntityThingDTO['data']
  >({
    resolver: entityThingSchema && zodResolver(entityThingSchema),
  })

  return (
    <FormDialog
      isDone={isSuccessThing}
      title={t('cloud:custom_protocol.thing.create')}
      body={
        // <Form<CreateEntityThingDTO['data'], typeof entityThingSchema>
        <form
          id="create-entityThing"
          className="flex flex-col justify-between"
          onSubmit={handleSubmit(values => {
            mutateThing({
              data: {
                name: values.name,
                project_id: projectId,
                description: values.description,
                base_template: values.base_template || null,
                type: 'thing',
              },
            })
          })}
          // schema={entityThingSchema}
        >
          {/* {({ register, formState }) => {
            return ( */}
              <>
                <InputField
                  label={t('cloud:custom_protocol.thing.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                />
                <div className="hidden">
                  <InputField
                    label={t('cloud:custom_protocol.thing.name')}
                    error={formState.errors['type']}
                    registration={register('type')}
                  />
                </div>
                {/* <InputField
                  label={t('cloud:custom_protocol.thing.base_template')}
                  error={formState.errors['base_template']}
                  registration={register('base_template')}
                /> */}
                <SelectField
                  label={t('cloud:custom_protocol.thing.base_template')}
                  error={formState.errors['base_template']}
                  registration={register('base_template')}
                  options={thingSelectData}
                />
                <InputField
                  label={t('cloud:custom_protocol.thing.description')}
                  error={formState.errors['description']}
                  registration={register('description')}
                />
              </>
              </form>
        //     )
        //   }}
        // </Form>
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
