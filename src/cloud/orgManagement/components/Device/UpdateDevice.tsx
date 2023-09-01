import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { type UpdateDeviceDTO, useUpdateDevice } from '../../api/deviceAPI'
import { Button } from '~/components/Button'
import { Form, InputField, SelectDropdown, SelectOption } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { deviceSchema } from './CreateDevice'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { type OrgList } from '~/layout/MainLayout/types'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import { useParams } from 'react-router-dom'
import storage from '~/utils/storage'
import { useGetGroups } from '../../api/groupAPI'

type UpdateDeviceProps = {
  deviceId: string
  name: string
  keys: string
  org_id?: string
  group: {
    label: string | ''
    value: string | ''
  }
  close: () => void
  isOpen: boolean
}
export function UpdateDevice({
  deviceId,
  name,
  keys,
  org_id,
  group,
  close,
  isOpen,
}: UpdateDeviceProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateDevice()
  const [offset, setOffset] = useState(0)
  const [orgValue, setOrgValue] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [groupValue, setGroupValue] = useState(group)

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations || [],
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )

  const { orgId } = useParams()
  const { id: projectId } = storage.getProject()
  const {
    data: groupData,
  } = useGetGroups({
    orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
    config: { keepPreviousData: true },
  })

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    const dataFilter = orgFlattenData.filter(item => item.id === org_id)
    dataFilter.length && setOrgValue({
      label: dataFilter[0]?.name,
      value: dataFilter[0]?.id
    })
  }, [org_id])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.device_manage.add_device.edit')}
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
            form="update-device"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      <Form<UpdateDeviceDTO['data'], typeof deviceSchema>
        id="update-device"
        onSubmit={values =>
          mutate({
            data: {
              name: values.name,
              keys: values.keys,
              org_id: orgValue?.value,
              group_id: groupValue?.value
            },
            deviceId,
          })
        }
        schema={deviceSchema}
        options={{
          defaultValues: { name, keys },
        }}
      >
        {({ register, formState, control }) => (
          <>
            <InputField
              label={
                t('cloud:org_manage.device_manage.add_device.name') ??
                "Device's name"
              }
              error={formState.errors['name']}
              registration={register('name')}
            />
            <div className="space-y-1">
              <SelectDropdown
                isClearable={false}
                label={t('cloud:org_manage.device_manage.add_device.parent')}
                name="org_id"
                control={control}
                value={orgValue}
                onChange={(e) => setOrgValue(e)}
                options={
                  orgFlattenData?.map(org => ({
                    label: org?.name,
                    value: org?.id,
                  })) || [{ label: t('loading:org'), value: '' }]
                }
              />
            </div>
            <div className="space-y-1">
              <SelectDropdown
                label={t('cloud:org_manage.device_manage.add_device.group')}
                name="group_id"
                isClearable={false}
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
                t('cloud:org_manage.device_manage.add_device.key') ??
                "Key"
              }
              error={formState.errors['keys']}
              registration={register('keys')}
            />
          </>
        )}
      </Form>
    </Drawer>
  )
}
