import * as React from 'react'

import { useDisclosure } from '~/utils/hooks'
import { Drawer, type DrawerProps } from '../Drawer'
import { Button } from '../Button'

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
            <Button variant="secondary" size="sm" onClick={close}>
              Cancel
            </Button>
            {submitButton}
          </>
        )}
      >
        {children}
      </Drawer>
    </>
  )
}
