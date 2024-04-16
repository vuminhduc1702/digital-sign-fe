import { Drawer } from '~/components/Drawer'
import LPnavigation from './LPnavigation'

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
    <Drawer
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      title={''}
      renderFooter={() => <></>}
      modal={true}
      side="left"
      classNameBody="xs2:max-w-[320px] relative flex w-full max-w-[420px] flex-1 flex-col bg-red-600 text-white"
      classNameHeader="absolute right-2 top-4 z-10"
      classNameContentArea="justify-start"
    >
      <nav className="space-y-1 px-2">
        <LPnavigation childToParent={childToParent} />
      </nav>
    </Drawer>
  )
}

export default MobileLP
