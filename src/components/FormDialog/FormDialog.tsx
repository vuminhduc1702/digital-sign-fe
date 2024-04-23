import {
  type ReactElement,
  cloneElement,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

import { useDisclosure } from '@/utils/hooks'
import { Dialog, DialogTitle } from '../Dialog'
import { Button } from '../Button'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import { HiOutlineXMark } from 'react-icons/hi2'
import { cn } from '@/utils/misc'

const formDialogSizes = {
  sm: 'max-w-[32rem]',
  md: 'max-w-[48rem]',
  lg: 'max-w-[60rem]',
  max: 'max-w-[75rem]',
}

export type ConfirmationDialogProps = {
  triggerButton: ReactElement
  confirmButton: ReactElement
  title: string
  body?: string | ReactNode
  isDone?: boolean
  className?: string
  id?: string
  resetData?: () => void
  size?: keyof typeof formDialogSizes
  isFullScreen?: boolean
}

export const FormDialog = ({
  triggerButton,
  confirmButton,
  title,
  body = '',
  isDone = false,
  id,
  resetData,
  isFullScreen,
  size,
  className,
}: ConfirmationDialogProps) => {
  const { close, open, isOpen } = useDisclosure()

  const cancelButtonRef = useRef(null)

  useEffect(() => {
    if (isDone) {
      close()
    }
  }, [isDone, close])

  const trigger = cloneElement(triggerButton, {
    onClick: () => {
      triggerButton.props.onClick?.()
      open()
      resetData?.()
    },
  })

  return (
    <>
      {trigger}
      <Dialog
        isOpen={isOpen}
        onClose={() => null}
        initialFocus={cancelButtonRef}
      >
        <div
          id={id}
          className={cn(
            'inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:w-full sm:p-3 sm:align-middle',
            className,
            size ? formDialogSizes[size] : 'sm:max-w-lg',
          )}
        >
          <div
            className={cn(
              'mt-3 pb-5 pl-5 pr-5 text-center sm:mt-0 sm:text-left',
              {
                'h-[95%]': isFullScreen,
              },
            )}
          >
            <div className="flex items-center justify-between">
              <div className="mx-auto">
                <DialogTitle className="text-2xl font-semibold ">
                  {title}
                </DialogTitle>
              </div>
              <div className="flex h-7 ">
                <button
                  className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                  onClick={close}
                >
                  <span className="sr-only">Close panel</span>
                  <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
            {body && (
              <div
                className={cn('mt-4', {
                  'h-[95%]': isFullScreen,
                })}
              >
                <p className="text-body-sm text-secondary-900">{body}</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center space-x-2">
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
