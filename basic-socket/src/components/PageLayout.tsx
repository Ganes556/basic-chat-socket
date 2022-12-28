import { useEffect, useRef, useState } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { Socket, io } from "socket.io-client"

export default function PageLayout() {
  const [socketAdmin, setSocketAdmin] = useState<Socket | undefined>()
  const logged = useRef<boolean>()
  const navigate = useNavigate()
  let location = useLocation()

  // useEffect(() => {

  // }, [])

  useEffect(() => {
    if (socketAdmin) {
      socketAdmin.on("connect", () => {
        navigate("/admin-chat")
        logged.current = true
        if (!localStorage.getItem("token")) {
          socketAdmin.on("token", (token) => {
            localStorage.setItem("token", token)
          })
        }
      })

      socketAdmin.on("disconnect", () => {
        logged.current = false
        navigate("/login")
      })
      socketAdmin.on("connect_error", (err) => {
        alert(err.message)
        logged.current = false
        navigate("/login")
      })
    }
    return () => {
      socketAdmin?.off("connect")
      socketAdmin?.off("disconnect")
      socketAdmin?.off("connect_error")
    }
  }, [socketAdmin])

  useEffect(() => {
    if (!socketAdmin) {
      if (localStorage.getItem("token")) {
        setSocketAdmin(
          io("http://localhost:3000/admin", {
            auth: { token: localStorage.getItem("token") },
          })
        )
      }
    }
    if (location.pathname === "/admin-chat") {
      // if (!tokenRef.current) navigate("/login")

      if (!logged.current) navigate("/login")
    }
  }, [location])

  return (
    <>
      <header className="container flex fixed py-5 px-3 bg-blue-700 max-w-full justify-center">
        <ul className="container justify-center flex max-w-2xl gap-x-5 text-slate-100">
          <li className="text-xl">
            <Link to={"/"}>Home</Link>
          </li>
          <li className="text-xl">
            <Link to={"/login"}>Login</Link>
          </li>
          {logged.current && (
            <li className="text-xl">
              <button
                onClick={() => {
                  logged.current = false
                  localStorage.removeItem("token")
                  navigate("/login")
                }}
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </header>
      <main className="w-screen p-2 min-h-screen max-h-full flex bg-slate-500">
        <Outlet
          // context={{ socketAdmin, setSocketAdmin, token: tokenRef.current }}
          context={{ socketAdmin, setSocketAdmin }}
        />
      </main>
    </>
  )
}
