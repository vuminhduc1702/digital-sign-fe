import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField } from '~/components/Form'

import { useProjectIdStore } from '~/stores/project'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'
import { type CreateUserDTO, useCreateUser } from '../../api/userAPI'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const userSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập để tiếp tục'),
})

export function CreateUser() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxData.length !== 1 ? '' : filteredComboboxData[0]?.id

  const projectId = useProjectIdStore(state => state.projectId)
  const { mutate, isLoading, isSuccess } = useCreateUser()

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
      title={t('cloud.org_manage.device_manage.add_device.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-user"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateUserDTO['data'], typeof userSchema>
        id="create-user"
        onSubmit={values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: selectedOrgId,
              name: values.name,
            },
          })
        }}
        schema={userSchema}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={
                t('cloud.org_manage.device_manage.add_device.name') ?? 'Name'
              }
              error={formState.errors['name']}
              registration={register('name')}
            />
            <ComboBoxSelectOrg
              label={
                t('cloud.org_manage.device_manage.add_device.parent') ??
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
