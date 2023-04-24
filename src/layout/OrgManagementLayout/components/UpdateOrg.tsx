import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Button } from '~/components/Button'
import { Form, InputField, TextAreaField } from '~/components/Form'
import { ComboBoxOrgManageSidebar } from '~/layout/MainLayout/components'
import {
  type UpdateOrgDTO,
  useUpdateOrg,
} from '~/layout/OrgManagementLayout/api/updateOrg'
import { useOrgById } from '~/layout/OrgManagementLayout/api/getOrgById'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'
import { useSpinDelay } from 'spin-delay'

import { type OrgMapType } from './OrgManageSidebar'

import { SidebarDropDownIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

export const orgSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập để tiếp tục'),
  description: z.string().min(1, 'Vui lòng nhập để tiếp tục'),
})

export function UpdateOrg({
  close,
  isOpen,
  selectedUpdateOrg,
}: {
  close: () => void
  isOpen: boolean
  selectedUpdateOrg: string
}) {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxData?.length !== 1
      ? selectedUpdateOrg
      : filteredComboboxData[0]?.id

  const { mutate, isLoading, isSuccess } = useUpdateOrg()

  const { data: orgByIdData, isLoading: orgByIdLoading } = useOrgById({
    orgId: selectedUpdateOrg,
    config: { suspense: false },
  })

  const showSpinner = useSpinDelay(orgByIdLoading, {
    delay: 150,
    minDuration: 300,
  })

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud.org_manage.org_manage.add_org.edit')}
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
      {orgByIdLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
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
              name: orgByIdData?.name,
              description: orgByIdData?.description,
            },
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
      )}
    </Drawer>
  )
}
