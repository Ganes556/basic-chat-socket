import { RouterProvider, createBrowserRouter } from "react-router-dom"
import PageLayout from "./components/PageLayout"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import AdminChatPage from "./pages/AdminChatPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/admin-chat",
        element: <AdminChatPage />,
      },
      {
        path: "*",
        element: <h1>Not Found</h1>,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
