import { FormEvent, useEffect, useState } from 'react'

import Chat from '../components/Chat'
import { useLocation, useOutletContext } from 'react-router-dom'
import { SocketContext } from '../components/PageLayout'

function HomePage() {
  const { socketState } = useOutletContext<SocketContext>()
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>()
  useEffect(() => {
    socketState.socket?.on('connect', () => {
      setIsSocketConnected(true)
    })
    socketState.socket?.on('disconnected', () => {
      setIsSocketConnected(false)
    })
    socketState.socket?.on('connect_error', (err: Error) => {
      setIsSocketConnected(false)
    })

    return () => {
      socketState.socket?.off('connect')
      socketState.socket?.off('disconnect')
      socketState.socket?.off('connect_error')
    }
  }, [socketState.socket])

  return (
    <section className="m-auto w-1/2 min-w-fit max-w-full space-y-4">
      {isSocketConnected && <Chat socket={socketState.socket} />}
      {!isSocketConnected && (
        <h1 className="text-center text-slate-200 text-xl">
          Disconnected from server
        </h1>
      )}
    </section>
  )
}

export default HomePage
