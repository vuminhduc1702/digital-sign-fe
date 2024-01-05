import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  useEffect,
  useMemo,
} from 'react'

import { useDisclosure } from '~/utils/hooks'
import { Drawer, type DrawerProps } from '../Drawer'
import { Button } from '../Button'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetPortal,
  SheetOverlay,
} from '../Sheet/Sheet'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { useLocation, useParams } from 'react-router-dom'

type FormDrawerProps = {
  isDone: boolean
  triggerButton: ReactElement
  submitButton: ReactElement
  title: string
  children: ReactNode
  size?: DrawerProps['size']
  resetData?: () => void
}

const useSearchQuery = () => {
  const { search } = useLocation()

  return useMemo(() => new URLSearchParams(search), [search])
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

  const query = useSearchQuery()
  const openDrawer = query.get('openDrawer')

  useEffect(() => {
    if (isDone) {
      close()
    }
  }, [isDone, close])

  useEffect(() => {
    if (openDrawer) {
      open()
    }
  }, [openDrawer])

  return (
    <Sheet modal={false}>
      <SheetTrigger>
        {cloneElement(triggerButton, {
          onClick: () => {
            open()
            resetData?.()
          },
        })}
      </SheetTrigger>
      <Drawer
        isOpen={isOpen}
        onClose={() => {
          resetData?.()
          close()
        }}
        title={title}
        size={size}
        renderFooter={() => (
          <>
            <SheetTrigger>
              <Button
                className="rounded border-none"
                variant="secondary"
                size="lg"
                onClick={close}
                startIcon={
                  <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
                }
              />
            </SheetTrigger>
            {submitButton}
          </>
        )}
        resetData={resetData}
        {...props}
      >
        {children}
      </Drawer>
    </Sheet>
  )
}
