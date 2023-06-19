import { useParams } from 'react-router-dom'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField } from '~/components/Form'
import { useProjectIdStore } from '~/stores/project'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'
import { useDefaultCombobox } from '~/utils/hooks'
import { useCreateEvent, type CreateEventDTO } from '../../api/eventAPI'
import { ComboBoxSelectGroup } from '../Group'
import { useGetGroups } from '../../api/groupAPI'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'
import { type Group } from '../../types'
import { nameSchema } from '~/utils/schemaValidation'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const createEventSchema = z.object({
  project_id: z.string().optional(),
  org_id: z.string().optional(),
  group_id: z.string().optional(),
  name: nameSchema,
  // onClick: z.boolean(),
  // condition: z.array(
  //   z.object({
  //     device_id: z.string(),
  //     attribute_name: z.string(),
  //     condition_type: z.enum(['normal', 'delay'] as const),
  //     operator: z.enum(['<', '>', '!='] as const),
  //     threshold: z.string(),
  //     logical_operator: z.enum(['and', 'or'] as const),
  //   }),
  // ),
  // internal: z.object({
  //   monday: z.boolean().optional(),
  //   tuesday: z.boolean().optional(),
  //   wednesday: z.boolean().optional(),
  //   thursday: z.boolean().optional(),
  //   friday: z.boolean().optional(),
  //   saturday: z.boolean().optional(),
  //   sunday: z.boolean().optional(),
  //   start_time: z.string(),
  //   end_time: z.string(),
  // }),
  // action: z
  //   .array(
  //     z.discriminatedUnion('action_type', [
  //       z.object({
  //         action_type: z.literal('email'),
  //         receiver: z.string(),
  //         subject: z.string(),
  //         message: z.string(),
  //       }),
  //       z.object({
  //         action_type: z.literal('eventactive'),
  //         receiver: z.string(),
  //         subject: z.string().optional(),
  //         message: z.string().optional(),
  //       }),
  //       z.object({
  //         action_type: z.enum(['sms', 'mqtt', 'fcm', 'event'] as const),
  //         receiver: z.string(),
  //         subject: z.string().optional(),
  //         message: z.string(),
  //       }),
  //     ]),
  //   )
  //   .optional(),
  // status: z.boolean().optional(),
  // retry: z.number().optional(),
})

export function CreateEvent() {
  const { t } = useTranslation()

  const defaultComboboxOrgData = useDefaultCombobox('org')

  const [filteredComboboxOrgData, setFilteredComboboxOrgData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxOrgData.length !== 1 ? '' : filteredComboboxOrgData[0]?.id

  const [filteredComboboxGroupData, setFilteredComboboxGroupData] = useState<
    Group[]
  >([])
  const selectedGroupId =
    filteredComboboxGroupData.length !== 1
      ? ''
      : filteredComboboxGroupData[0]?.id

  const projectId = useProjectIdStore(state => state.projectId)
  const { mutate, isLoading, isSuccess } = useCreateEvent()

  const params = useParams()
  const orgId = params.orgId as string
  const { data: groupData } = useGetGroups({ orgId, projectId })

  return (
    <FormDrawer
      isDone={isSuccess}
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
    >
      <Form<CreateEventDTO['data'], typeof createEventSchema>
        id="create-event"
        onSubmit={values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: selectedOrgId,
              group_id: selectedGroupId,
              name: values.name,
            },
          })
        }}
        schema={createEventSchema}
      >
        {({ register, formState }) => {
          console.log('formState', formState.errors)
          return (
            <>
              <InputField
                label={
                  t('cloud:org_manage.event_manage.add_event.name') ?? 'Name'
                }
                error={formState.errors['name']}
                registration={register('name')}
              />
              <ComboBoxSelectOrg
                label={
                  t('cloud:org_manage.event_manage.add_event.parent') ??
                  'Parent organization'
                }
                setFilteredComboboxData={setFilteredComboboxOrgData}
                hasDefaultComboboxData={defaultComboboxOrgData}
              />
              <ComboBoxSelectGroup
                label={
                  t('cloud:org_manage.event_manage.add_event.group') ?? 'Group'
                }
                data={groupData}
                setFilteredComboboxData={setFilteredComboboxGroupData}
              />
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
