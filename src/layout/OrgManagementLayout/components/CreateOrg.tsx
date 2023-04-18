import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField, TextAreaField } from '~/components/Form'
import { ComboBoxOrgManageSidebar } from '~/components/ComboBox'

import {
  type CreateOrgDTO,
  useCreateOrg,
} from '~/layout/OrgManagementLayout/api/createOrg'
import { useProjectIdStore } from '~/stores/project'

import { type OrgMapType } from './OrgManageSidebar'

import { PlusIcon, SidebarDropDownIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const orgSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập để tiếp tục'),
  description: z.string().min(1, 'Vui lòng nhập để tiếp tục'),
})

export function CreateOrg() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxData.length !== 1 ? '' : filteredComboboxData[0]?.id

  const projectId = useProjectIdStore(state => state.projectId)
  const { mutate, isLoading, isSuccess } = useCreateOrg()

  // TODO: Add remove org select to default undefined

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
      title={t('cloud.org_manage.org_manage.add_org.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-org"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateOrgDTO['data'], typeof orgSchema>
        id="create-org"
        onSubmit={values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: selectedOrgId,
              name: values.name,
              description: values.description,
            },
          })
        }}
        schema={orgSchema}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={t('cloud.org_manage.org_manage.add_org.name') ?? 'Name'}
              error={formState.errors['name']}
              registration={register('name')}
            />
            <ComboBoxOrgManageSidebar
              setFilteredComboboxData={setFilteredComboboxData}
              endIcon={
                <SidebarDropDownIcon
                  className="text-primary-400"
                  width={16}
                  height={16}
                  viewBox="0 -5 16 16"
                />
              }
            />
            <TextAreaField
              label={
                t('cloud.org_manage.org_manage.add_org.desc') ?? 'Description'
              }
              error={formState.errors['description']}
              registration={register('description')}
            />
          </>
        )}
      </Form>
    </FormDrawer>
  )
}
