import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  FormDrawer,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import storage from '~/utils/storage'
import { useCreateGroup, type CreateGroupDTO } from '../../api/groupAPI'
import { nameSchema } from '~/utils/schemaValidation'
import { cn, flattenData } from '~/utils/misc'
import { useGetOrgs } from '~/layout/MainLayout/api'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { ComplexTree } from '~/components/ComplexTree'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import btnChevronDownIcon from '~/assets/icons/btn-chevron-down.svg'

export const entityTypeList = [
  { type: 'ORGANIZATION', name: 'Tổ chức' },
  { type: 'DEVICE', name: 'Thiết bị' },
  { type: 'USER', name: 'Người dùng' },
  { type: 'EVENT', name: 'Sự kiện' },
] as const

const groupCreateSchema = z.object({
  name: nameSchema,
  entity_type: z.string(),
  // org_id: z.string().optional()
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
  const { register, formState, control, handleSubmit, reset, getValues } = useForm<
    CreateGroupDTO['data']
  >({
    resolver: groupCreateSchema && zodResolver(groupCreateSchema),
  })

  // function orgSelection(val: any) {
  //   console.log(val)
  // }

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
        onSubmit={
          handleSubmit(values => {
          mutate({
            data: {
              name: values.name,
              entity_type: values.entity_type,
              project_id: projectId,
              org_id: getValues('org_id').toString(),
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
          {/* <SelectDropdown
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
          /> */}
          <FieldWrapper
            label={t('cloud:org_manage.device_manage.add_device.parent')}
            error={formState?.errors?.org_id}
          >
            <Controller
              control={control}
              name={"org_id"}
              render={({ field: { onChange, value, ...field } }) => {
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
                            {value}
                          </span>
                        ) : (
                          <span>
                           {t('cloud:org_manage.org_manage.add_org.choose_org')}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <ComplexTree items={orgData?.organizations} selectOrg={onChange} currentValue={value} {...field}></ComplexTree>
                    </PopoverContent>
                  </Popover>
                )
              }}
            />
          </FieldWrapper>
        </>
      </form>
    </FormDrawer>
  )
}
