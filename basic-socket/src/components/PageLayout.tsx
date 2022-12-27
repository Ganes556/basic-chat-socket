import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Socket } from 'socket.io-client';

function PageLayout() {
  const [socket, setSocket]: [Socket | undefined, Function] = useState();
  const logged = useRef<boolean>();
  const navigate = useNavigate();
  let location = useLocation();

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        navigate('/admin-chat');
        logged.current = true;
      });
      socket.on('disconnect', () => {
        logged.current = false;
        navigate('/login');
      });
      socket.on('connect_error', (err) => {
        alert(err.message);
        logged.current = false;
        navigate('/login');
      });
    }
    return () => {
      socket?.off('connect');
      socket?.off('disconnect');
      socket?.off('connect_error');
    };
  }, [socket]);

  useEffect(() => {
    if (location.pathname === '/admin-chat') {
      if (!logged.current) navigate('/login');
    }
  }, [location]);

  return (
    <>
      <header className='container flex fixed py-5 px-3 bg-blue-700 max-w-full justify-center'>
        <ul className='container justify-center flex max-w-2xl gap-x-5 text-slate-100'>
          <li className='text-xl'>
            <Link to={'/'}>Home</Link>
          </li>
          <li className='text-xl'>
            <Link to={'/login'}>Login</Link>
          </li>
          {logged.current && (
            <li className='text-xl'>
              <button
                onClick={() => {
                  logged.current = false;
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </header>
      <main className='w-screen p-2 min-h-screen max-h-full flex bg-slate-500'>
        <Outlet context={[socket, setSocket]} />
      </main>
    </>
  );
}

export default PageLayout;
