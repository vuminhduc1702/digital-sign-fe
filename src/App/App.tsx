import '~/style/main.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RouteList } from '~/routes/RouteList'
import '~/i18n'

function App() {
  const routerList = RouteList()
  const router = createBrowserRouter([...routerList])
  return <RouterProvider router={router} />
}

export default App
