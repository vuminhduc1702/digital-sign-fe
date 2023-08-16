import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import {
  Form,
  FormDrawer,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import storage from '~/utils/storage'
import { useCreateGroup, type CreateGroupDTO } from '../../api/groupAPI'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import { useDefaultCombobox } from '~/utils/hooks'
import { flattenData } from '~/utils/misc'
import { queryClient } from '~/lib/react-query'

import { type OrgList } from '~/layout/MainLayout/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

type EntityTypeGroup = {
  type: 'ORGANIZATION' | 'DEVICE' | 'USER' | 'EVENT'
  name: string
}

export const entityTypeList: EntityTypeGroup[] = [
  { type: 'ORGANIZATION', name: 'Tổ chức' },
  { type: 'DEVICE', name: 'Thiết bị' },
  { type: 'USER', name: 'Người dùng' },
  { type: 'EVENT', name: 'Sự kiện' },
]

const groupSchema = z.object({
  name: nameSchema,
  entity_type: z.string(),
  org_id: selectOptionSchema(),
})

export function CreateGroup() {
  const { t } = useTranslation()

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

  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useCreateGroup()

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
      title={t('cloud:org_manage.group_manage.add_group.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-group"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateGroupDTO['data'], typeof groupSchema>
        id="create-group"
        onSubmit={values => {
          mutate({
            data: {
              name: values.name,
              entity_type: values.entity_type,
              project_id: projectId,
              org_id: (
                values.org_id as unknown as { value: string; label: string }
              ).value,
            },
          })
        }}
        schema={groupSchema}
      >
        {({ register, formState, control }) => (
          <>
            <InputField
              label={
                t('cloud:org_manage.group_manage.add_group.name') ?? 'Name'
              }
              error={formState.errors['name']}
              registration={register('name')}
            />
            <SelectField
              label={
                t('cloud:org_manage.group_manage.add_group.entity_type') ??
                'Entity type'
              }
              error={formState.errors['entity_type']}
              registration={register('entity_type')}
              options={entityTypeList.map(entityType => ({
                label: entityType.name,
                value: entityType.type,
              }))}
            />
            <div className="space-y-1">
              <SelectDropdown
                label={t('cloud:org_manage.device_manage.add_device.parent')}
                name="org_id"
                control={control}
                options={
                  orgFlattenData?.map(org => ({
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
        )}
      </Form>
    </FormDrawer>
  )
}
