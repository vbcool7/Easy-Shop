
import Conversation from '../Models/conversationModelSchema.js';
import Message from '../Models/messageModelSchema.js';

// 1. creat conversation, if exist then fetch 
export const accessChat = async (req, res) => {
    try {
        const { userId, vendorId } = req.body;

        if (!userId || !vendorId) {
            return res.status(400).json({
                success: false,
                message: "UserId and VendorId are required"
            });
        }

        // Check if they already have a room/conversation
        let chat = await Conversation.findOne({
            participants: {
                $all: [
                    { $elemMatch: { participantId: userId, participantModel: 'User' } },
                    { $elemMatch: { participantId: vendorId, participantModel: 'Vendor' } }
                ]
            }
        });

        // Don't create here — return null if doesn't exist
        res.status(200).json({
            success: true,
            data: chat || null
        });

    } catch (err) {
        console.log("Error :", err)
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// 2. Fetch all messages from a specific chat
export const fetchMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });

    } catch (err) {
        console.log("Error :", err)
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// 3. Fetch all active chats of the vendor (for sidebar)
export const getVendorChats = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const chats = await Conversation.find({
            participants: {
                $elemMatch: { participantId: vendorId, participantModel: 'Vendor' }
            },
            lastMessage: { $exists: true, $ne: null } // only conversations with messages
        }).sort({ updatedAt: -1 });

        // Manually populate User participants
        const populatedChats = await Promise.all(chats.map(async (chat) => {
            const chatObj = chat.toObject();

            // convert Map to plain object
            chatObj.unreadCount = Object.fromEntries(chat.unreadCount);

            const populated = await Promise.all(chatObj.participants.map(async (p) => {
                const Model = (await import(`../Models/${p.participantModel === 'User' ? 'userModelSchema' : 'vendorModelSchema'}.js`)).default;
                const data = await Model.findById(p.participantId).select('name profilePhoto storeName storeLogo');
                return { ...p, details: data };
            }));

            return { ...chatObj, participants: populated };
        }));

        res.status(200).json({
            success: true,
            data: populatedChats
        });

    } catch (err) {
        console.log("Error :", err)
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// 4. reset unread count when vendor opens a chat
export const resetUnreadCount = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;

        await Conversation.findByIdAndUpdate(
            conversationId,
            { $set: { [`unreadCount.${userId}`]: 0 } },
            { timestamps: false }
        );

        res.status(200).json({
            success: true
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
}

// 5. user side
export const getUserChats = async (req, res) => {
    try {
        const { userId } = req.params;

        const chats = await Conversation.find({
            participants: {
                $elemMatch: {
                    participantId: userId,
                    participantModel: 'User',
                },
            },
            lastMessage: { $exists: true, $ne: null },
        }).sort({ updatedAt: -1 });

        const populatedChats = await Promise.all(
            chats.map(async chat => {
                const chatObj = chat.toObject();

                chatObj.unreadCount = Object.fromEntries(chat.unreadCount);

                const participants = await Promise.all(
                    chatObj.participants.map(async p => {
                        const Model = (
                            await import(
                                `../Models/${p.participantModel === 'User'
                                    ? 'userModelSchema'
                                    : 'vendorModelSchema'
                                }.js`
                            )
                        ).default;

                        const details = await Model.findById(p.participantId).select(
                            'name profilePhoto storeName storeLogo',
                        );

                        return {
                            ...p,
                            details,
                        };
                    }),
                );

                return {
                    ...chatObj,
                    participants,
                };
            }),
        );

        res.status(200).json({
            success: true,
            data: populatedChats,
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};