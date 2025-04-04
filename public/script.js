import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

if (typeof io === 'undefined') {
    console.error('Socket.IO não foi carregado corretamente!');
    alert('Erro crítico: Aplicação não pode carregar. Recarregue a página.');
}

// Conexão Socket.IO - agora garantidamente definida
const socket = io('http://localhost:3000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket']
});


const usernameModal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const confirmUsernameBtn = document.getElementById('confirm-username');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages-container');

// Show username modal on load
usernameModal.style.display = 'flex';

let username = localStorage.getItem('username') || null;

if (username) {
    // If username is stored in local storage, set it and hide modal
    document.querySelector('.user-info .username').textContent = username;
    usernameModal.style.display = 'none';
}

// Confirm username
confirmUsernameBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name) {
        localStorage.setItem('username', name); // Store username in local storage
        socket.emit('set username', { username: name });

        username = name;
        usernameModal.style.display = 'none';
        document.querySelector('.user-info .username').textContent = name;
    }
});

// Also allow Enter key to confirm username
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        confirmUsernameBtn.click();
    }
});

// Send message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();

    if (message && username) {
        // Emit message to server
        socket.emit('chat message', {
            nome: username,
            mensagem: message
        });

        // Add message to UI (outgoing)
        addMessage(username, message, true);

        // Clear input
        messageInput.value = '';
    }
});

// Receive message
socket.on('chat message', (data) => {
    if (data.user !== username) {
        addMessage(data.user, data.text.mensagem, false);
    }
});

// Function to add message to UI
function addMessage(sender, message, isOutgoing) {
    // Remove welcome message if it exists
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isOutgoing ? 'message-out' : 'message-in');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageElement.innerHTML = `
      ${!isOutgoing ? `<div class="message-sender">${sender}</div>` : ''}
      <div class="message-text">${message}</div>
      <div class="message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Allow Enter key to send message (but allow Shift+Enter for new line)
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        messageForm.dispatchEvent(new Event('submit'));
    }
});