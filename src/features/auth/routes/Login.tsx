import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { LoginForm } from '../components/LoginForm'
import { PATHS } from '~/routes/PATHS'

export const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Layout title={t('user:login')}>
      <LoginForm onSuccess={() => navigate(PATHS.HOME)} />
    </Layout>
  )
}
