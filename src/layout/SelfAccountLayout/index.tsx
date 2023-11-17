import { Suspense } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import logo from '~/assets/images/logo.svg'
import { Spinner } from '~/components/Spinner'
import { PATHS } from '~/routes/PATHS'
import { cn } from '~/utils/misc'
import Navbar from '../MainLayout/components/Navbar'

function SelfAccountLayout() {
  const navigate = useNavigate()
  return (
    <div className="flex w-full flex-col">
      <div className="flex">
        <div className="flex h-20 min-w-[256px] items-center justify-center border-b-[2px] border-solid bg-white">
          <img
            src={logo}
            alt="logo"
            className="h-14 cursor-pointer"
            onClick={() => navigate(PATHS.HOME)}
          />
        </div>
        <Navbar />
      </div>
      <div className="flex">
        <div className="min-w-[256px]">Side bar</div>
        <Suspense
          fallback={
            <div className="flex grow items-center justify-center">
              <Spinner size="xl" />
            </div>
          }
        >
          <main
            className={cn(
              'flex w-full grow flex-col self-center overflow-y-auto p-3',
            )}
          >
            <Outlet />
          </main>
        </Suspense>
      </div>
    </div>
  )
}

export default SelfAccountLayout
