
import { useTranslation } from "react-i18next"
import { Button } from "~/components/Button"
import { FormDialog } from "~/components/FormDialog"
import { PlusIcon } from "~/components/SVGIcons"
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { CreateProjectDTO, useCreateProject } from "../api/createProject"
import { Form, InputField } from "~/components/Form"
import { z } from "zod"
import { nameSchema } from "~/utils/schemaValidation"

export const projectSchema = z.object({
  name: nameSchema,
  description: z.string(),
})

export function CreateProject(){
  const { t } = useTranslation()

  const {
    data: dataCreateProject,
    mutate: mutateProject,
    isLoading: isLoadingProject,
    isSuccess: isSuccessProject,
  } = useCreateProject()


  return (
    <FormDialog
      className="project-popup"
      title={t('cloud:project_manager.add_project.title')}
      id='create-project-screen'
      body={
        <Form<CreateProjectDTO['data']>
          id="create-project"
          className="flex flex-col justify-between"
          onSubmit={values => {
            mutateProject({
              data: {
                name: values.name,
                description: values.description
              },
            })
          }}
          schema={projectSchema}
        >
          {({ register, formState }) => {
            return (
              <>
                <InputField
                  label={t('cloud:project_manager.add_project.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                />
                <InputField
                  label={t('cloud:project_manager.add_project.description')}
                  error={formState.errors['description']}
                  registration={register('description')}
                />
                {/* <InputField
                  label={t('cloud:custom_protocol.thing.base_template')}
                  error={formState.errors['base_template']}
                  registration={register('base_template')}
                /> */}
              </>
            )
          }}
        </Form>
      }
      triggerButton={
        <Button
          className="h-9 w-9 rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      confirmButton={
        <Button
          isLoading={isLoadingProject}
          form="create-project"
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