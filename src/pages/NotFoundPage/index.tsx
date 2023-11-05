import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate(-1), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex grow items-center justify-center">
      <h1>
        404 - Trang web không tồn tại. Chuyển sang trang trước trong vòng 3s...
      </h1>
    </div>
  )
}
