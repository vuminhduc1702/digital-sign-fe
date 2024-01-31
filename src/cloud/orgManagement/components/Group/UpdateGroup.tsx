import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { Button } from '~/components/Button'
import { InputField, SelectDropdown, SelectField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { useUpdateGroup, type UpdateGroupDTO } from '../../api/groupAPI'
import { flattenData } from '~/utils/misc'
import { useUpdateOrgForGroup } from '../../api/groupAPI/updateOrgForGroup'
import { entityTypeList } from './CreateGroup'
import { useGetOrgs } from '~/layout/MainLayout/api'

import { nameSchema } from '~/utils/schemaValidation'
import { type EntityType } from '../../api/attrAPI'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import storage from '~/utils/storage'

const groupUpdateSchema = z.object({
  name: nameSchema,
  org_id: z.string(),
})

type UpdateGroupProps = {
  groupId: string
  name: string
  close: () => void
  isOpen: boolean
  organization: string
  entity_type: Exclude<EntityType, 'GROUP' | 'TEMPLATE'>
}

export function UpdateGroup({
  groupId,
  name,
  close,
  isOpen,
  organization,
  entity_type,
}: UpdateGroupProps) {
  const { t } = useTranslation()

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

  const { mutate, isLoading, isSuccess } = useUpdateGroup()
  const { mutate: mutateUpdateOrgForGroup } = useUpdateOrgForGroup()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const { register, formState, control, getValues, handleSubmit } = useForm<
    UpdateGroupDTO['data']
  >({
    resolver: groupUpdateSchema && zodResolver(groupUpdateSchema),
    defaultValues: { name: name, org_id: organization },
  })
  console.log('formState.errors', formState.errors)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.group_manage.add_group.edit')}
      renderFooter={() => (
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
            form="update-group"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
            disabled={!formState.isDirty || isLoading}
          />
        </>
      )}
    >
      <form
        className="w-full space-y-6"
        id="update-group"
        onSubmit={handleSubmit(values => {
          if (
            getValues('org_id') !== organization &&
            getValues('org_id') != null
          ) {
            mutateUpdateOrgForGroup({
              data: {
                ids: [groupId],
                org_id: values.org_id,
              },
            })
          }
          mutate({
            data: {
              name: values.name,
              org_id: values.org_id,
            },
            groupId,
          })
        })}
      >
        <>
          <InputField
            label={
              t('cloud:org_manage.group_manage.add_group.name') ??
              "Group's name"
            }
            error={formState.errors['name']}
            registration={register('name')}
          />
          <SelectField
            disabled
            label={
              t('cloud:org_manage.group_manage.add_group.entity_type') ??
              'Entity type'
            }
            value={entity_type.toString()}
            options={entityTypeList.map(entityType => ({
              label: entityType.name,
              value: entityType.type,
            }))}
          />

          <SelectDropdown
            isClearable={false}
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
            defaultValue={orgSelectOptions.find(
              org => org.value === getValues('org_id'),
            )}
            error={formState?.errors?.org_id}
          />
        </>
      </form>
    </Drawer>
  )
}
