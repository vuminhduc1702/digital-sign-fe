import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { ForgetPasswordForm } from '../components/ForgetPasswordForm'
import { logoutFn } from '@/lib/auth'
import { toast } from 'sonner'

export const ForgetPassword = () => {
  const { t } = useTranslation()

  return (
    <Layout title={t('user:forgot_password')}>
      <ForgetPasswordForm
        onSuccess={() => {
          logoutFn()
          toast.success(t('auth:success_password'))
        }}
      />
    </Layout>
  )
}
