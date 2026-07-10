
import express from 'express';
import { 
    accessChat,
    fetchMessages,
    getVendorChats, 
    resetUnreadCount,
    getUserChats
} from '../Controllers/messageController.js';

const router = express.Router();

router.post('/access', accessChat);
router.get('/fetch-messages/:conversationId', fetchMessages);
router.get('/vendor-messages/:vendorId', getVendorChats);
router.post('/reset-unread', resetUnreadCount);
router. Get('/user-messages/:userId', getUserChats);

export default router;