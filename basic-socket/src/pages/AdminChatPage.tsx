import React, { useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import Chat from "../components/Chat"
import ChatAdmin from "../components/ChatAdmin"

function AdminChatPage() {
  const { socketAdmin } = useOutletContext<SocketContext>()

  return (
    <section className="m-auto w-1/2 min-w-fit max-w-full space-y-4">
      <ChatAdmin socket={socketAdmin} />
    </section>
  )
}

export default AdminChatPage
