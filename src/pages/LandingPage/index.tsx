import { useNavigate } from 'react-router-dom'

import { Button } from '~/components/Button'
import { useUser } from '~/lib/auth'
import { PATHS } from '~/routes/PATHS'

export function LandingPage() {
  const navigate = useNavigate()

  const user = useUser()

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <h1 className="text-h1">Landing Page</h1>
      {user.data ? (
        <Button
          className="mt-4"
          size="lg"
          variant="primary"
          onClick={() => navigate(PATHS.PROJECT_MANAGE)}
        >
          Nhấn vào đây để chọn Project
        </Button>
      ) : null}
    </div>
  )
}
