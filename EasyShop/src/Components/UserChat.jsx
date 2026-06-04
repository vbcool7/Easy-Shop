
import { useEffect, useState } from "react";
import { useRef } from "react";
import { io } from "socket.io-client";
import { HiX } from "react-icons/hi";
import { RiSendPlaneFill } from "react-icons/ri";
import toast from "react-hot-toast";
import API from '../api/axiosConfig.js';
import useAuthStore from "../store/useAuthStore";
import { useTranslation } from 'react-i18next';

function UserChat({ isOpen, setIsOpen, vendorId }) {

    const { t } = useTranslation();
    const { user } = useAuthStore();
    const userId = user?._id || user?.id;

    const [inputMessage, setInputMessage] = useState("");
    const [messagesList, setMessagesList] = useState([]);
    const [conversationId, setConversationId] = useState(null);

    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    // 1. Connect socket and access chat when modal opens
    useEffect(() => {
        if (!isOpen || !userId || !vendorId) return;

        console.log("initChat running...");

        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

        const initChat = async () => {
            try {
                const { data } = await API.post("/message/access", {
                    userId: userId,
                    vendorId
                });
                console.log("accessChat response:", data);

                const convId = data.data._id;
                setConversationId(convId);
                socketRef.current.emit("join_chat", convId);

                const msgRes = await API.get(`/message/fetch-messages/${convId}`);
                setMessagesList(msgRes.data.data || []);

            } catch (err) {
                console.error("Chat init error:", err);
                toast.error("Something went wrong");
            }
        };

        initChat();

        socketRef.current.on("receive_message", (newMsg) => {
            if (newMsg.senderId?.toString() === userId?.toString()) return;
            setMessagesList((prev) => [...prev, newMsg]);
        });

        return () => {
            socketRef.current?.disconnect();
        };

    }, [isOpen, vendorId, userId]); // all three in deps

    // 2. Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messagesList]);

    // 3. Send message
    const sendMessage = async () => {
        if (!inputMessage.trim() || !conversationId) return;

        const msgData = {
            conversationId,
            senderId: userId,
            senderModel: "User",
            receiverId: vendorId,
            receiverModel: "Vendor",
            text: inputMessage
        };

        setMessagesList((prev) => [...prev, {
            ...msgData,
            createdAt: new Date().toISOString()
        }]);

        socketRef.current.emit("send_message", msgData);
        setInputMessage("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 z-9999 w-72 md:w-80 flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">

            {/* Header */}
            <div className="bg-pink-500 p-4 flex justify-between items-center text-white">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest">
                        {t('userChat.title')}
                    </h3>
                    <p className="text-[9px] opacity-80 font-bold">
                        {t('userChat.online')}
                        </p>
                </div>
                <button
                    onClick={() =>
                        setIsOpen(false)}
                    className="hover:rotate-90 transition-all cursor-pointer">
                    <HiX size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {messagesList.map((msg, index) => {
                    const isMe = msg.senderId?.toString() === userId?.toString();
                    return (
                        <div
                            key={index}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-bold 
                                ${isMe
                                    ? "bg-pink-500 text-white rounded-tr-none"
                                    : "bg-white text-slate-600 border border-slate-100 rounded-tl-none"
                                }`}>
                                {msg.text}
                            </div>

                            <span className="text-[8px] text-slate-400 font-black mt-1 uppercase">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-50 flex gap-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={t('userChat.placeholder')}
                    className="flex-1 text-[11px] font-bold p-3 bg-slate-50 rounded-xl outline-none focus:ring-1 focus:ring-pink-500/30"
                />
                <button
                    onClick={sendMessage}
                    className="bg-pink-500 text-white p-3 rounded-xl shadow-lg shadow-pink-100 active:scale-90 transition-all">
                    <RiSendPlaneFill size={16} />
                </button>
            </div>
        </div>
    );
};

export default UserChat;