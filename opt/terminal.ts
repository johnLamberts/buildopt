// terminal.ts
import * as readline from 'readline';
import { connect, send } from './client.ts';
import {type  ClientRequest } from '../interface/types.ts';

// Setup the interactive prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'TCP-CLI> '
});

console.log("Starting Terminal Client...");

// Connect to the server using the client logic we built earlier
connect();

// Give the socket a tiny bit of time to connect before showing the prompt
setTimeout(() => {
    console.log("\nCommands available: 'get users', 'get products', 'post user', 'exit'");
    rl.prompt();
}, 200);

rl.on('line', (line) => {
  const input = line.trim().toLowerCase();

  switch (input) {
    case 'get users':
      send({ action: 'GET', origin: 'users' });
      break;

    case 'get products':
      send({ action: 'GET', origin: 'products' });
      break;

    case 'post user':
      const newReq: ClientRequest = { 
          action: 'POST', 
          origin: 'users', 
          body: { type: 'users', firstname: 'Alice', lastname: 'Wonderland' } 
      };
      send(newReq);
      break;

    case 'exit':
    case 'quit':
      console.log("Exiting...");
      process.exit(0);

    default:
      if (input !== '') {
          console.log(`Unknown command: '${input}'`);
      }
      break;
  }
  
  // Re-trigger the prompt slightly after the network request fires
  setTimeout(() => rl.prompt(), 100);
});
