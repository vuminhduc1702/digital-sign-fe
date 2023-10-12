import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  type SelectOptionString,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { useUpdateGroup, type UpdateGroupDTO } from '../../api/groupAPI'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import { useUpdateOrgForGroup } from '../../api/groupAPI/updateOrgForGroup'

import { type OrgList } from '~/layout/MainLayout/types'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

const groupSchema = z.object({
  name: z.string(),
})

type UpdateGroupProps = {
  groupId: string
  name: string
  close: () => void
  isOpen: boolean
  organization: string
}

export function UpdateGroup({
  groupId,
  name,
  close,
  isOpen,
  organization,
}: UpdateGroupProps) {
  const { t } = useTranslation()

  const [optionOrg, setOptionOrg] = useState<SelectOptionString>()
  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  console.log('optionOrg', optionOrg)

  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData
    ?.map(org => ({
      label: org?.name,
      value: org?.id,
    }))
    .sort((a, b) => a.value.length - b.value.length)
    .filter(org => org.value !== organization)

  const { mutate, isLoading, isSuccess } = useUpdateGroup()
  const { mutate: mutateUpdateOrgForGroup } = useUpdateOrgForGroup()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    const filterOrg = orgFlattenData.filter(org => org.id === organization)[0]
    console.log('filterOrg', filterOrg)
    if (organization) {
      setOptionOrg({
        label: filterOrg?.name,
        value: filterOrg?.id,
      })
    }
  }, [organization])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.group_manage.add_group.edit')}
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
            form="update-group"
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
      <Form<UpdateGroupDTO['data'], typeof groupSchema>
        id="update-group"
        onSubmit={values =>
          mutate({
            data: {
              name: values.name,
              org_id: optionOrg?.value,
            },
            groupId,
          })
        }
        schema={groupSchema}
        options={{
          defaultValues: { name: name, org_id: organization },
        }}
      >
        {({ register, formState, control, setValue }) => (
          <>
            <InputField
              label={
                t('cloud:org_manage.group_manage.add_group.name') ??
                "Group's name"
              }
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
                  orgSelectOptions || [{ label: t('loading:org'), value: '' }]
                }
                onChange={(e: SelectOptionString) => {
                  setOptionOrg(e)
                  mutateUpdateOrgForGroup({
                    data: {
                      ids: [groupId],
                      org_id: e.value,
                    },
                  })
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
          </>
        )}
      </Form>
    </Drawer>
  )
}
