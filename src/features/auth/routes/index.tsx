import { Route, Routes } from 'react-router-dom'

import { PATHS } from '~/routes/PATHS'
import { Login } from './Login'
import { Register } from './Register'
import { ForgetPassword } from './ForgetPassword'

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path={PATHS.FORGETPASSWORD} element={<ForgetPassword />} />
      <Route path={PATHS.REGISTER} element={<Register />} />
      <Route path={PATHS.LOGIN} element={<Login />} />
    </Routes>
  )
}
