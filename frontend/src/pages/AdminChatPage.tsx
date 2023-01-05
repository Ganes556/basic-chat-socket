import { useOutletContext } from 'react-router-dom'
import Chat from '../components/Chat'

import { SocketContext } from '../components/PageLayout'

function AdminChatPage() {
  const { socketState, logged } = useOutletContext<SocketContext>()
  return (
    <section className="m-auto w-1/2 min-w-fit max-w-full space-y-4">
      {logged && <Chat varian="admin" socket={socketState.socketAdmin} />}
      {!logged && (
        <h1 className="text-center text-slate-200 text-xl">No allowed users</h1>
      )}
    </section>
  )
}

export default AdminChatPage
