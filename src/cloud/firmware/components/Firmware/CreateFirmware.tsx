import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useGetTemplates } from '@/cloud/deviceTemplate/api'
import { Button } from '@/components/ui/button'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '@/components/Form'
import { FormDialog } from '@/components/FormDialog'
import storage from '@/utils/storage'
import {
  useCreateFireWare,
  type CreateFirmWareDTO,
} from '../../api/firmwareAPI/createFirmware'
import i18n from '@/i18n'

import { nameSchema, versionSchema } from '@/utils/schemaValidation'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { PlusIcon } from '@/components/SVGIcons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const entityFirmWareSchema = z.object({
  name: nameSchema,
  template_id: z
    .string()
    .min(1, { message: i18n.t('cloud:firmware.choose_template') }),
  tag: z.string().optional(),
  version: versionSchema,
  description: z.string().optional(),
})

export function CreateFirmWare() {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id

  const { data } = useGetTemplates({ projectId })

  const { mutate, isLoading, isSuccess } = useCreateFireWare()

  const form = useForm<CreateFirmWareDTO['data']>({
    resolver: entityFirmWareSchema && zodResolver(entityFirmWareSchema),
    defaultValues: { template_id: '' },
  })

  const { reset, handleSubmit } = form

  return (
    <FormDialog
      resetData={() => reset()}
      isDone={isSuccess}
      title={t('cloud:firmware.add_firmware.title')}
      body={
        <>
          <Form {...form}>
            <form
              id="create-firm-ware"
              className="flex w-full flex-col justify-between space-y-6"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    name: values.name,
                    project_id: projectId,
                    tag: values.tag,
                    version: values.version,
                    template_id: values?.template_id || '',
                    description: values.description,
                  },
                })
              })}
            >
              <>
                <FormField
                  control={form.control}
                  name="template_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:firmware.add_firmware.template')}
                      </FormLabel>
                      <div>
                        <Select
                          {...field}
                          onValueChange={e => onChange(e)}
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
                            {data?.templates?.map(template => (
                              <SelectItem
                                key={template.name}
                                value={template.id}
                              >
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:firmware.add_firmware.name')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('placeholder:input_text')}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:firmware.add_firmware.version')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('placeholder:input_text')}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:firmware.add_firmware.tag')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('placeholder:input_text')}
                          />
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
                        {t('cloud:firmware.add_firmware.description')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('placeholder:input_text')}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            </form>
          </Form>
        </>
      }
      triggerButton={
        <Button className="h-[38px] rounded border-none">
          {t('cloud:firmware.add_firmware.button')}
        </Button>
      }
      confirmButton={
        <Button
          isLoading={isLoading}
          form="create-firm-ware"
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
