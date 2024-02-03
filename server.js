// server.js

require("dotenv").config();
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
//const AWS = require('aws-sdk');

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

// Configure AWS SDK with your credentials
//AWS.config.update({
 // region: process.env.AWS_REGION, // Specify your AWS region
 // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//});

//const dynamoDBClient = new AWS.DynamoDB.DocumentClient();
//const tableName = process.env.DYNAMODB_TABLE_NAME;

/*const testParams = {
  TableName: tableName,
  Item: {
    id: 'test_id',
    message: 'Test message',
  },
};

dynamoDBClient.put(testParams, (err) => {
  if (err) {
    console.error('Error testing DynamoDB connection:', err);
  } else {
    console.log('Test message saved to DynamoDB');
  }
});*/

// Serve static files from the 'public' directory
const staticPath = __dirname;
app.use(express.static(staticPath));

// Route handler for serving the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const waitingClients = []; // Array to store waiting clients

// Function to find a waiting client to pair up
function findWaitingClient() {
  return waitingClients.shift();
}

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('A new client connected');

  // Check if there is a waiting client to pair up
  const waitingClient = findWaitingClient();
  if (waitingClient) {
    console.log('Pairing clients...');
    // Pair up the two clients
    waitingClient.pairWith = ws;
    ws.pairWith = waitingClient;
    // Remove the waiting client from waitingClients array
    const index = waitingClients.indexOf(waitingClient);
    waitingClients.splice(index, 1);
  } else {
    // If no waiting client, add the current client to waitingClients array
    waitingClients.push(ws);
  }

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    console.log('Received message:', message);

    // Save the message to DynamoDB
    const params = {
      TableName: tableName,
      Item: {
        id: uuidv4(),
        message: message.toString(),
      },
    };

    //dynamoDBClient.put(params, (err) => {
      //if (err) {
       // console.error('Error saving message to DynamoDB:', err);
     // } else {
       // console.log('Message saved to DynamoDB');
     // }
    //});

    // Send the message to the paired client (if there is one)
    if (ws.pairWith) {
      ws.pairWith.send(message);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('A client disconnected');

    // If the client was paired with another client, notify the other client
    if (ws.pairWith) {
      ws.pairWith.send('The other client has disconnected.');
      ws.pairWith.pairWith = null;
    } else {
      // If the client was waiting, remove it from the waitingClients array
      const index = waitingClients.indexOf(ws);
      if (index !== -1) {
        waitingClients.splice(index, 1);
      }
    }
  });
});

// Create an HTTP server and integrate it with the WebSocket server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

