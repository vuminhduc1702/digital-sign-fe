import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Button } from '~/components/Button'
import { Form, InputField, TextAreaField } from '~/components/Form'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'
import { Drawer } from '~/components/Drawer'
import { type UpdateOrgDTO, useUpdateOrg } from '../api'
import { orgSchema } from './CreateOrg'

import { type OrgMapType } from './OrgManageSidebar'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

export function UpdateOrg({
  close,
  isOpen,
  selectedUpdateOrg,
}: {
  close: () => void
  isOpen: boolean
  selectedUpdateOrg: OrgMapType
}) {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxData?.length !== 1
      ? selectedUpdateOrg.id
      : filteredComboboxData[0]?.id

  const { mutate, isLoading, isSuccess } = useUpdateOrg()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.org_manage.add_org.edit')}
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
            form="update-org"
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
      <Form<UpdateOrgDTO['data'], typeof orgSchema>
        id="update-org"
        onSubmit={values => {
          mutate({
            data: {
              name: values.name,
              description: values.description,
            },
            orgId: selectedOrgId,
          })
        }}
        options={{
          defaultValues: {
            name: selectedUpdateOrg.name,
            description: selectedUpdateOrg.description,
          },
        }}
        schema={orgSchema}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={t('cloud:org_manage.org_manage.add_org.name') ?? 'Name'}
              error={formState.errors['name']}
              registration={register('name')}
            />
            <ComboBoxSelectOrg
              label={
                t('cloud:org_manage.org_manage.add_org.parent') ??
                'Parent organization'
              }
              setFilteredComboboxData={setFilteredComboboxData}
              selectedData={selectedUpdateOrg}
            />
            <TextAreaField
              label={
                t('cloud:org_manage.org_manage.add_org.desc') ?? 'Description'
              }
              error={formState.errors['description']}
              registration={register('description')}
            />
          </>
        )}
      </Form>
    </Drawer>
  )
}
