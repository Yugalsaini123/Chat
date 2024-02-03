// app.js

function addMessage(message) {
  const messageBox = document.getElementById('message-box');
  const newMessage = document.createElement('p');
  newMessage.textContent = message;
  messageBox.appendChild(newMessage);
}

// WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', () => {
  console.log('WebSocket connection established');
});

socket.addEventListener('message', (event) => {
  const receivedMessage = event.data;
  addMessage('Stranger: ' + receivedMessage);
});

// Add error handling for the WebSocket connection
socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});

document.getElementById('chat-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();

  if (message !== '') {
    addMessage('You: ' + message);
    messageInput.value = '';

    // Send the message to the server
    socket.send(message);
  }
});

// Handle server response (optional)
socket.addEventListener('message', (event) => {
  const serverResponse = event.data;
  console.log('Server response:', serverResponse);
});

// Handle WebSocket closure (optional)
socket.addEventListener('close', (event) => {
  if (event.wasClean) {
    console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
  } else {
    console.error('Connection abruptly closed');
  }
});
  
