const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const db = require('./models');
const expressLayouts = require('express-ejs-layouts')

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const sessionMiddleware = session({
    secret: 'express-chating',
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: { secure: false, maxAge: null }
});

app.use(sessionMiddleware);

app.use(expressLayouts)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

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
const initSocket = require('./services/SocketReciver');
initSocket(io, sessionMiddleware, db);

db.sequelize.sync().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});