import { useParams } from 'react-router-dom'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  FormMultipleFields,
  InputField,
  SelectField,
  SelectDropdown,
} from '~/components/Form'
import { useProjectIdStore } from '~/stores/project'
import { useDefaultCombobox } from '~/utils/hooks'
import { useCreateEvent, type CreateEventDTO } from '../../api/eventAPI'
import { useGetGroups } from '../../api/groupAPI'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import { useGetDevices } from '../../api/deviceAPI'
import { useGetAttrs } from '../../api/attrAPI'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'

import { type DeviceList, type Group } from '../../types'
import { type Attribute } from '~/types'
import { type OrgList } from '~/layout/MainLayout/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'

const conditionObj = z.object({
  device_id: z.string(),
  attribute_name: z.string(),
  condition_type: z.enum(['normal', 'delay'] as const),
  operator: z.enum(['<', '>', '!='] as const),
  threshold: z.string(),
  // logical_operator: z.enum(['and', 'or'] as const),
})
type ConditionObj = z.infer<typeof conditionObj>
export const eventConditionSchema = z.array(conditionObj)

export const eventIntervalSchema = z.object({
  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),
  start_time: z.string(),
  end_time: z.string(),
})

export const eventActionSchema = z
  .array(
    z.object({ receiver: z.string() }).and(
      z.discriminatedUnion('action_type', [
        z.object({
          action_type: z.literal('email'),
          subject: z.string(),
          message: z.string(),
        }),
        z.object({
          action_type: z.enum(['eventactive', 'delay'] as const),
          subject: z.string().optional(),
          message: z.string().optional(),
        }),
        z.object({
          action_type: z.enum(['sms', 'mqtt', 'fcm', 'event'] as const),
          subject: z.string().optional(),
          message: z.string(),
        }),
      ]),
    ),
  )
  .optional()

export const createEventSchema = z
  .object({
    project_id: z.string().optional(),
    org_id: selectOptionSchema.optional(),
    group_id: selectOptionSchema.optional(),
    name: nameSchema,
    // interval: intervalSchema,
    // action: eventActionSchema
    // status: z.boolean().optional(),
    // retry: z.number().optional(),
    // onClick: z.boolean(),
    // condition: eventConditionSchema,
  })
  .and(
    z.discriminatedUnion('onClick', [
      z.object({
        onClick: z.literal('true'),
        condition: z.tuple([]),
      }),
      z.object({
        onClick: z.literal('false'),
        condition: eventConditionSchema,
      }),
    ]),
  )
const defaultConditionValue: ConditionObj = {
  device_id: '',
  attribute_name: '',
  condition_type: 'normal',
  operator: '>',
  threshold: '',
}

