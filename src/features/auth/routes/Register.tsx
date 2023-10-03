import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { RegisterForm } from '../components/RegisterForm'
import { PATHS } from '~/routes/PATHS'
import { useNotificationStore } from '~/stores/notifications'
import { logoutFn, useLogout } from '~/lib/auth'
import storage from '~/utils/storage'
import { useEffect } from 'react'

export const Register = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addNotification } = useNotificationStore()

  return (
    <Layout title={t('user:register')}>
      <RegisterForm onSuccess={() => {
        logoutFn()
        navigate(PATHS.LOGIN)
        addNotification({
          type: 'success',
          title: t('user:create_user')
        })
      }} />
    </Layout>
  )
}
