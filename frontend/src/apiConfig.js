import socketIOClient from 'socket.io-client';

export const SERVER_URL = 'http://localhost:5000'
export const SOCKET = socketIOClient(SERVER_URL);