import { useNavigate } from 'react-router-dom'

import { Layout } from '../components/Layout'
import { LoginForm } from '../components/LoginForm'
import { PATHS } from '~/routes/PATHS'

export const Login = () => {
  const navigate = useNavigate()

  return (
    <Layout title="Log in to your account">
      <LoginForm onSuccess={() => navigate(PATHS.ORG_MANAGE)} />
    </Layout>
  )
}
