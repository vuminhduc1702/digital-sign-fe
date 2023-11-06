import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Button } from '~/components/Button'
import {
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOptionString,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { useUpdateGroup, type UpdateGroupDTO } from '../../api/groupAPI'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import { useUpdateOrgForGroup } from '../../api/groupAPI/updateOrgForGroup'
import { entityTypeList } from './CreateGroup'

import { type OrgList } from '~/layout/MainLayout/types'
import { nameSchema } from '~/utils/schemaValidation'
import { type EntityType } from '../../api/attrAPI'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

const groupSchema = z.object({
  name: nameSchema,
})

type UpdateGroupProps = {
  groupId: string
  name: string
  close: () => void
  isOpen: boolean
  organization: string
  entity_type: Omit<EntityType, 'GROUP' | 'TEMPLATE'>
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

  const [optionOrg, setOptionOrg] = useState<SelectOptionString>()
  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })

  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData
    ?.map(org => ({
      label: org?.name,
      value: org?.id,
    }))
    .sort((a, b) => a.value.length - b.value.length)
    .filter(org => org.value !== organization)

  const { mutate, isLoading, isSuccess } = useUpdateGroup()
  const { mutate: mutateUpdateOrgForGroup } = useUpdateOrgForGroup()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    const filterOrg = orgFlattenData.filter(org => org.id === organization)[0]
    if (organization) {
      setOptionOrg({
        label: filterOrg?.name,
        value: filterOrg?.id,
      })
    }
  }, [organization])

  const { register, formState, control, setValue, handleSubmit } = useForm<
    UpdateGroupDTO['data']
  >({
    resolver: groupSchema && zodResolver(groupSchema),
    defaultValues: { name: name, org_id: organization },
  })

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
            disabled={!formState.isDirty}
          />
        </>
      )}
    >
      <form
        className="w-full space-y-6"
        id="update-group"
        onSubmit={handleSubmit(values =>
          mutate({
            data: {
              name: values.name,
              org_id: optionOrg?.value,
            },
            groupId,
          }),
        )}
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
          <div className="space-y-1">
            <SelectDropdown
              isClearable={true}
              label={t('cloud:org_manage.device_manage.add_device.parent')}
              name="org_id"
              control={control}
              options={
                orgSelectOptions || [{ label: t('loading:org'), value: '' }]
              }
              onChange={e => {
                setOptionOrg(e)
                mutateUpdateOrgForGroup({
                  data: {
                    ids: [groupId],
                    org_id: e.value,
                  },
                })
                setValue('org_id', e?.value)
              }}
              value={optionOrg}
            />
            <p className="text-body-sm text-primary-400">
              {formState?.errors?.org_id?.message}
            </p>
          </div>
        </>
      </form>
    </Drawer>
  )
}
