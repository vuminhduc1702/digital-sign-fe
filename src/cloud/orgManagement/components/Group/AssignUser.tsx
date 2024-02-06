import { XMarkIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import * as z from 'zod'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { SelectField } from '~/components/Form'
import {
  useAssignUser,
  type AssignUserDTO,
} from '../../api/groupAPI/assignUser'
import { useGetUsers } from '../../api/userAPI'
import { useSpinDelay } from 'spin-delay'
import { Spinner } from '~/components/Spinner'
import i18n from '~/i18n'

type AssignUserProps = {
  isOpenAssignUser: boolean
  closeAssignUser: () => void
  groupId: string
}

export const assignUserSchema = z.object({
  user_id: z.string().min(1, {
    message: i18n
      .t('placeholder:select_value')
      .replace('{{VALUE}}', i18n.t('cloud:org_manage.user_manage.title')),
  }),
  group_id: z.string().optional(),
})

const AssignUser = ({
  isOpenAssignUser,
  closeAssignUser,
  groupId,
}: AssignUserProps) => {
  const { t } = useTranslation()
  const { projectId, orgId } = useParams()

  const { data: UserData } = useGetUsers({
    projectId: projectId || '',
    orgId: orgId || '',
    expand: true,
    config: {
      suspense: false,
    },
  })

  const { mutate, isLoading, isSuccess } = useAssignUser()

  useEffect(() => {
    if (isSuccess) {
      closeAssignUser()
    }
  }, [isSuccess, closeAssignUser])

  const { register, formState, handleSubmit } = useForm<AssignUserDTO['data']>({
    resolver: assignUserSchema && zodResolver(assignUserSchema),
  })
  console.log('formState.errors', formState.errors)

  const showSpinner = useSpinDelay(isLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <Dialog isOpen={isOpenAssignUser} onClose={closeAssignUser}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {t('cloud:org_manage.user_manage.add_user.assign')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="text-secondary-900 hover:text-secondary-700 focus:ring-secondary-600 rounded-md bg-white focus:outline-none focus:ring-2"
                onClick={closeAssignUser}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        {!isLoading ? (
          <div className="mt-4">
            <form
              id="assign-user"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    user_id: values.user_id,
                    group_id: groupId,
                  },
                })
              })}
              className="w-full space-y-6 pr-32"
            >
              <SelectField
                label={t('form:user.list')}
                error={formState.errors['user_id']}
                registration={register('user_id')}
                options={UserData?.users.map(item => {
                  return {
                    label: item.name
                      ? item.name
                      : item.email
                      ? item.email
                      : item.phone,
                    value: item.user_id,
                  }
                })}
                classlabel="w-6/12"
                classchild="w-6/12"
                classnamefieldwrapper="flex items-center gap-x-3"
              />
            </form>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Spinner showSpinner={showSpinner} size="xl" />
          </div>
        )}
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            isLoading={isLoading}
            form="assign-user"
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

export default AssignUser
