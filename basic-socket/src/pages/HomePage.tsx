import React from 'react';
import { FormEvent, useEffect, useState } from 'react';
import io from 'socket.io-client';
import Action from '../components/Action';


const socket = io('http://localhost:3000');
function HomePage() {
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<string[] | []>([]);
  const [joinedRoom, setJoinedRoom] = useState<string | undefined>();

  useEffect(() => {
    socket.on('connect', () => {
      setIsSocketConnected(true);
      setMessages([`Connected by id: ${socket.id}`]);
    });
    socket.on('disconnected', () => {
      setIsSocketConnected(false);
      setMessages([`Disconnected from server`]);
    });
    socket.on('connect_error', (err) => {
      setIsSocketConnected(false);
      setMessages([err.message]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  useEffect(() => {
    socket.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket.off('receive-message');
    };
  }, [messages]);

  function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { message, to } = e.currentTarget;
    if (isSocketConnected) {
      setMessages([...messages, `You: ${message.value}`]);
      if (joinedRoom) {
        socket.volatile.emit('send-message', message.value, {
          room: joinedRoom,
        });
      } else {
        socket.volatile.emit('send-message', message.value, {
          to: to.value ?? '',
        });
      }
    } else {
      document.location.reload();
    }
  }

  function join(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { room } = e.currentTarget;
    socket.emit('join-room', room.value, (message: string[]): void =>
      setMessages(message)
    );
    setJoinedRoom(room.value);
  }
  function leave() {
    socket.emit('quit-room', joinedRoom);
    setMessages([`You are leaving the room : ${joinedRoom}`]);
    setJoinedRoom(undefined);
  }
  return (
    <section className='m-auto w-1/2 min-w-fit max-w-full space-y-4'>
      <div className='h-72 ring-2 flex flex-col text-slate-300 stripped overflow-auto'>
        {messages.length > 0 &&
          messages.map((message, i) => (
            <div key={i} className='p-2 '>
              {message}
            </div>
          ))}
      </div>
      <Action
        label='Message'
        btnName='Send'
        onAction={send}
        nameInput={'message'}
      />
      <Action
        varian='room'
        label='Room'
        btnName='Join'
        onAction={join}
        onLeave={leave}
        nameInput={'room'}
      />
    </section>
  );
}

export default HomePage;
