import LPnavigation from './LPnavigation'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type MobileSidebarProps = {
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  childToParent: (childdata: string) => void
}

function MobileLP({
  sidebarOpen,
  setSidebarOpen,
  childToParent,
}: MobileSidebarProps) {
  return (
    <Sheet
      open={sidebarOpen}
      onOpenChange={() => setSidebarOpen(false)}
      modal={true}
      key="left"
    >
      <SheetContent
        className="max-w-xs bg-secondary-400"
        side="left"
        closeButtonAvai={true}
      >
        <SheetHeader className="absolute right-2 top-1 z-10"></SheetHeader>
        <div className="h-full overflow-y-auto">
          <nav className="space-y-1 px-2">
            <LPnavigation childToParent={childToParent} />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileLP
