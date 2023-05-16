import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { RegisterForm } from '../components/RegisterForm'
import { PATHS } from '~/routes/PATHS'

export const Register = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Layout title={t('user.register')}>
      <RegisterForm onSuccess={() => navigate(PATHS.HOME)} />
    </Layout>
  )
}
