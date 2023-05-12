import { useNavigate } from 'react-router-dom'

import { Button } from '~/components/Button'
import { useUser } from '~/lib/auth'
import { PATHS } from '~/routes/PATHS'
import { useProjectIdStore } from '~/stores/project'

export function LandingPage() {
  const navigate = useNavigate()

  const user = useUser()

  const projectId = useProjectIdStore(state => state.projectId)

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <h1 className="text-h1">Landing Page</h1>
      {user.data ? (
        <Button
          className="mt-4"
          size="lg"
          onClick={() => navigate(`${PATHS.ORG_MANAGE}/${projectId}`)}
        >
          Nhấn vào đây để vào Platform
        </Button>
      ) : (
        <div className="flex gap-x-5">
          <Button
            className="mt-4 w-40"
            size="lg"
            onClick={() => navigate(PATHS.LOGIN)}
          >
            Đăng nhập
          </Button>
          <Button
            className="mt-4 w-40"
            size="lg"
            onClick={() => navigate(PATHS.REGISTER)}
          >
            Đăng ký
          </Button>
        </div>
      )}
    </div>
  )
}
