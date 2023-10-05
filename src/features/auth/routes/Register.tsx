import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { RegisterForm } from '../components/RegisterForm'
import { useNotificationStore } from '~/stores/notifications'
import { logoutFn } from '~/lib/auth'

export const Register = () => {
  const { t } = useTranslation()
  const { addNotification } = useNotificationStore()

  return (
    <Layout title={t('user:register')}>
      <RegisterForm
        onSuccess={() => {
          logoutFn()
          addNotification({
            type: 'success',
            title: t('user:create_user'),
          })
        }}
      />
    </Layout>
  )
}
