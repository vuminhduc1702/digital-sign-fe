import { useTranslation } from 'react-i18next'

import { Layout } from '../components/Layout'
import { RegisterForm } from '../components/RegisterForm'
import { toast } from 'sonner'
import { logoutFn } from '~/lib/auth'

export const Register = () => {
  const { t } = useTranslation()

  return (
    <Layout title={t('user:register')}>
      <RegisterForm
        onSuccess={() => {
          logoutFn()
          toast.success(t('user:create_user'))
        }}
      />
    </Layout>
  )
}
