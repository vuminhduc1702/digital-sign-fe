import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useParams } from 'react-router-dom'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import {
  Form,
  InputField,
  SelectDropdown,
  type SelectOptionString,
} from '~/components/Form'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useUpdateDevice, type UpdateDeviceDTO } from '../../api/deviceAPI'
import { useGetGroups } from '../../api/groupAPI'
import { deviceSchema } from './CreateDevice'

import { type OrgList } from '~/layout/MainLayout/types'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetTemplates } from '~/cloud/deviceTemplate/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
type UpdateDeviceProps = {
  deviceId: string
  name: string
  keyDevice: string
  org_id?: string
  group: {
    label: string | ''
    value: string | ''
  }
  close: () => void
  isOpen: boolean
  template_name: string
  template_id: string
}
export function UpdateDevice({
  deviceId,
  name,
  keyDevice,
  org_id,
  group,
  close,
  isOpen,
  template_name,
  template_id,
}: UpdateDeviceProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateDevice()
  const [offset, setOffset] = useState(0)
  const [orgValue, setOrgValue] = useState<SelectOptionString>({
    label: '',
    value: '',
  })
  const [templateValue, setTemplateValue] = useState<SelectOptionString>({
    label: template_name,
    value: template_id,
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
  const { data: groupData } = useGetGroups({
    orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
  })

  const { data } = useGetTemplates({ projectId })
  const { register, formState, control, setValue, handleSubmit } = useForm<
    UpdateDeviceDTO['data']
  >({
    resolver: deviceSchema && zodResolver(deviceSchema),
    defaultValues: { name, key: keyDevice },
  })
  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    const dataFilter = orgFlattenData.filter(item => item.id === org_id)
    dataFilter.length &&
      setOrgValue({
        label: dataFilter[0]?.name,
        value: dataFilter[0]?.id,
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
      {/* <Form<UpdateDeviceDTO['data'], typeof deviceSchema> */}
      <form
        id="update-device"
        onSubmit={handleSubmit(values =>
          mutate({
            data: {
              name: values.name,
              key: values.key,
              org_id: orgValue?.value,
              group_id: groupValue?.value,
              template_id: templateValue?.value || '',
            },
            deviceId,
          }),
        )}
        // schema={deviceSchema}
        // options={{
        //   defaultValues: { name, key: keyDevice },
        // }}
      >
        {/* {({ register, formState, control }) => ( */}
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
              onChange={e => setOrgValue(e)}
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
              onChange={e => setGroupValue(e)}
              options={
                groupData?.groups?.map(groups => ({
                  label: groups?.name,
                  value: groups?.id,
                })) || [{ label: t('loading:org'), value: '' }]
              }
            />
          </div>
          <div>
            <SelectDropdown
              isClearable={false}
              label={t('cloud:firmware.add_firmware.template')}
              name="template_id"
              control={control}
              value={templateValue}
              onChange={e => setTemplateValue(e)}
              options={
                data?.templates?.map(template => ({
                  label: template?.name,
                  value: template?.id,
                })) || [{ label: '', value: '' }]
              }
            />
            <p className="text-body-sm text-primary-400">
              {formState?.errors?.template_id?.message}
            </p>
          </div>
          <InputField
            label={t('cloud:org_manage.device_manage.add_device.key') ?? 'Key'}
            error={formState.errors['key']}
            registration={register('key')}
          />
        </>
      </form>
      {/* )}
      </Form> */}
    </Drawer>
  )
}
