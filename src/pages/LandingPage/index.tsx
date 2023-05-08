import { useNavigate } from 'react-router-dom'

import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <h1 className="text-h1">Landing Page</h1>
      <Button className="mt-4" size="lg" onClick={() => navigate(PATHS.LOGIN)}>
        Nhấn vào đây để đăng nhập
      </Button>
    </div>
  )
}