export function CreateEvent() {
  const { t } = useTranslation()

  const [onClickValue, setOnclickValue] = useState(false)

  const projectId = useProjectIdStore(state => state.projectId)
  const { mutate, isLoading, isSuccess } = useCreateEvent()

  const params = useParams()
  const orgId = params.orgId as string

  const { data: groupData, refetch: refetchGroupData } = useGetGroups({
    orgId,
    projectId,
    config: { enabled: false },
  })
  const groupListCache: Group[] | undefined = queryClient.getQueryData(
    ['groups'],
    { exact: false },
  )

  const { data: deviceData, refetch: refetchDeviceData } = useGetDevices({
    orgId,
    projectId,
    config: { enabled: false },
  })
  const deviceListCache: DeviceList | undefined = queryClient.getQueryData(
    ['devices'],
    { exact: false },
  )
  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  })) || [{ value: '', label: '' }]

  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const { data: attrData, refetch: refetchAttrData } = useGetAttrs({
    entityType: 'DEVICE',
    entityId: selectedDeviceId,
    config: { enabled: false },
  })
  const attrListCache: Attribute[] | undefined = queryClient.getQueryData(
    ['attrs'],
    { exact: false },
  )
  const attrSelectData = attrData?.attributes.map(attribute => ({
    value: attribute.attribute_key,
    label: attribute.attribute_key,
  })) || [{ value: '', label: '' }]

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
      size="lg"
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:org_manage.event_manage.add_event.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-event"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
      setOtherState={setOnclickValue}
    >
      <FormMultipleFields<CreateEventDTO['data'], typeof createEventSchema>
        id="create-event"
        onSubmit={values => {
          console.log('values: ', values)
          const conditionArr: ConditionObj[] =
            values.condition?.map(item => ({
              device_id: (
                item.device_id as unknown as { value: string; label: string }
              ).value,
              attribute_name: (
                item.attribute_name as unknown as {
                  value: string
                  label: string
                }
              ).value,
              condition_type: (
                item.condition_type as unknown as {
                  value: 'normal' | 'delay'
                  label: string
                }
              ).value,
              operator: (
                item.operator as unknown as {
                  value: '!=' | '<' | '>'
                  label: string
                }
              ).value,
              threshold: item.threshold,
            })) || []
          mutate({
            data: {
              project_id: projectId,
              // @ts-ignore
              org_id:
                (values.org_id as unknown as { value: string; label: string })
                  ?.value || '',
              // @ts-ignore
              group_id:
                (
                  values.group_id as unknown as {
                    value: string
                    label: string
                  }
                )?.value || '',
              name: values.name,
              onClick: values.onClick === 'true',
              condition: values.onClick === 'false' ? conditionArr : null,
            },
          })
        }}
        schema={createEventSchema}
        name={['condition', 'action']}
      >
        {(
          { register, formState, control, watch },
          {
            append: conditionAppend,
            fields: conditionFields,
            remove: conditionRemove,
          },
          { append: actionAppend, fields: actionFields, remove: actionRemove },
        ) => {
          console.log('zod errors: ', formState.errors)
          return (
            <>
              <InputField
                label={t('cloud:org_manage.event_manage.add_event.name')}
                error={formState.errors['name']}
                registration={register('name')}
              />
              <div className="space-y-1">
                <SelectDropdown
                  label={t('cloud:org_manage.device_manage.add_device.parent')}
                  name="org_id"
                  control={control}
                  options={
                    orgSelectOptions?.map(org => ({
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
                  label={t('cloud:org_manage.event_manage.add_event.group')}
                  name="group_id"
                  control={control}
                  options={
                    groupData?.groups.map(group => ({
                      label: group?.name,
                      value: group?.id,
                    })) || [{ label: t('loading:group'), value: '' }]
                  }
                  isOptionDisabled={option =>
                    option.label === t('loading:group')
                  }
                  noOptionsMessage={() => t('table:no_group')}
                  onMenuOpen={() => {
                    if (groupListCache) {
                      return
                    } else refetchGroupData()
                  }}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.org_id?.message}
                </p>
              </div>
              <SelectField
                label={t(
                  'cloud:org_manage.event_manage.add_event.condition.onClick',
                )}
                error={formState.errors['onClick']}
                registration={register('onClick')}
                options={[
                  { value: 'false', label: 'Không' },
                  { value: 'true', label: 'Có' },
                ]}
                onChange={event =>
                  setOnclickValue(
                    String(event.target.value).toLowerCase() === 'true',
                  )
                }
              />
              {!onClickValue ? (
                <div className="flex justify-between space-x-3">
                  <TitleBar
                    title={t(
                      'cloud:org_manage.event_manage.add_event.condition.title',
                    )}
                    className="w-full rounded-md bg-gray-500 pl-3"
                  />
                  <Button
                    className="rounded-md"
                    variant="trans"
                    size="square"
                    startIcon={
                      <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                    }
                    onClick={() => conditionAppend(defaultConditionValue)}
                  />
                </div>
              ) : null}

              {!onClickValue
                ? conditionFields.map((field, index) => {
                    return (
                      <section
                        className="flex justify-between gap-x-3"
                        style={{ marginTop: '10px' }}
                        key={field.id}
                      >
                        <SelectDropdown
                          label={t(
                            'cloud:org_manage.event_manage.add_event.condition.device',
                          )}
                          name={`condition.${index}.device_id`}
                          control={control}
                          options={
                            deviceData
                              ? deviceSelectData
                              : [{ label: t('loading:device'), value: '' }]
                          }
                          isOptionDisabled={option =>
                            option.label === t('loading:device')
                          }
                          noOptionsMessage={() => t('table:no_device')}
                          onMenuOpen={() => {
                            if (deviceListCache?.devices) {
                              return
                            } else refetchDeviceData()
                          }}
                          onMenuClose={() => {
                            const deviceId = watch(
                              // @ts-expect-error
                              'condition.0.device_id.value',
                            ) as unknown as string
                            setSelectedDeviceId(deviceId)
                            if (
                              (selectedDeviceId == null ||
                                selectedDeviceId === '') &&
                              (attrListCache == null ||
                                attrListCache?.length === 0)
                            ) {
                              return
                            } else refetchAttrData()
                          }}
                        />
                        <SelectDropdown
                          label={t(
                            'cloud:org_manage.event_manage.add_event.condition.attr',
                          )}
                          name={`condition.${index}.attribute_name`}
                          options={
                            attrData
                              ? attrSelectData
                              : [{ label: t('loading:attr'), value: '' }]
                          }
                          isOptionDisabled={option =>
                            option.label === t('loading:attr')
                          }
                          noOptionsMessage={() => t('table:no_attr')}
                          control={control}
                        />
                        <SelectDropdown
                          label={t(
                            'cloud:org_manage.event_manage.add_event.condition.condition_type.title',
                          )}
                          name={`condition.${index}.condition_type`}
                          options={[
                            {
                              label: t(
                                'cloud:org_manage.event_manage.add_event.condition.condition_type.normal',
                              ),
                              value: 'normal',
                            },
                            {
                              label: t(
                                'cloud:org_manage.event_manage.add_event.condition.condition_type.delay',
                              ),
                              value: 'delay',
                            },
                          ]}
                          control={control}
                        />
                        <SelectDropdown
                          label={t(
                            'cloud:org_manage.event_manage.add_event.condition.operator.title',
                          )}
                          name={`condition.${index}.operator`}
                          options={[
                            {
                              label: t(
                                'cloud:org_manage.event_manage.add_event.condition.operator.gte',
                              ),
                              value: '>',
                            },
                            {
                              label: t(
                                'cloud:org_manage.event_manage.add_event.condition.operator.lte',
                              ),
                              value: '<',
                            },
                            {
                              label: t(
                                'cloud:org_manage.event_manage.add_event.condition.operator.not',
                              ),
                              value: '!=',
                            },
                          ]}
                          control={control}
                        />
                        <InputField
                          label={t(
                            'cloud:org_manage.event_manage.add_event.condition.threshold',
                          )}
                          error={
                            formState.errors[`condition.${index}.threshold`]
                          }
                          registration={register(
                            `condition.${index}.threshold`,
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => conditionRemove(index)}
                        >
                          X
                        </button>
                      </section>
                    )
                  })
                : null}
            </>
          )
        }}
      </FormMultipleFields>
    </FormDrawer>
  )
}
