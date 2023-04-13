import * as React from 'react'

import { useDisclosure } from '~/utils/hooks'
import { Drawer, type DrawerProps } from '../Drawer'
import { Button } from '../Button'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type FormDrawerProps = {
  isDone: boolean
  triggerButton: React.ReactElement
  submitButton: React.ReactElement
  title: string
  children: React.ReactNode
  size?: DrawerProps['size']
}

export const FormDrawer = ({
  title,
  children,
  isDone,
  triggerButton,
  submitButton,
  size = 'md',
}: FormDrawerProps) => {
  const { close, open, isOpen } = useDisclosure()

  React.useEffect(() => {
    if (isDone) {
      close()
    }
  }, [isDone, close])

  return (
    <>
      {React.cloneElement(triggerButton, { onClick: open })}
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
      >
        {children}
      </Drawer>
    </>
  )
}
