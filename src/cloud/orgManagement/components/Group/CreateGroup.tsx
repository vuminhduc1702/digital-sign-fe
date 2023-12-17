import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import storage from '~/utils/storage'
import { useCreateGroup, type CreateGroupDTO } from '../../api/groupAPI'
import { nameSchema } from '~/utils/schemaValidation'
import { flattenData } from '~/utils/misc'
import { useGetOrgs } from '~/layout/MainLayout/api'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const entityTypeList = [
  { type: 'ORGANIZATION', name: 'Tổ chức' },
  { type: 'DEVICE', name: 'Thiết bị' },
  { type: 'USER', name: 'Người dùng' },
  { type: 'EVENT', name: 'Sự kiện' },
]

const groupCreateSchema = z.object({
  name: nameSchema,
  entity_type: z.string(),
  org_id: z.string().optional(),
})

export function CreateGroup() {
  const { t } = useTranslation()

  const entityTypeOptions = entityTypeList.map(entityType => ({
    label: entityType.name,
    value: entityType.type,
  }))

  const projectId = storage.getProject()?.id
  const { data: orgData, isLoading: orgIsLoading } = useGetOrgs({ projectId })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData?.map(org => ({
    label: org?.name,
    value: org?.id,
  }))

  const { mutate, isLoading, isSuccess } = useCreateGroup()
  const { register, formState, control, handleSubmit, reset } = useForm<
    CreateGroupDTO['data']
  >({
    resolver: groupCreateSchema && zodResolver(groupCreateSchema),
  })

  return (
    <FormDrawer
      isDone={isSuccess}
      resetData={() => reset()}
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
      <form
        id="create-group"
        className="w-full space-y-6"
        onSubmit={handleSubmit(values => {
          mutate({
            data: {
              name: values.name,
              entity_type: values.entity_type,
              project_id: projectId,
              org_id: values.org_id,
            },
          })
        })}
      >
        <>
          <InputField
            label={t('cloud:org_manage.group_manage.add_group.name')}
            error={formState.errors['name']}
            registration={register('name')}
          />
          <SelectField
            label={t('cloud:org_manage.group_manage.add_group.entity_type')}
            error={formState.errors['entity_type']}
            registration={register('entity_type')}
            options={entityTypeOptions}
          />

          <SelectDropdown
            label={t('cloud:org_manage.device_manage.add_device.parent')}
            name="org_id"
            control={control}
            options={orgSelectOptions}
            isOptionDisabled={option =>
              option.label === t('loading:org') ||
              option.label === t('table:no_in_org')
            }
            noOptionsMessage={() => t('table:no_in_org')}
            loadingMessage={() => t('loading:org')}
            isLoading={orgIsLoading}
            placeholder={t('cloud:org_manage.org_manage.add_org.choose_org')}
            error={formState?.errors?.org_id}
          />
        </>
      </form>
    </FormDrawer>
  )
}
