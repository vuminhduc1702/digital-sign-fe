import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  FormDrawer,
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import { cn, flattenData } from '~/utils/misc'
import { nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { useCreateDevice, type CreateDeviceDTO } from '../../api/deviceAPI'

import { useRef, useState } from 'react'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetTemplates } from '~/cloud/deviceTemplate/api'
import { PlusIcon } from '~/components/SVGIcons'
import { useGetGroups } from '../../api/groupAPI'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { type SelectInstance } from 'react-select'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { ComplexTree } from '~/components/ComplexTree'

export const deviceSchema = z.object({
  name: nameSchema,
  org_id: z.string().optional(),
  project_id: z.string().optional(),
  group_id: z.string().optional(),
  template_id: z.string().optional(),
  key: z.string().optional(),
})

export function CreateDevice() {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { mutate, isLoading, isSuccess } = useCreateDevice()
  const [offset, setOffset] = useState(0)

  const { orgId } = useParams()

  const { register, formState, control, handleSubmit, watch, reset } = useForm<
    CreateDeviceDTO['data']
  >({
    resolver: deviceSchema && zodResolver(deviceSchema),
  })

  const { data: orgData, isLoading: orgIsLoading } = useGetOrgs({ projectId })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')
  const orgSelectOptions = orgFlattenData?.map(org => ({
    label: org?.name,
    value: org?.id,
  }))

  const { data: groupData, isLoading: groupIsLoading } = useGetGroups({
    orgId: watch('org_id')?.toString() || orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
    config: {
      suspense: false,
    },
  })
  const groupSelectOptions = groupData?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  }))

  const { data: templateData, isLoading: templateIsLoading } = useGetTemplates({
    projectId,
  })
  const templateSelectOptions = templateData?.templates?.map(template => ({
    label: template?.name,
    value: template?.id,
  }))

  const selectDropdownGroupId = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

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
      <form
        className="w-full space-y-6"
        id="create-device"
        onSubmit={handleSubmit(values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: values.org_id?.toString() !== no_org_val ? values.org_id?.toString() : '',
              name: values.name,
              key: values.key,
              group_id: values.group_id,
              template_id: values.template_id,
            },
          })
        })}
      >
        <>
          <InputField
            label={t('cloud:org_manage.device_manage.add_device.name')}
            error={formState.errors['name']}
            registration={register('name')}
          />

          <FieldWrapper
            label={t('cloud:org_manage.device_manage.add_device.parent')}
            error={formState?.errors?.org_id}
          >
            <Controller
              control={control}
              name="org_id"
              render={({ field: { onChange, value, ...field } }) => {
                const parseValue = value
                  ? orgSelectOptions?.find(
                      org => org.value === value.toString(),
                    )?.label
                  : ''
                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="org_id"
                        variant="trans"
                        size="square"
                        className={cn(
                          'relative w-full !justify-between rounded-md px-3 text-left font-normal focus:outline-2 focus:outline-offset-0 focus:outline-focus-400 focus:ring-focus-400',
                          !value && 'text-secondary-700',
                        )}
                      >
                        {value ? (
                          <span>{parseValue ? parseValue : value}</span>
                        ) : (
                          <span>
                            {t(
                              'cloud:org_manage.org_manage.add_org.choose_org',
                            )}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 popover-content" align="start">
                      <ComplexTree
                        items={orgData?.organizations}
                        selectOrg={e => {
                          selectDropdownGroupId.current?.clearValue()
                          onChange(e)
                        }}
                        currentValue={value}
                        {...field}
                      ></ComplexTree>
                    </PopoverContent>
                  </Popover>
                )
              }}
            />
          </FieldWrapper>

          <SelectDropdown
            refSelect={selectDropdownGroupId}
            label={t('cloud:org_manage.device_manage.add_device.group')}
            name="group_id"
            control={control}
            options={groupSelectOptions}
            isOptionDisabled={option =>
              option.label === t('loading:group') ||
              option.label === t('table:no_group')
            }
            noOptionsMessage={() => t('table:no_group')}
            loadingMessage={() => t('loading:group')}
            isLoading={groupIsLoading}
            error={formState?.errors?.group_id}
          />

          <SelectDropdown
            error={formState?.errors?.template_id}
            label={t('cloud:firmware.add_firmware.template')}
            name="template_id"
            control={control}
            options={templateSelectOptions}
            isOptionDisabled={option =>
              option.label === t('loading:template') ||
              option.label === t('table:no_template')
            }
            noOptionsMessage={() => t('table:no_template')}
            loadingMessage={() => t('loading:template')}
            isLoading={templateIsLoading}
          />

          <InputField
            label={t('cloud:org_manage.device_manage.add_device.key')}
            error={formState.errors['key']}
            registration={register('key')}
          />
        </>
      </form>
    </FormDrawer>
  )
}
