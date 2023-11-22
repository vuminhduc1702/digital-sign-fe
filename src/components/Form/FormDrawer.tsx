import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  useEffect,
} from 'react'

import { useDisclosure } from '~/utils/hooks'
import { Drawer, type DrawerProps } from '../Drawer'
import { Button } from '../Button'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type FormDrawerProps = {
  isDone: boolean
  triggerButton: ReactElement
  submitButton: ReactElement
  title: string
  children: ReactNode
  size?: DrawerProps['size']
  resetData?: () => void
}

export const FormDrawer = ({
  title,
  children,
  isDone,
  triggerButton,
  submitButton,
  size = 'md',
  resetData,
  ...props
}: FormDrawerProps) => {
  const { close, open, isOpen } = useDisclosure()

  useEffect(() => {
    if (isDone) {
      close()
    }
  }, [isDone, close])

  return (
    <>
      {cloneElement(triggerButton, {
        onClick: () => {
          open()
          resetData?.()
        },
      })}
      <Drawer
        isOpen={isOpen}
        onClose={close}
        title={title}
        size={size}
        renderFooter={() => (
          <>
            <Button
              className="rounded border-none"
              variant="secondary"
              size="lg"
              onClick={close}
              startIcon={
                <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
              }
            />
            {submitButton}
          </>
        )}
        {...props}
      >
        {children}
      </Drawer>
    </>
  )
}
