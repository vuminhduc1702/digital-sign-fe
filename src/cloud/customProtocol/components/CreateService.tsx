import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  useCreateServiceThing,
  type CreateServiceThingDTO,
} from '@/cloud/flowEngineV2/api/thingServiceAPI'
import { FormDialog } from '@/components/FormDialog'
import { Button } from '@/components/ui/button'
import i18n from '@/i18n'
import { cn } from '@/utils/misc'
import { CodeEditor } from './CodeEditor'
import { serviceThingSchema } from './CreateAdapter'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { inputService } from '../types'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { PlusIcon } from '@/components/SVGIcons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
] as const

export function CreateService({
  thingId,
  classNameTriggerBtn,
}: {
  thingId: string
  classNameTriggerBtn?: string
}) {
  const { t } = useTranslation()

  const form = useForm<CreateServiceThingDTO['data']>({
    resolver: serviceThingSchema && zodResolver(serviceThingSchema),
    defaultValues: {
      output: 'json',
    },
  })

  const { register, formState, handleSubmit } = form

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
        <Form {...form}>
          <form
            id="create-serviceThing"
            className="flex flex-col justify-between space-y-6"
            onSubmit={handleSubmit(values => {
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
            })}
          >
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:custom_protocol.service.name')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="output"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:custom_protocol.service.output')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={onChange}
                          value={value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('placeholder:select')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {outputList.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('cloud:custom_protocol.service.description')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <CodeEditor
                label={t('cloud:custom_protocol.service.code')}
                setCodeInput={setCodeInput}
              />
            </>
          </form>
        </Form>
      }
      triggerButton={
        <Button
          variant="trans"
          className={cn('rounded-md', classNameTriggerBtn)}
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
