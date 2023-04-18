import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { useSpinDelay } from 'spin-delay'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { type UpdateAttrDTO, useUpdateAttr } from '../api/updateAttr'
import { useOrgIdStore } from '~/stores/org'
import { loggedList, valueTypeList } from './CreateAttr'
import { Drawer } from '~/components/Drawer'
import { useGetAttr } from '../api/getAttr'
import { Spinner } from '~/components/Spinner'
import SelectMenu from '~/components/SelectMenu/SelectMenu'

import { type EntityType } from '~/cloud/orgManagement/api/createAttr'

import { SidebarDropDownIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

export const attrSchema = z.object({
  attribute_key: z.string().min(1, 'Vui lòng nhập để tiếp tục').max(30),
  value: z.string().optional(),
})

type CreateAttrProps = {
  entityType: EntityType
  attributeKey: string
  close: () => void
  isOpen: boolean
}
export function UpdateAttr({
  entityType,
  attributeKey,
  close,
  isOpen,
}: CreateAttrProps) {
  const { t } = useTranslation()

  const orgId = useOrgIdStore(state => state.orgId)

  const [selectedValueType, setSelectedValueType] = useState(valueTypeList[0])
  const [selectedLogged, setSelectedLogged] = useState(loggedList[0])
  const logged = selectedLogged.type
  const valueType = selectedValueType.type

  const { mutate, isLoading, isSuccess } = useUpdateAttr()

  const { data: attrData, isLoading: attrLoading } = useGetAttr({
    entityType,
    entityId: orgId,
    attrKey: attributeKey,
    config: { suspense: false },
  })

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const showSpinner = useSpinDelay(attrLoading, {
    delay: 150,
    minDuration: 300,
  })

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
      {attrLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
        <Form<UpdateAttrDTO['data']['attributes'][0], typeof attrSchema>
          id="update-attr"
          onSubmit={values => {
            mutate({
              data: {
                attributes: [
                  {
                    attribute_key: values.attribute_key,
                    value: values.value,
                    logged: logged,
                    value_t: valueType,
                  },
                ],
              },
              entityType,
              orgId,
            })
          }}
          schema={attrSchema}
          options={{
            defaultValues: {
              attribute_key: attrData?.attribute_key,
              value: attrData?.value,
              logged: attrData?.logged,
              value_t: attrData?.value_type,
            },
          }}
        >
          {({ register, formState }) => (
            <>
              <InputField
                label={t('cloud.org_manage.org_manage.add_attr.name') ?? 'Name'}
                error={formState.errors['attribute_key']}
                registration={register('attribute_key')}
              />
              <SelectMenu
                data={valueTypeList}
                selected={selectedValueType}
                setSelected={setSelectedValueType}
              />
              <InputField
                label={
                  t('cloud.org_manage.org_manage.add_attr.value') ?? 'Value'
                }
                error={formState.errors['value']}
                registration={register('value')}
              />
              <SelectMenu
                data={loggedList}
                selected={selectedLogged}
                setSelected={setSelectedLogged}
              />
            </>
          )}
        </Form>
      )}
    </Drawer>
  )
}
