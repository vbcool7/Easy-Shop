
import { useEffect, useState, useRef } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import { HiOutlineSearch, HiOutlineArrowLeft } from "react-icons/hi";
import toast from 'react-hot-toast';

import { io } from "socket.io-client";
import API from "../../api/axiosConfig";
import useAuthStore from "../../store/useAuthStore";
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

function VendorChat() {

  const { t } = useTranslation();
  const { user } = useAuthStore();
  const vendorId = user?._id || user?.id;

  const queryClient = useQueryClient();

  const [inputMessage, setInputMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const selectedChatRef = useRef(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // 1. fetch all vendor chats on mounts
  useEffect(() => {
    if (!vendorId) return;

    const fetchChats = async () => {
      try {
        const { data } = await API.get(`/message/vendor-messages/${vendorId}`);
        setChats(data.data || []);
      } catch (err) {
        console.log("Error :", err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [vendorId]);

  // 2. connect socket on mount
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

    socketRef.current.on("receive_message", (newMsg) => {

      if (newMsg.senderId === vendorId) return;

      if (newMsg.conversationId === selectedChatRef.current?._id) {
        setMessagesList((prev) => [...prev, newMsg]);
      }

      // update last msg in sidebar
      setChats((prev) => prev.map((chat) =>
        chat._id === newMsg.conversationId
          ? { ...chat, lastMessage: { text: newMsg.text } }
          : chat
      ));
    });

    return () => socketRef.current?.disconnect();
  }, []);

  // Join socket room
  useEffect(() => {
    if (!selectedChat?._id || !socketRef.current) return;
    socketRef.current.emit("join_chat", selectedChat._id);
  }, [selectedChat]);

  // 3. When vendor selects a chat
  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);

    // reset unread count
    try {
      await API.post('/message/reset-unread', {
        conversationId: chat._id,
        userId: vendorId
      });

      // update sidebar count to 0 immediately
      setChats((prev) => prev.map((c) =>
        c._id === chat._id
          ? { ...c, unreadCount: { ...c.unreadCount, [vendorId]: 0 } }
          : c
      ));

      queryClient.invalidateQueries(['vendorUnread', vendorId]);

    } catch (err) {
      console.error("Reset unread error:", err);
    }

    // fetch msgs
    try {
      const { data } = await API.get(`/message/fetch-messages/${chat._id}`);
      setMessagesList(data.data || []);
    } catch (err) {
      console.log("Error fetching messages ", err);
    }
  };

  // 4. Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  // 5. send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedChat) return;

    // Get the user participant from conversation
    const userParticipant = selectedChat.participants.find(
      (p) => p.participantModel === 'User'
    );

    const msgData = {
      conversationId: selectedChat._id,
      senderId: vendorId,
      senderModel: "Vendor",
      receiverId: userParticipant?.details?._id || userParticipant?.participantId,
      receiverModel: "User",
      text: inputMessage
    };

    // Add to UI immediately — don't wait for socket
    setMessagesList((prev) => [...prev, {
      ...msgData,
      createdAt: new Date().toISOString()
    }]);

    socketRef.current.emit("send_message", msgData);
    setInputMessage("");
  };

  // Filter chats by search
  const filteredChats = chats.filter((chat) => {
    const userParticipant = chat.participants?.find(p => p.participantModel === 'User');
    const name = userParticipant?.details?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get user info from chat
  const getChatUser = (chat) => {
    const participant = chat.participants?.find(p => p.participantModel === 'User');
    return participant?.details || {};
  };

  return (
        <div className="h-130 w-full flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

            {/* Left Sidebar */}
            <div className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/20`}>
                <div className="p-5 border-b border-slate-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                        {t('vendorChat.chatsTitle')}
                    </h3>

                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('vendorChat.searchPlaceholder')}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-100/80 rounded-2xl text-[11px] font-bold outline-none border border-transparent focus:border-pink-300 focus:bg-white transition-all shadow-inner"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    {loading && <p className="text-center text-xs text-slate-400 p-4">{t('vendorChat.loading')}</p>}
                    {!loading && filteredChats.length === 0 && <p className="text-center text-xs text-slate-400 p-4">{t('vendorChat.noChats')}</p>}
                    
                    {filteredChats.map((chat) => {
                        const chatUser = getChatUser(chat);
                        const unread = chat.unreadCount?.[vendorId] || 0;

                        return (
                            <div key={chat._id} onClick={() => handleSelectChat(chat)} 
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-50/50 ${selectedChat?._id === chat._id ? "bg-pink-50" : "hover:bg-slate-50"}`}>
                                <div className="relative">
                                    {chatUser.profilePhoto ? (
                                        <img src={chatUser.profilePhoto} alt="" className="w-10 h-10 rounded-full border shadow-sm object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-black text-sm">
                                            {chatUser.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-black text-slate-700 truncate">{chatUser.name || t('vendorChat.defaultUser')}</p>
                                    <div className="flex justify-between items-center mt-0.5">
                                        <p className="text-[10px] truncate pr-2 text-slate-400 font-medium">{chat.lastMessage?.text || t('vendorChat.clickToChat')}</p>
                                        {unread > 0 && (
                                            <span className="flex items-center justify-center bg-pink-500 text-white text-[9px] font-black h-4 min-w-4 px-1.5 rounded-full shrink-0">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side: Chat Window */}
            <div className={`${!selectedChat ? "hidden md:flex" : "flex"} flex-1 flex-col`}>
                {selectedChat ? (
                    <>
                        <div className="bg-linear-to-br from-pink-500 to-pink-600 p-5 flex items-center gap-3 text-white">
                            <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <HiOutlineArrowLeft size={20} />
                            </button>
                            <div>
                                <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest">{getChatUser(selectedChat).name || t('vendorChat.customer')}</h3>
                                <p className="text-[9px] opacity-80 font-bold flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span> {t('vendorChat.statusOnline')}
                                </p>
                            </div>
                        </div>

                        <div className="grow overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                            {messagesList.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                    {t('vendorChat.noConversation')}
                                </div>
                            ) : (
                                messagesList.map((msg, index) => {
                                    const isMe = msg.senderId?.toString() === vendorId?.toString();
                                    return (
                                        <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                            <div className={`max-w-[75%] p-3 rounded-2xl text-[12px] font-bold shadow-sm ${isMe ? "bg-pink-500 text-white rounded-tr-none" : "bg-white text-slate-600 rounded-tl-none border border-slate-100"}`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[8px] text-slate-400 font-black mt-1 uppercase">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="p-4 border-t border-slate-50 bg-white flex items-center gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                placeholder={t('vendorChat.replyPlaceholder')}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                className="flex-1 text-[11px] font-bold p-3 bg-slate-50 rounded-xl outline-none"
                            />
                            <button onClick={sendMessage} className="bg-pink-500 text-white p-3 md:px-6 rounded-2xl shadow-lg active:scale-95 flex items-center">
                                <RiSendPlaneFill size={18} className="md:mr-2" />
                                <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">{t('vendorChat.btnSend')}</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                            <RiSendPlaneFill size={40} className="rotate-45 text-pink-200" />
                        </div>
                        <p className="text-[10px] text-pink-300 font-black uppercase tracking-[3px]">
                            {t('vendorChat.selectToStart')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VendorChat;