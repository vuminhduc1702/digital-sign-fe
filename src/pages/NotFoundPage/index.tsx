import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import { PATHS } from '~/routes/PATHS'

export function NotFoundPage() {
  const navigate = useNavigate()

  // Redirect to homepage after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate(PATHS.HOME), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex grow items-center justify-center">
      <h1>
        404 - Trang web không tồn tại. Chuyển sang trang chủ trong vòng 3s...
      </h1>
    </div>
  )
}
