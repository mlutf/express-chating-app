const bcrypt = require('bcryptjs');
const { User } = require('../models');

exports.getRegister = (req, res) => {
    res.render('auth/register', { 
        layout: false,
        error: req.session.error
     });
    delete req.session.error;
};

exports.postRegister = async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.redirect('/login');
    } catch (error) {
        req.session.error = 'Registration failed. Username might already be taken.';
        res.redirect('/register');
    }
};

exports.getLogin = (req, res) => {
    res.render('auth/login', { 
        layout: false,
        error: req.session.error 
    });
    delete req.session.error;
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            res.redirect('/chat');
        } else {
            req.session.error = 'Invalid username or password';
            res.redirect('/login');
        }
    } catch (error) {
        req.session.error = 'Login failed. Please try again.';
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
};
