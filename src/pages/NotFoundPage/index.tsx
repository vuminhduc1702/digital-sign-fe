import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import { PATHS } from '~/routes/PATHS'

function NotFoundPage() {
  const navigate = useNavigate()

  // Redirect to homepage after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate(PATHS.ORG_INFO), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="grid h-[91vh] place-content-center">
      <h1>404 - Trang web không tồn tại</h1>
      <p>Chuyển sang trang chủ trong vòng 3s...</p>
    </div>
  )
}

export default NotFoundPage
