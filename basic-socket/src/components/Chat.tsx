import React, { FormEvent, useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import Action from "./Action"
import { useOutletContext } from "react-router-dom"

type ChatProps = {
  socket: Socket | undefined
}

function Chat({ socket }: ChatProps) {
  const [isSocketConnected, setIsSocketConnected] = useState(socket?.connected)
  const [messages, setMessages] = useState<string[] | []>([])
  const [joinedRoom, setJoinedRoom] = useState<string | undefined>()
  useEffect(() => {
    socket?.on("connect", () => {
      setIsSocketConnected(true)
      console.log(socket.id)
      setMessages([`Connected by id: ${socket.id}`])
    })
    socket?.on("disconnected", () => {
      setIsSocketConnected(false)
      setMessages([`Disconnected from server`])
    })
    socket?.on("connect_error", (err) => {
      setIsSocketConnected(false)
      setMessages([err.message])
    })

    return () => {
      socket?.off("connect")
      socket?.off("disconnect")
      socket?.off("connect_error")
    }
  }, [])

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

export default Chat
