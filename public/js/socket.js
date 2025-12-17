const socket = io();
const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const { currentUserId, receiverId } = window.chatConfig;

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

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

socket.on('chat message', (msg) => {
    const isPublicMessage = !msg.receiverId;
    const isPrivateMessageForCurrentUser = 
        (msg.receiverId == currentUserId && msg.senderId == receiverId) || 
        (msg.senderId == currentUserId && msg.receiverId == receiverId);

    if ((isPublicMessage && !receiverId) || isPrivateMessageForCurrentUser) {
        const isSentByMe = msg.senderId == currentUserId;
        const messageClass = isSentByMe ? 'msg-enviada float-end' : 'msg-recebida float-start';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${messageClass} position-relative p-3 m-2 rounded-3 shadow-sm`;
        messageDiv.style.maxWidth = '70%';
        
        const timestamp = new Date(msg.timestamp).toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            ${msg.message}
            <br>
            <small class="float-end text-muted">
                ${timestamp} 
                <i class="mdi mdi-check-all text-primary"></i>
            </small>
        `;
        
        chatArea.appendChild(messageDiv);
        
        const clearfix = document.createElement('div');
        clearfix.className = 'clearfix';
        chatArea.appendChild(clearfix);
        
        scrollToBottom();
    }
});

scrollToBottom();