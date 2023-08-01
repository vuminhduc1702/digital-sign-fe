import {
  type ReactElement,
  cloneElement,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

import { useDisclosure } from '~/utils/hooks'
import { Dialog, DialogTitle } from '../Dialog'
import { Button } from '../Button'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { XMarkIcon } from '@heroicons/react/24/outline'

export type ConfirmationDialogProps = {
  triggerButton: ReactElement
  confirmButton: ReactElement
  title: string
  body?: string | ReactNode
  isDone?: boolean
}

export const FormDialog = ({
  triggerButton,
  confirmButton,
  title,
  body = '',
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
      <Dialog
        isOpen={isOpen}
        onClose={() => null}
        initialFocus={cancelButtonRef}
      >
        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <div className="flex items-center justify-between">
              <DialogTitle as="h3" className="text-h1 text-secondary-900">
                {title}
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
            {body && (
              <div className="mt-2">
                <p className="text-body-sm text-secondary-900">{body}</p>
              </div>
            )}
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
