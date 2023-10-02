import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { RegisterForm } from '../components/RegisterForm'
import { PATHS } from '~/routes/PATHS'
import { useNotificationStore } from '~/stores/notifications'
import { useLogout } from '~/lib/auth'

export const Register = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addNotification } = useNotificationStore()
  const logout = useLogout()

  return (
    <Layout title={t('user:register')}>
      <RegisterForm onSuccess={() => {
        logout.mutate({})
        navigate(PATHS.LOGIN)
        addNotification({
          type: 'success',
          title: t('user:create_user')
        })
      }} />
    </Layout>
  )
}
