const { Message, User, Sequelize } = require('../models');
const Op = Sequelize.Op;

exports.getChatPage = async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        const receiverId = req.params.receiverId;

        const allUsers = await User.findAll({
            where: {
                id: { [Op.ne]: currentUserId }
            },
            attributes: ['id', 'username']
        });

        let messages = [];
        if (receiverId) {
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

        res.render('chat', {
            layout: 'layouts/layout',
            currentUserId: currentUserId,
            allUsers: allUsers,
            receiverId: receiverId,
            messages: messages.map(msg => ({
                id: msg.id,
                senderId: msg.userId,
                username: msg.sender.username,
                message: msg.message,
                timestamp: msg.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.redirect('/login');
    }
};