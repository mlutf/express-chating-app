const { Message, User } = require('../models');

exports.getChatPage = async (req, res) => {
    try {
        const messages = await Message.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['username']
            }],
            order: [['createdAt', 'ASC']]
        });
        res.render('chat', {
            currentUserId: req.session.userId,
            messages: messages.map(msg => ({
                username: msg.user.username,
                message: msg.message,
                timestamp: msg.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.redirect('/login'); // Redirect to login on error
    }
};