import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Button } from '~/components/Button'
import { Form, InputField, SelectDropdown, SelectOptionString } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { useUpdateGroup, type UpdateGroupDTO } from '../../api/groupAPI'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { queryClient } from '~/lib/react-query'
import { OrgList } from '~/layout/MainLayout/types'
import { flattenData } from '~/utils/misc'

const groupSchema = z.object({
  name: z.string(),
})

type UpdateGroupProps = {
  groupId: string
  name: string
  close: () => void
  isOpen: boolean
}

export function UpdateGroup({
  groupId,
  name,
  close,
  isOpen,
}: UpdateGroupProps) {
  const { t } = useTranslation()

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })

  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const [optionOrg, setOptionOrg] = useState<SelectOptionString>()

  const { mutate, isLoading, isSuccess } = useUpdateGroup()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])


  // useEffect(() => {
  //   if (organization.id) {
  //     setOptionOrg({
  //       label: selectedUpdateOrg?.parent_name,
  //       value: selectedUpdateOrg?.id,
  //     })
  //   }
  // }, [selectedUpdateOrg])

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
            },
            groupId,
          })
        }
        schema={groupSchema}
        options={{
          defaultValues: { name },
        }}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={
                t('cloud:org_manage.group_manage.add_group.name') ??
                "Group's name"
              }
              error={formState.errors['name']}
              registration={register('name')}
            />
            {/* <div className="space-y-1">
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
                  mutateUpdateOrg({
                    data: {
                      ids: [e?.value]
                    },
                    orgId: selectedUpdateOrg.id
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
            </div> */}
          </>
        )}
      </Form>
    </Drawer>
  )
}
