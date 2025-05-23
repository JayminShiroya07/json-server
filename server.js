// server.js
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

// Map of userName -> WebSocket connection
const clients = new Map();

function broadcastUserList() {
  const userList = Array.from(clients.keys());
  const message = JSON.stringify({ type: 'userList', users: userList });
  
  clients.forEach((clientWs, userName) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      try {
        clientWs.send(message);
      } catch (error) {
        console.error(`Failed to send message to client ${userName}:`, error);
      }
    }
  });
  console.log('Broadcasted user list:', userList);
}

server.on('connection', (ws) => {
  let registeredUserName = null;

  console.log(`New client connected. Total clients: ${clients.size}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'register' && typeof data.name === 'string') {
        // Register user with name
        registeredUserName = data.name;

        // If userName already exists, append a suffix to make unique
        let uniqueName = registeredUserName;
        let suffix = 1;
        while (clients.has(uniqueName)) {
          uniqueName = `${registeredUserName}-${suffix}`;
          suffix++;
        }
        registeredUserName = uniqueName;

        clients.set(registeredUserName, ws);
        console.log(`User registered: ${registeredUserName}. Total clients: ${clients.size}`);

        // Send registered confirmation with userId (userName)
        ws.send(JSON.stringify({ type: 'registered', userId: registeredUserName }));

        // Broadcast updated user list
        broadcastUserList();
      } else if (data.type === 'chatMessage') {
        console.log(`Received chatMessage from ${data.sender} to ${data.receiver}: ${data.message}`);
        // Forward chat message to receiver if connected
        const receiverWs = clients.get(data.receiver);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify(data));
          console.log(`Forwarded chatMessage to ${data.receiver}`);
        } else {
          console.log(`Receiver ${data.receiver} not connected or not open`);
        }
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  });

  ws.on('close', () => {
    if (registeredUserName) {
      clients.delete(registeredUserName);
      console.log(`User disconnected: ${registeredUserName}. Total clients: ${clients.size}`);
      broadcastUserList();
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (registeredUserName && clients.has(registeredUserName)) {
      clients.delete(registeredUserName);
      console.log(`User removed due to error: ${registeredUserName}. Total clients: ${clients.size}`);
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
