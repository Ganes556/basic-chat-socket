type SocketContext = {
  socketAdmin: Socket | undefined
  setSocketAdmin: (socket: Socket) => Socket
  token: string | undefined
}
