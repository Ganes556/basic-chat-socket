import { Dispatch, useEffect, useReducer, useRef, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Socket, io } from 'socket.io-client'

export enum SocketActionType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface SocketAction {
  type: SocketActionType
  auth?: { username: string; password: string } | { token: string }
}
interface SocketState {
  socket: Socket | undefined
  socketAdmin: Socket | undefined
}
export type SocketContext = {
  socketState: {
    socket: Socket
    socketAdmin: Socket
  }
  dispatch: (args: SocketAction) => void
  logged: boolean
}
function reducer(state: SocketState, action: SocketAction) {
  const { type } = action
  switch (type) {
    case SocketActionType.USER:
      return {
        socket: io('http://localhost:3000'),
        socketAdmin: state.socketAdmin,
      }
    case SocketActionType.ADMIN:
      if (action.auth) {
        return {
          socket: state.socket,
          socketAdmin: io('http://localhost:3000/admin', {
            auth: { ...action.auth },
          }),
        }
      }
      return {
        socket: state.socket,
        socketAdmin: undefined,
      }
    default:
      return state
  }
}

export default function PageLayout() {
  const [socketState, dispatch] = useReducer(reducer, {
    socket: undefined,
    socketAdmin: undefined,
  })

  const [logged, setLogged] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      console.log()
      dispatch({
        type: SocketActionType.ADMIN,
        auth: { token: localStorage.getItem('token') || '' },
      })
    }

    if (location.pathname !== '/admin-chat') {
      dispatch({ type: SocketActionType.USER })
    }
  }, [location])

  useEffect(() => {
    socketState.socketAdmin?.on('connect', () => {
      setLogged(true)
      if (location.pathname !== '/admin-chat') {
        navigate('/admin-chat')
      }
      socketState.socketAdmin?.on('token', (token) => {
        localStorage.setItem('token', token)
      })
    })
    socketState.socketAdmin?.on('connect_error', (err) => {
      if (
        err.message === 'Not authorized' ||
        err.message === 'Not authenticated'
      ) {
        setLogged(false)
        alert(err.message)
      }
    })
    return () => {
      socketState.socketAdmin?.off('connect_error')
      socketState.socketAdmin?.off('token')
    }
  }, [socketState.socketAdmin])

  return (
    <>
      <header className="container flex fixed py-5 px-3 bg-blue-700 max-w-full justify-center">
        <ul className="container justify-center flex max-w-2xl gap-x-5 text-slate-100">
          {!logged && (
            <>
              <li className="text-xl">
                <Link to={'/'}>Home</Link>
              </li>
              <li className="text-xl">
                <Link to={'/login'}>Login</Link>
              </li>
            </>
          )}
          {logged && (
            <li className="text-xl">
              <button
                onClick={() => {
                  setLogged(false)
                  localStorage.removeItem('token')
                  navigate('/login')
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
          context={{ socketState, dispatch, logged }}
        />
      </main>
    </>
  )
}
