// client.ts
import * as net from 'net';
import { MessageFramer } from './protocol.ts';
import { type ClientRequest } from '../interface/types.ts'; // Assuming your types are in here

const PORT = 3000;
const SERVER = '127.0.0.1';

let activeSocket: net.Socket | null = null;
let incomingBuffer: Buffer = Buffer.alloc(0); // Our chunk accumulator

export const isConnected = () => activeSocket !== null && !activeSocket.destroyed;

export const connect = () => {
  if (isConnected()) return console.log('Already connected');

  console.log('Initializing connection to server...');
  
  activeSocket = net.createConnection(PORT, SERVER, () => {
    console.log(`Connected to server ${SERVER}:${PORT}`);
  });

  // The critical change: handling streams safely
  activeSocket.on("data", (chunk: Buffer) => {
    // 1. Add new bytes to our accumulator
    incomingBuffer = Buffer.concat([incomingBuffer, chunk]);

    // 2. Process all complete messages currently in the buffer
    let decoding = true;
    while (decoding) {
      const { message, remaining } = MessageFramer.decode(incomingBuffer);
      incomingBuffer = remaining; // Update our buffer

      if (message) {
        handleServerResponse(message);
      } else {
        decoding = false; // Need more data, exit loop
      }
    }
  });

  activeSocket.on("close", () => {
    console.log("Connection closed. Retrying in 5s...");
    activeSocket = null;
    incomingBuffer = Buffer.alloc(0); // Clear buffer on disconnect
    setTimeout(connect, 5000); 
  });

  activeSocket.on("error", (err) => {
    console.log('Connection error: ', err.message);
  });
}

const handleServerResponse = (rawMessage: string) => {
  try {
    const response = JSON.parse(rawMessage);
    const { status, message, data } = response;
    console.log(`\n[Server]: ${message}`);
    if (data) console.table(data);
  } catch (error) {
    console.error("Failed to parse incoming message:", rawMessage);
  }
}

export const send = (request: ClientRequest) => {
  if (!activeSocket) {
    console.log('You are not connected to the server');
    return;
  }

  const jsonString = JSON.stringify(request);
  const bufferToSend = MessageFramer.encode(jsonString);
  
  // Now we write raw, safely framed bytes to the TCP socket
  activeSocket.write(bufferToSend);
}
