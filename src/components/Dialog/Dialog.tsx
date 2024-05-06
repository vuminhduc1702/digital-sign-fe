import {
  Dialog as UIDialog,
  DialogContent as UIDialogContent,
  DialogDescription as UIDialogDescription,
  DialogHeader as UIDialogHeader,
  DialogTitle as UIDialogTitle,
  DialogTrigger as UIDialogTrigger,
} from '@/components/ui/dialog'
import 'intersection-observer'

type DialogProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  initialFocus?: React.MutableRefObject<null>
}

export const DialogTitle = UIDialogTitle

export const DialogDescription = UIDialogDescription

export const Dialog = ({
  isOpen,
  onClose,
  children,
  initialFocus,
}: DialogProps) => {
  return (
    <>
      <UIDialog modal={false} open={isOpen}>
        <UIDialogContent>
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            {children}
          </div>
        </UIDialogContent>
      </UIDialog>
    </>
  )
}
