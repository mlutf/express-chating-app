const { Message, User, Sequelize } = require('../models');
const Op = Sequelize.Op;

exports.getChatPage = async (req, res) => {
    try {
        const currentUserId = req.session.userId;

        const allUsers = await User.findAll({
            where: {
                id: { [Op.ne]: currentUserId }
            },
            attributes: ['id', 'username']
        });

        res.render('chat', {
            layout: 'layouts/layout',
            currentUserId: currentUserId,
            allUsers: allUsers,
        });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.redirect('/login');
    }
};

exports.getMessages = async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        const receiverId = req.query.receiverId;

        let messages = [];
        if (receiverId && receiverId !== 'null') {
            messages = await Message.findAll({
                where: {
                    [Op.or]: [
                        { userId: currentUserId, receiverId: receiverId },
                        { userId: receiverId, receiverId: currentUserId }
                    ]
                },
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['username']
                }],
                order: [['createdAt', 'ASC']]
            });
        } else {
            messages = await Message.findAll({
                where: {
                    receiverId: null
                },
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['username']
                }],
                order: [['createdAt', 'ASC']]
            });
        }

        res.json({
            messages: messages.map(msg => ({
                id: msg.id,
                senderId: msg.userId,
                username: msg.sender.username,
                message: msg.message,
                timestamp: msg.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
