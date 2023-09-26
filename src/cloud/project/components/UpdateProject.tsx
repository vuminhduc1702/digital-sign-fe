import { Form, InputField } from "~/components/Form"
import { FormDialog } from "~/components/FormDialog"
import { CreateProjectDTO } from "../api/createProject"
import { useTranslation } from "react-i18next"
import { UpdateProjectDTO, useUpdateProject } from "../api/updateProject"
import { projectSchema } from "./CreateProject"
import { useProjectById } from "../api"
import { Button } from "~/components/Button"
import { PlusIcon } from "~/components/SVGIcons"

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type UpdateProjectProps = {
  projectId: string
  close: () => void
  isOpen: boolean
}

export function UpdateProject({projectId}: UpdateProjectProps) {
  const { t } = useTranslation()
  
  const { mutate, isLoadingProject, isSuccess } = useUpdateProject()

  const { data: projectData, isLoading: attrLoading } = useProjectById({
    projectId,
    config: { suspense: false },
  })

  return (
    <FormDialog
      className="update-project-popup"
      title={t('cloud:project_manager.add_project.title')}
      id='update-project-screen'
      body={
        <Form<UpdateProjectDTO['data']>
          id="update-project"
          className="flex flex-col justify-between"
          onSubmit={values => {
            mutate({
              data: {
                name: values.name,
                description: values.description
              },
              projectId: projectId
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
          form="update-project"
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