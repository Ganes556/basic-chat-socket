import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  SocketAction,
  SocketActionType,
  SocketState,
} from '../components/PageLayout'

function useCheckAdmin(
  socketState: SocketState,
  dispatch: (args: SocketAction) => void,
  setLogged: (args: boolean) => void
) {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (localStorage.getItem('token')) {
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
}

export default useCheckAdmin
