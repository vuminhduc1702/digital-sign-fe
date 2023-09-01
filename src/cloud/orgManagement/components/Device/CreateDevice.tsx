import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField, SelectDropdown, SelectOption } from '~/components/Form'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import { useCreateDevice, type CreateDeviceDTO } from '../../api/deviceAPI'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import { useDefaultCombobox } from '~/utils/hooks'
import storage from '~/utils/storage'

import { type OrgList } from '~/layout/MainLayout/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { type DeviceList } from '../../types'
import { useEffect, useState } from 'react'
import { useGetGroups } from '../../api/groupAPI'
import { useParams } from 'react-router-dom'

export const deviceSchema = z.object({
  name: nameSchema,
  key: z.string()
})

export function CreateDevice() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const { orgId } = useParams()
  const { mutate, isLoading, isSuccess } = useCreateDevice()
  const [offset, setOffset] = useState(0)
  const [orgValue, setOrgValue] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [groupValue, setGroupValue] = useState<SelectOption>({
    label: '',
    value: '',
  })

  const clearData = () => {
    setOrgValue({
      label: '',
      value: ''
    })
    setGroupValue({
      label: '',
      value: ''
    })
  }

  const {
    data: groupData,
  } = useGetGroups({
    orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
    config: { keepPreviousData: true },
  })

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
      resetData={clearData}
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
          mutate({
            data: {
              project_id: projectId,
              org_id: orgValue?.value,
              name: values.name,
              key: values.key,
              group_id: groupValue?.value
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
                  isClearable={false}
                  value={orgValue}
                  onChange={(e) => setOrgValue(e)}
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
              <div className="space-y-1">
                <SelectDropdown
                  isClearable={false}
                  label={t('cloud:org_manage.device_manage.add_device.group')}
                  name="group_id"
                  control={control}
                  value={groupValue}
                  onChange={(e) => setGroupValue(e)}
                  options={
                    groupData?.groups?.map(groups => ({
                      label: groups?.name,
                      value: groups?.id,
                    })) || [{ label: t('loading:org'), value: '' }]
                  }
                />
              </div>
              <InputField
                label={
                  t('cloud:org_manage.device_manage.add_device.key') ?? 'Key'
                }
                error={formState.errors['key']}
                registration={register('key')}
              />
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
