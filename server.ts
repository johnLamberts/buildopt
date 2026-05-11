// server.ts
import * as net from 'net';
import { Buffer } from 'node:buffer';
import { MessageFramer } from './opt/protocol.ts';
import { type ClientRequest, type ServerResponse } from './interface/types.ts'; // Your types file

const PORT = 3000;

const server = net.createServer((socket) => {
  console.log(`\n[Server] Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
  
  // Each socket connection gets its own buffer accumulator
  let incomingBuffer: any = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    // 1. Accumulate incoming bytes
    incomingBuffer = Buffer.concat([incomingBuffer as Uint8Array, chunk as Uint8Array]);

    // 2. Decode all complete messages currently in the buffer
    let decoding = true;
    while (decoding) {
      const { message, remaining } = MessageFramer.decode(incomingBuffer);
      incomingBuffer = remaining;

      if (message) {
        handleClientRequest(socket, message);
      } else {
        decoding = false; // Wait for more network packets
      }
    }
  });

  socket.on('end', () => console.log('\n[Server] Client disconnected.'));
  socket.on('error', (err) => console.error('\n[Server] Socket error:', err.message));
});

// Route the request and send a response back
const handleClientRequest = (socket: net.Socket, rawMessage: string) => {
  try {
    const request: ClientRequest = JSON.parse(rawMessage);
    console.log(`[Server] Received ${request.action} for ${request.origin}`);

    // Mocking database logic based on your types
    let responseData = "";
    
    if (request.action === "GET" && request.origin === "users") {
        responseData = JSON.stringify([
            { id: 1, firstname: "John", lastname: "Doe", created_at: new Date().toISOString() },
            { id: 2, firstname: "Jane", lastname: "Smith", created_at: new Date().toISOString() }
        ]);
    } else if (request.action === "POST") {
        responseData = JSON.stringify({ 
            info: "Successfully created record", 
            insertedData: request.body 
        });
    } else {
        responseData = JSON.stringify({ info: "No matching route found." });
    }

    // Construct the strictly typed response
    const response: ServerResponse = {
      status: "OKAY",
      request: request,
      data: responseData
    };

    // Frame the response and send it as bytes
    const bufferToSend = MessageFramer.encode(JSON.stringify(response));
    socket.write(bufferToSend);

  } catch (error) {
    console.error('[Server] Failed to parse request. Invalid JSON.');
  }
};

server.listen(PORT, () => {
  console.log(`[Server] Listening for TCP connections on port ${PORT}...`);
});
