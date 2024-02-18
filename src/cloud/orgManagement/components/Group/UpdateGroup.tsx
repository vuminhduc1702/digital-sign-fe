import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { Button } from '~/components/Button'
import { FieldWrapper, InputField, SelectDropdown, SelectField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { useUpdateGroup, type UpdateGroupDTO } from '../../api/groupAPI'
import { cn, flattenData } from '~/utils/misc'
import { useUpdateOrgForGroup } from '../../api/groupAPI/updateOrgForGroup'
import { entityTypeList } from './CreateGroup'
import { useGetOrgs } from '~/layout/MainLayout/api'

import { nameSchema } from '~/utils/schemaValidation'
import { type EntityType } from '../../api/attrAPI'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import storage from '~/utils/storage'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { ComplexTree } from '~/components/ComplexTree'

const groupUpdateSchema = z.object({
  name: nameSchema,
  org_id: z.string().optional().or(z.array(z.string())),
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
                org_id: values.org_id.toString(),
              },
            })
          }
          mutate({
            data: {
              name: values.name,
              org_id: values.org_id.toString(),
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

          {/* <SelectDropdown
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
          /> */}
          <FieldWrapper
            label={t('cloud:org_manage.device_manage.add_device.parent')}
            error={formState?.errors?.org_id}
          >
            <Controller
              control={control}
              name="org_id"
              render={({ field: { onChange, value, ...field } }) => {
                const parseValue = orgSelectOptions?.find(org => org.value === getValues('org_id').toString())?.label
                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="org_id"
                        variant="trans"
                        size="square"
                        className={cn(
                          'focus:outline-focus-400 focus:ring-focus-400 relative w-full !justify-between rounded-md text-left font-normal focus:outline-2 focus:outline-offset-0 px-3',
                          !value && 'text-secondary-700',
                        )}
                      >
                        {value ? (
                          <span>
                            {parseValue ? parseValue : value}
                          </span>
                        ) : (
                          <span>
                           {t('cloud:org_manage.org_manage.add_org.choose_org')}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <ComplexTree items={orgData?.organizations} selectOrg={onChange} currentValue={value}></ComplexTree>
                    </PopoverContent>
                  </Popover>
                )
              }}
            />
          </FieldWrapper>
        </>
      </form>
    </Drawer>
  )
}
