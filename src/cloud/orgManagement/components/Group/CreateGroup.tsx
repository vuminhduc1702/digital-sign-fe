import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField, SelectField } from '~/components/Form'

import { useProjectIdStore } from '~/stores/project'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'
import { useCreateGroup, type CreateGroupDTO } from '../../api/groupAPI'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

type EntityTypeGroup = {
  type: 'ORGANIZATION' | 'DEVICE' | 'USER' | 'EVENT'
  name: string
}

export const entityTypeList: EntityTypeGroup[] = [
  { type: 'ORGANIZATION', name: 'Tổ chức' },
  { type: 'DEVICE', name: 'Thiết bị' },
  { type: 'USER', name: 'Người dùng' },
  { type: 'EVENT', name: 'Sự kiện' },
]

const groupSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập để tiếp tục'),
  entity_type: z.string(),
})

export function CreateGroup() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxData.length !== 1 ? '' : filteredComboboxData[0]?.id

  const projectId = useProjectIdStore(state => state.projectId)
  const { mutate, isLoading, isSuccess } = useCreateGroup()

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
      title={t('cloud.org_manage.group_manage.add_group.title')}
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
      <Form<CreateGroupDTO['data'], typeof groupSchema>
        id="create-group"
        onSubmit={values => {
          mutate({
            data: {
              name: values.name,
              entity_type: values.entity_type,
              project_id: projectId,
              org_id: selectedOrgId,
            },
          })
        }}
        schema={groupSchema}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={
                t('cloud.org_manage.group_manage.add_group.name') ?? 'Name'
              }
              error={formState.errors['name']}
              registration={register('name')}
            />
            <SelectField
              label={
                t('cloud.org_manage.group_manage.add_group.entity_type') ??
                'Entity type'
              }
              error={formState.errors['entity_type']}
              registration={register('entity_type')}
              options={entityTypeList.map(entityType => ({
                label: entityType.name,
                value: entityType.type,
              }))}
            />
            <ComboBoxSelectOrg
              label={
                t('cloud.org_manage.group_manage.add_group.parent') ??
                'Parent organization'
              }
              setFilteredComboboxData={setFilteredComboboxData}
            />
          </>
        )}
      </Form>
    </FormDrawer>
  )
}
