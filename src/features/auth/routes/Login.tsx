import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { LoginForm } from '../components/LoginForm'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'

export const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const previousPath = storage.getHistoryPath()
  console.log(previousPath)
  return (
    <Layout title={t('user:login')}>
      <LoginForm
        onSuccess={() => {
          if (previousPath != null) {
            window.location.href = previousPath
          } else {
            window.location.href = PATHS.HOME
          }
          storage.clearHistoryPath()
        }}
      />
    </Layout>
  )
}
