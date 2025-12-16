const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const db = require('./models');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const sessionMiddleware = session({
    secret: 'your_secret_key', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
});

app.use(sessionMiddleware);
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);
const chatRoutes = require('./routes/chat');
app.use('/', chatRoutes);


app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/chat');
    } else {
        res.redirect('/login');
    }
});

// Socket.IO handling
io.on('connection', (socket) => {
    console.log('a user connected');

    // Get userId from session
    const userId = socket.request.session.userId;
    let username = 'Guest'; // Default username

    if (userId) {
        db.User.findByPk(userId).then(user => {
            if (user) {
                username = user.username;
                console.log(`User ${username} (${userId}) connected`);
            }
        });
    }

    socket.on('chat message', async (msg) => {
        if (userId && msg) {
            try {
                const message = await db.Message.create({
                    userId: userId,
                    message: msg
                });
                io.emit('chat message', { username: username, message: msg, timestamp: message.createdAt });
            } catch (error) {
                console.error('Error saving message:', error);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

db.sequelize.sync().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});