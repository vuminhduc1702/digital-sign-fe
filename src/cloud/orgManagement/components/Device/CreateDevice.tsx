import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField, SelectDropdown } from '~/components/Form'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import { useCreateDevice, type CreateDeviceDTO } from '../../api/deviceAPI'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import { useDefaultCombobox } from '~/utils/hooks'
import storage from '~/utils/storage'

import { type OrgList } from '~/layout/MainLayout/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const deviceSchema = z.object({
  name: nameSchema,
  org_id: selectOptionSchema(),
})

export function CreateDevice() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useCreateDevice()

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations || [],
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const defaultComboboxOrgData = useDefaultCombobox('org')
  const orgSelectOptions = [defaultComboboxOrgData, ...orgFlattenData]

  return (
    <FormDrawer
      isDone={isSuccess}
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:org_manage.device_manage.add_device.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-device"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateDeviceDTO['data'], typeof deviceSchema>
        id="create-device"
        onSubmit={values => {
          console.log('values', values)
          mutate({
            data: {
              project_id: projectId,
              org_id: (
                values.org_id as unknown as { value: string; label: string }
              ).value,
              name: values.name,
            },
          })
        }}
        schema={deviceSchema}
      >
        {({ register, formState, control }) => {
          return (
            <>
              <InputField
                label={
                  t('cloud:org_manage.device_manage.add_device.name') ?? 'Name'
                }
                error={formState.errors['name']}
                registration={register('name')}
              />
              <div className="space-y-1">
                <SelectDropdown
                  label={t('cloud:org_manage.device_manage.add_device.parent')}
                  name="org_id"
                  control={control}
                  options={
                    orgSelectOptions?.map(org => ({
                      label: org?.name,
                      value: org?.id,
                    })) || [{ label: t('loading:org'), value: '' }]
                  }
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.org_id?.message}
                </p>
              </div>
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
