import { FormEvent, useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import Action from "./Action"
import { useJwt } from "react-jwt"

type ChatProps = {
  socket: Socket | undefined
}
interface decodedToken {
  name: string
  username: string
}
function ChatAdmin({ socket }: ChatProps) {
  const [isSocketConnected, setIsSocketConnected] = useState(socket?.connected)
  const [messages, setMessages] = useState<string[] | []>([])
  const [joinedRoom, setJoinedRoom] = useState<string | undefined>()

  const { decodedToken } = useJwt<decodedToken>(
    localStorage.getItem("token") || ""
  )

  useEffect(() => {
    socket?.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message])
    })
    return () => {
      socket?.off("receive-message")
    }
  }, [messages])

  function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const { message, to } = e.currentTarget
    if (isSocketConnected) {
      setMessages([...messages, `You: ${message.value}`])
      if (joinedRoom) {
        socket?.volatile.emit("send-message", message.value, {
          room: joinedRoom,
        })
      } else {
        socket?.volatile.emit("send-message", message.value, {
          to: to.value ?? "",
        })
      }
    } else {
      document.location.reload()
    }
  }
  function join(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const { room } = e.currentTarget
    socket?.emit("join-room", room.value, (message: string[]): void =>
      setMessages(message)
    )
    setJoinedRoom(room.value)
  }

  function leave() {
    socket?.emit("quit-room", joinedRoom)
    setMessages([`You are leaving the room : ${joinedRoom}`])
    setJoinedRoom(undefined)
  }

  return (
    <>
      {decodedToken && <h1>Hi, {decodedToken.name}</h1>}
      <div className="h-72 ring-2 flex flex-col text-slate-300 stripped overflow-auto">
        {messages.length > 0 &&
          messages.map((message, i) => (
            <div key={i} className="p-2 ">
              {message}
            </div>
          ))}
      </div>
      <Action
        label="Message"
        btnName="Send"
        onAction={send}
        nameInput={"message"}
      />
      <Action
        varian="room"
        label="Room"
        btnName="Join"
        onAction={join}
        onLeave={leave}
        nameInput={"room"}
      />
    </>
  )
}

export default ChatAdmin
