import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@clerk/clerk-react';

const Chatbot = () => {
    const { getToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = await getToken();
            
            const response = await axios.post(`${apiUrl}/chat`, {
                message: userMessage.text,
                history: messages
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const botMessage = { text: response.data.response, sender: 'bot' };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat API Fetch Error:", error);
            if (error.response) {
                // The request was made and the server responded with a status code outside of the 2xx range
                console.error("Response Status:", error.response.status);
                console.error("Response Text/Data:", error.response.data);
            } else if (error.request) {
                // The request was made but no response was received (network or CORS issue)
                console.error("No response received. Request:", error.request);
                console.error("This is likely a Network or CORS error.");
            } else {
                // Something happened in setting up the request
                console.error("Error setting up request:", error.message);
            }
            setMessages((prev) => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300">
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center rounded-t-2xl shadow-md">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={24} className="text-indigo-100" />
                            <h3 className="font-semibold text-lg tracking-wide">Ride Assistant</h3>
                        </div>
                        <button onClick={toggleChat} className="text-indigo-100 hover:text-white hover:bg-indigo-500 p-1 rounded-full transition-colors focus:outline-none">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-4 text-sm bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                👋 Hi! I'm your Campus RideShare assistant. How can I help you today?
                            </div>
                        )}
                        {messages.map((msg, idx) => {
                            // Extract JSON-escaped strings if present
                            let displayText = msg.text;
                            try {
                                if (typeof displayText === 'string' && displayText.trim().startsWith('"') && displayText.trim().endsWith('"')) {
                                    displayText = JSON.parse(displayText);
                                }
                            } catch (e) {
                                // Ignore if not valid JSON
                            }

                            return (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                                        {msg.sender === 'bot' ? (
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                                                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                                    strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                                                    a: ({node, ...props}) => <a className="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                                    code: ({node, inline, ...props}) => inline 
                                                        ? <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                                                        : <div className="bg-gray-800 text-gray-100 p-2 rounded-lg text-xs overflow-x-auto my-2 font-mono"><code {...props} /></div>
                                                }}
                                            >
                                                {displayText}
                                            </ReactMarkdown>
                                        ) : (
                                            <p className="whitespace-pre-wrap leading-relaxed">{displayText}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[75%] p-3 rounded-2xl text-sm bg-white text-gray-800 border border-gray-100 rounded-tl-sm flex items-center gap-2 shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                                    Bot is typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-indigo-600 text-white p-2 text-center rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0 flex items-center justify-center w-10 h-10 focus:outline-none"
                            >
                                <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <button
                    onClick={toggleChat}
                    className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-300 focus:outline-none"
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
};

export default Chatbot;
