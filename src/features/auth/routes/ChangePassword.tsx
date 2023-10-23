import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { ChangePaswordForm } from '../components/ChangePasswordForm'
import { logoutFn } from '~/lib/auth'
import { useNotificationStore } from '~/stores/notifications'

export const ChangePassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addNotification } = useNotificationStore()

  return (
    <Layout title={t('user:reset_password')}>
      <ChangePaswordForm
        onSuccess={() => {
          logoutFn()
          addNotification({
            type: 'success',
            title: t('auth:success_password'),
          })
        }}
      />
    </Layout>
  )
}
