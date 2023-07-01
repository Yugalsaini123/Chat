// app.js

// Function to add a new chat message to the message box
function addMessage(message) {
    const messageBox = document.getElementById('message-box');
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    messageBox.appendChild(newMessage);
  }
  
  // Event handler for submitting the chat form
  document.getElementById('chat-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
  
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim(); // Get the message and remove leading/trailing whitespace
  
    if (message !== '') {
      addMessage('You: ' + message); // Display the user's message in the message box
      messageInput.value = ''; // Clear the input field
  
      // Send the message to the server or perform any desired action here
      // For a basic example, we will just log the message to the console
      console.log('New message:', message);
    }
  });
  
  // Example of receiving a message from the server or another user
  // For demonstration purposes, we simulate a received message after 2 seconds
  setTimeout(function () {
    const receivedMessage = 'Hello! This is a sample received message.';
    addMessage('Stranger: ' + receivedMessage);
  }, 2000);
  