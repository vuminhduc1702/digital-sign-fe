import { Form, InputField } from "~/components/Form"
import { FormDialog } from "~/components/FormDialog"
import { CreateProjectDTO } from "../api/createProject"
import { useTranslation } from "react-i18next"
import { UpdateProjectDTO, useUpdateProject } from "../api/updateProject"
import { projectSchema } from "./CreateProject"
import { useProjectById } from "../api"
import { Button } from "~/components/Button"

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { Dialog, DialogTitle } from "~/components/Dialog"
import { XMarkIcon } from "@heroicons/react/20/solid"
import { useEffect, useRef } from "react"

type UpdateProjectProps = {
  selectedUpdateProjectId: string
  close: () => void
  isOpen: boolean
}

export function UpdateProject({ selectedUpdateProjectId, isOpen }: UpdateProjectProps) {
  const { t } = useTranslation()

  const cancelButtonRef = useRef(null)

  const { mutate, isLoading, isSuccess } = useUpdateProject()

  const { data: projectData } = useProjectById({
    projectId: selectedUpdateProjectId,
    config: { suspense: false },
  })

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:project_manager.add_project.edit')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <Form<UpdateProjectDTO['data']>
            id="update-project"
            className="flex flex-col justify-between"
            onSubmit={values => {
              mutate({
                data: {
                  name: values.name,
                  description: values.description
                },
                projectId: selectedUpdateProjectId
              })
            }}
            // schema={projectSchema}
            options={{
              defaultValues: {
                name: projectData?.name,
                description: projectData?.description
              }
            }}
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
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
            }
            ref={cancelButtonRef}
          />
          <Button
            isLoading={isLoading}
            form="update-project"
            type="submit"
            size="md"
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </div>
      </div>
    </Dialog>
  )
}