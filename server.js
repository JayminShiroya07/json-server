// server.js
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });
const clients = new Map(); // Stores clientId -> WebSocket connection

function broadcastUserList() {
  const userList = Array.from(clients.keys());
  const message = JSON.stringify({ type: 'userList', users: userList });
  
  clients.forEach((clientWs, clientId) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      try {
        clientWs.send(message);
      } catch (error) {
        console.error(`Failed to send message to client ${clientId}:`, error);
      }
    }
  });
  console.log('Broadcasted user list:', userList);
}

server.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  console.log(`Client ${clientId} connected. Total clients: ${clients.size}`);

  // Send unique ID to the newly connected client
  try {
    ws.send(JSON.stringify({ type: 'yourId', id: clientId }));
  } catch (error) {
    console.error(`Failed to send ID to client ${clientId}:`, error);
  }

  // Broadcast updated user list
  broadcastUserList();

  ws.on('message', (message) => {
    // This application doesn't process incoming messages from clients,
    // but you could handle them here if needed.
    // console.log(`Received message from ${clientId}: ${message}`);
    // For example, to echo message back:
    // ws.send(`Server received from ${clientId}: ${message}`);
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected. Total clients: ${clients.size}`);
    // Broadcast updated user list
    broadcastUserList();
  });

  ws.on('error', (error) => {
    console.error(`Error on client ${clientId}:`, error);
    // Ensure client is removed on error as well, if 'close' event doesn't fire
    if (clients.has(clientId)) {
        clients.delete(clientId);
        console.log(`Client ${clientId} removed due to error. Total clients: ${clients.size}`);
        broadcastUserList();
    }
  });
});

server.on('listening', () => {
  console.log(`WebSocket server started on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('WebSocket server error:', error);
});
