import { FormEvent, useEffect, useState } from "react"
import io from "socket.io-client"

import Chat from "../components/Chat"

const socket = io("http://localhost:3000")
function HomePage() {
  return (
    <section className="m-auto w-1/2 min-w-fit max-w-full space-y-4">
      <Chat socket={socket} />
    </section>
  )
}

export default HomePage
