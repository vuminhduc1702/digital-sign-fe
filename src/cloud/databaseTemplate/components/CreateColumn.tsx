import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import { FormDrawer, InputField } from '~/components/Form'
import storage from '~/utils/storage'
import { useAddColumn, useCreateDataBase, type AddColumnDTO } from '../api'

import { nameSchema } from '~/utils/schemaValidation'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { PlusIcon } from '~/components/SVGIcons'
import { useParams } from 'react-router-dom'

export const createColumnSchema = z.object({
  fields: z.array(
    z.record(z.string(), z.string())
  ),
})

export default function CreateColumn() {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { tableName } = useParams()

  const { mutate, isLoading, isSuccess } = useAddColumn()

  const { register, formState, watch, handleSubmit, control, reset } = useForm<
    AddColumnDTO['data']
  >({
    resolver: createColumnSchema && zodResolver(createColumnSchema),
    defaultValues: {
      table: '',
      fields: [{ name: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({
    name: 'fields',
    control,
  })
  return (
    <FormDrawer
      isDone={isSuccess}
      resetData={() => reset()}
      triggerButton={
        <Button
          className="absolute top-[57px] right-[36px] h-9 w-9 rounded-md border-none"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:db_template.add_db.add_column')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-database"
          type="submit"
          size="lg"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <form
        className="w-full space-y-5"
        id="create-database"
        onSubmit={handleSubmit(async values => {
          mutate({
            data: {
              project_id: projectId,
              table: tableName || "",
              fields: values.fields,
            },
          })
        })}
      >
        <>
          <Button
            className="h-9 w-9 rounded-md"
            variant="trans"
            size="square"
            startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
            onClick={() =>
              append({
                name: '',
              })
            }
          />
          {fields.map((field, index) => (
            <section
              key={field.id}
              className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4"
            >
              <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-1">
                <InputField
                  label={t('cloud:db_template.add_db.column')}
                  error={formState?.errors?.fields?.[index]?.name}
                  registration={register(`fields.${index}.name` as const)}
                />
              </div>
              <Button
                type="button"
                size="square"
                variant="trans"
                className="mt-3 border-none"
                onClick={() => remove(index)}
                startIcon={
                  <img
                    src={btnDeleteIcon}
                    alt="Delete device template"
                    className="h-8 w-8"
                  />
                }
              />
            </section>
          ))}
        </>
      </form>
    </FormDrawer>
  )
}
