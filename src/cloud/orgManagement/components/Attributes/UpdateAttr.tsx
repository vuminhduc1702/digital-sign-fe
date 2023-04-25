import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { loggedList, valueTypeList } from './CreateAttr'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'
import SelectMenu from '~/components/SelectMenu/SelectMenu'
import {
  type UpdateAttrDTO,
  useGetAttr,
  useUpdateAttr,
} from '../../api/attrAPI'

import { type EntityType } from '~/cloud/orgManagement/api/attrAPI/createAttr'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

const attrSchema = z.object({
  value: z.string(),
})

type UpdateAttrProps = {
  entityId: string
  entityType: EntityType
  attributeKey: string
  close: () => void
  isOpen: boolean
}
export function UpdateAttr({
  entityId,
  entityType,
  attributeKey,
  close,
  isOpen,
}: UpdateAttrProps) {
  const { t } = useTranslation()

  const [selectedValueType, setSelectedValueType] = useState(valueTypeList[0])
  const valueType = selectedValueType.type
  // const [selectedLogged, setSelectedLogged] = useState(loggedList[0])
  // const logged = selectedLogged.type

  const { mutate, isLoading, isSuccess } = useUpdateAttr()

  const { data: attrData, isLoading: attrLoading } = useGetAttr({
    entityType,
    entityId,
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
            form="update-attr"
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
        <Form<UpdateAttrDTO['data'], typeof attrSchema>
          id="update-attr"
          onSubmit={values =>
            mutate({
              data: {
                value: values.value,
                value_t: valueType,
                // logged: logged,
              },
              attributeKey,
              entityType,
              orgId,
            })
          }
          schema={attrSchema}
          options={{
            defaultValues: {
              value: attrData?.value,
              value_t: attrData?.value_type,
              // logged: attrData?.logged,
            },
          }}
        >
          {({ register, formState }) => (
            <>
              <SelectMenu
                label={
                  t('cloud.org_manage.org_manage.add_attr.value_type') ??
                  "Attribute's value type"
                }
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
              {/* <SelectMenu
                data={loggedList}
                selected={selectedLogged}
                setSelected={setSelectedLogged}
              /> */}
              {/* <InputField
                  label={t('cloud.org_manage.org_manage.add_attr.name') ?? 'Name'}
                  error={formState.errors['attribute_key']}
                  registration={register('attribute_key')}
                /> */}
            </>
          )}
        </Form>
      )}
    </Drawer>
  )
}
