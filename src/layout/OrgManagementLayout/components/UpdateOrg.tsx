import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  type SelectOptionString,
  TextAreaField,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { type UpdateOrgDTO, useUpdateOrg } from '../api'
import { orgSchema } from './CreateOrg'

import { type OrgMapType } from './OrgManageSidebar'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { useDefaultCombobox } from '~/utils/hooks'
import { type OrgList } from '~/layout/MainLayout/types'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'

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

  const [optionOrg, setOptionOrg] = useState<SelectOptionString>()

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )

  useEffect(() => {
    if (selectedUpdateOrg.id) {
      setOptionOrg({
        label: selectedUpdateOrg?.parent_name,
        value: selectedUpdateOrg?.id,
      })
    }
  }, [selectedUpdateOrg])

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
            orgId: optionOrg?.value,
          })
        }}
        options={{
          defaultValues: {
            name: selectedUpdateOrg.name,
            description:
              selectedUpdateOrg?.description !== 'undefined'
                ? selectedUpdateOrg?.description
                : '',
            org_id: selectedUpdateOrg?.id,
          },
        }}
        schema={orgSchema}
      >
        {({ register, formState, control, setValue }) => {
          return (
            <>
              <InputField
                label={t('cloud:org_manage.org_manage.add_org.name') ?? 'Name'}
                error={formState.errors['name']}
                registration={register('name')}
              />
              <div className="space-y-1">
                <SelectDropdown
                  isClearable={true}
                  label={t('cloud:org_manage.device_manage.add_device.parent')}
                  name="org_id"
                  control={control}
                  options={
                    orgFlattenData?.map(org => ({
                      label: org?.name,
                      value: org?.id,
                    })) || [{ label: t('loading:org'), value: '' }]
                  }
                  onChange={e => {
                    setOptionOrg(e)
                    setValue('org_id', e?.value)
                  }}
                  value={optionOrg}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.org_id?.message === 'Required'
                    ? t('cloud:org_manage.org_manage.add_org.choose_org')
                    : formState?.errors?.org_id?.message}
                </p>
              </div>
              <TextAreaField
                label={
                  t('cloud:org_manage.org_manage.add_org.desc') ?? 'Description'
                }
                error={formState.errors['description']}
                registration={register('description')}
              />
            </>
          )
        }}
      </Form>
    </Drawer>
  )
}
