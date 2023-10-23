import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { ForgetPasswordForm } from '../components/ForgetPasswordForm'
import { logoutFn } from '~/lib/auth'
import { useNotificationStore } from '~/stores/notifications'

export const ForgetPassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addNotification } = useNotificationStore()

  return (
    <Layout title={t('user:forgot_password')}>
      <ForgetPasswordForm
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