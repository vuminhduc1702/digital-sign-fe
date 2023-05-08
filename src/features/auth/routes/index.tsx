import { Route, Routes } from 'react-router-dom'

import { PATHS } from '~/routes/PATHS'
import { Login } from './Login'
import { Register } from './Register'

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path={PATHS.REGISTER} element={<Register />} />
      <Route path={PATHS.LOGIN} element={<Login />} />
    </Routes>
  )
}
