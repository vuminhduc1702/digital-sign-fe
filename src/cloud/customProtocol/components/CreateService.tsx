import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Form, InputField, SelectField } from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import { serviceThingSchema } from './CreateAdapter'
import { CodeEditor } from './CodeEditor'
import { Button } from '~/components/Button'
import {
  type CreateServiceThingDTO,
  useCreateServiceThing,
} from '../api/serviceThing'
import i18n from '~/i18n'

import { inputService } from '../types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const outputList = [
  {
    label: i18n.t('cloud:custom_protocol.service.json'),
    value: 'json',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.str'),
    value: 'str',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.i32'),
    value: 'i32',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.i64'),
    value: 'i64',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.f32'),
    value: 'f32',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.f64'),
    value: 'f64',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.bool'),
    value: 'bool',
  },
]

export function CreateService({ thingId }: { thingId: string }) {
  const { t } = useTranslation()

  const [codeInput, setCodeInput] = useState('')

  const {
    mutate: mutateService,
    isLoading: isLoadingService,
    isSuccess: isSuccessService,
  } = useCreateServiceThing()

  return (
    <FormDialog
      isDone={isSuccessService}
      title={t('cloud:custom_protocol.service.create')}
      body={
        <Form<CreateServiceThingDTO['data'], typeof serviceThingSchema>
          id="create-serviceThing"
          className="flex flex-col justify-between"
          onSubmit={values => {
            // console.log('service values', values)
            mutateService({
              data: {
                name: values.name,
                description: values.description,
                output: values.output,
                input: inputService,
                code: codeInput,
              },
              thingId,
            })
          }}
          schema={serviceThingSchema}
        >
          {({ register, formState }) => {
            return (
              <>
                <InputField
                  label={t('cloud:custom_protocol.service.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                />
                <SelectField
                  label={t('cloud:custom_protocol.service.output')}
                  error={formState.errors['output']}
                  registration={register('output')}
                  options={outputList}
                />
                <InputField
                  label={t('cloud:custom_protocol.service.description')}
                  error={formState.errors['description']}
                  registration={register('description')}
                />
                <CodeEditor
                  label={t('cloud:custom_protocol.service.code')}
                  setCodeInput={setCodeInput}
                />
              </>
            )
          }}
        </Form>
      }
      triggerButton={
        <Button
          variant="trans"
          className="rounded-md"
          size="square"
          disabled={!thingId}
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      confirmButton={
        <Button
          isLoading={isLoadingService}
          form="create-serviceThing"
          type="submit"
          size="md"
          className="bg-primary-400"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
