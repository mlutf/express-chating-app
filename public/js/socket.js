const socket = io();
const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatUsername = document.getElementById('chat-username');
let currentUserId = window.chatConfig.currentUserId;
let receiverId = window.chatConfig.receiverId;

async function loadMessages(userId) {
    try {
        const response = await fetch(`/api/messages?receiverId=${userId || ''}`);
        const data = await response.json();
        
        chatArea.innerHTML = '';
        
        if (data.messages.length === 0) {
            chatArea.innerHTML = '<div class="text-center text-muted mt-5"><p>No messages yet. Start the conversation!</p></div>';
        } else {
            let lastDate = null;
            data.messages.forEach(msg => {
            const messageDate = new Date(msg.timestamp).toDateString();
            if (messageDate !== lastDate) {
                lastDate = messageDate;
                renderDateSeparator(
                    new Date(msg.timestamp).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    })
                );
            }

            renderMessage(msg);
        });

        }
        
        scrollToBottom();
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function renderMessage(msg) {
    const isSentByMe = msg.senderId == currentUserId;
    const messageClass = isSentByMe ? 'msg-enviada float-end' : 'msg-recebida float-start';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${messageClass} position-relative p-3 m-2 rounded-3`;
    
    const timestamp = new Date(msg.timestamp).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        ${msg.message}
        <br>
        <small class="float-end text-muted">${timestamp}</small>
    `;
    
    chatArea.appendChild(messageDiv);
    
    const clearfix = document.createElement('div');
    clearfix.className = 'clearfix';
    chatArea.appendChild(clearfix);
}

function renderDateSeparator(date) {
    const separator = document.createElement('div');
    separator.className = 'text-center my-3';

    separator.innerHTML = `
        <span class="badge bg-light text-dark px-3 py-2">
            ${date}
        </span>
    `;

    chatArea.appendChild(separator);
}

function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat message', { message, receiverId });
        messageInput.value = '';
    }
}

function setActiveUser(userId) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.userId == userId) {
            item.classList.add('active');
        }
    });
}

function switchToChat(userId, username) {
    receiverId = userId;
    
    if (userId) {
        localStorage.setItem('currentReceiverId', userId);
        localStorage.setItem('currentReceiverUsername', username);
    } else {
        localStorage.removeItem('currentReceiverId');
        localStorage.removeItem('currentReceiverUsername');
    }
    
    chatUsername.textContent = username || 'Select a chat';
    
    window.chatConfig.receiverId = receiverId;
    
    setActiveUser(userId);
    
    loadMessages(userId);
}

function restoreLastChat() {
    const savedReceiverId = localStorage.getItem('currentReceiverId');
    const savedUsername = localStorage.getItem('currentReceiverUsername');
    
    if (savedReceiverId && savedUsername) {
        switchToChat(savedReceiverId, savedUsername);
    }
}

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener('click', function(e) {
    const userItem = e.target.closest('.user-item');
    if (userItem) {
        e.preventDefault();
        
        const userId = userItem.dataset.userId;
        const username = userItem.querySelector('.fw-bolder').textContent;
        
        switchToChat(userId, username);
    }
});

socket.on('chat message', (msg) => {
    const isPublicMessage = !msg.receiverId;
    const isPrivateMessageForCurrentUser = 
        (msg.receiverId == currentUserId && msg.senderId == receiverId) || 
        (msg.senderId == currentUserId && msg.receiverId == receiverId);

    if ((isPublicMessage && !receiverId) || isPrivateMessageForCurrentUser) {
        renderMessage(msg);
        scrollToBottom();
    }
});

restoreLastChat();