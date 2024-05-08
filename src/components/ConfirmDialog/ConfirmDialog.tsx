import { useEffect, useRef, type ReactNode } from 'react'
import { HiExclamationCircle, HiInformationCircle } from 'react-icons/hi2'

import { Dialog, DialogTitle } from '../Dialog'
import { Button } from '../Button'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'

export type ConfirmDialogProps = {
  title: string
  body?: string | ReactNode
  icon?: 'danger' | 'info'
  close: () => void
  isOpen: boolean
  isLoading?: boolean
  isSuccessDelete?: boolean
  handleSubmit: () => void
}

export const ConfirmDialog = ({
  title,
  body = '',
  icon = 'danger',
  close,
  isOpen,
  isLoading,
  isSuccessDelete,
  handleSubmit,
}: ConfirmDialogProps) => {
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    if (isSuccessDelete) {
      close()
    }
  }, [isSuccessDelete])

  return (
    <>
      <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
        <div className="inline-block overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="sm:flex sm:items-start">
            {icon === 'danger' && (
              <div className="mx-auto flex shrink-0 items-center justify-center rounded-full bg-primary-300 sm:mx-0">
                <HiExclamationCircle
                  className="h-9 w-9 text-primary-400"
                  aria-hidden="true"
                />
              </div>
            )}

            {icon === 'info' && (
              <div className="mx-auto flex shrink-0 items-center justify-center rounded-full bg-secondary-400 sm:mx-0">
                <HiInformationCircle
                  className="h-9 w-9 text-secondary-600"
                  aria-hidden="true"
                />
              </div>
            )}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <DialogTitle className="text-h1 text-secondary-900">
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
              isLoading={isLoading}
              type="button"
              size="md"
              className="bg-primary-400"
              onClick={handleSubmit}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
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
          </div>
        </div>
      </Dialog>
    </>
  )
}
