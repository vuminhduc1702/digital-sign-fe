import { type ReactElement, cloneElement, useEffect, useRef } from 'react'
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

import { useDisclosure } from '~/utils/hooks'
import { Dialog, DialogTitle } from '../Dialog'
import { Button } from '../Button'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

export type ConfirmationDialogProps = {
  triggerButton: ReactElement
  confirmButton: ReactElement
  title: string
  body?: string
  icon?: 'danger' | 'info'
  isDone?: boolean
}

export const ConfirmationDialog = ({
  triggerButton,
  confirmButton,
  title,
  body = '',
  icon = 'danger',
  isDone = false,
}: ConfirmationDialogProps) => {
  const { close, open, isOpen } = useDisclosure()

  const cancelButtonRef = useRef(null)

  useEffect(() => {
    if (isDone) {
      close()
    }
  }, [isDone, close])

  const trigger = cloneElement(triggerButton, {
    onClick: open,
  })

  return (
    <>
      {trigger}
      <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="sm:flex sm:items-start">
            {icon === 'danger' && (
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-300 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationCircleIcon
                  className="h-6 w-6 text-primary-400"
                  aria-hidden="true"
                />
              </div>
            )}

            {icon === 'info' && (
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary-400 sm:mx-0 sm:h-10 sm:w-10">
                <InformationCircleIcon
                  className="h-6 w-6 text-secondary-600"
                  aria-hidden="true"
                />
              </div>
            )}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <DialogTitle as="h3" className="text-h1 text-secondary-900">
                {title}
              </DialogTitle>
              {body && (
                <div className="mt-2">
                  <p className="text-body-sm text-secondary-900">{body}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              className="inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
              onClick={close}
              ref={cancelButtonRef}
              startIcon={
                <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
              }
            />
            {confirmButton}
          </div>
        </div>
      </Dialog>
    </>
  )
}
