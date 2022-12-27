import React, { FormEvent, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';

function LoginPage() {
  const [socket, setSocket]: [Socket, Function] = useOutletContext();
  // const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  // useEffect(() => {
  //   if (socket) {
  //     socket.on('connect', () => {
  //       setIsSocketConnected(true);
  //     });
  //     socket.on('disconnect', () => {
  //       setIsSocketConnected(false);
  //     });
  //     socket.on('connect_error', (err) => {
  //       console.log(err.message);
  //     });
  //   }
  //   return () => {
  //     socket?.off('connect');
  //     socket?.off('connect_error');
  //   };
  // }, [socket]);
  function onLogin(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const { username, password } = e.currentTarget;

    setSocket(
      io('http://localhost:3000/admin', {
        auth: { username: username.value, password: password.value },
      })
    );
  }

  return (
    <section className='m-auto flex flex-col gap-3 container max-w-2xl py-10 rounded-md text-slate-50 bg-blue-600'>
      <h1 className='text-xl text-center'>Login Chat Admin</h1>
      <form
        className='w-1/2 flex flex-col m-auto gap-5'
        onSubmit={onLogin}
        method={'POST'}
      >
        <label htmlFor='username'>Username</label>
        <input
          type='text'
          id='username'
          name='username'
          className='text-slate-800 p-1'
        />
        <label htmlFor='password'>Password</label>
        <input
          type='password'
          id='password'
          name='password'
          className='text-slate-800 p-1'
        />
        <button type='submit' className='ring-2 py-1'>
          Login
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
