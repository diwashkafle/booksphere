"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { chatWithLibrarian } from "@/app/actions/ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    role: "user" | "model";
    parts: string;
}

export default function AILibrarian() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        const newMessages: Message[] = [...messages, { role: "user", parts: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        const result = await chatWithLibrarian(userMessage, messages);

        if (result.error) {
            setMessages([...newMessages, { role: "model", parts: `❌ ${result.error}` }]);
        } else if (result.text) {
            setMessages([...newMessages, { role: "model", parts: result.text }]);
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110",
                    isOpen ? "bg-gray-100 text-gray-600 rotate-90" : "bg-primary text-white"
                )}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-ping" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold">Booksie</h3>
                                <p className="text-xs text-blue-100">AI Librarian</p>
                            </div>
                        </div>
                        <div className="bg-white/10 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                            <Sparkles size={10} />
                            AI Powered
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
                    >
                        {messages.length === 0 && (
                            <div className="text-center py-8 space-y-3">
                                <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto">
                                    <Bot size={24} />
                                </div>
                                <p className="text-sm text-text-secondary px-6">
                                    "Hi! I'm Booksie. I can suggest books from our library based on your mood or interests. What are you looking for?"
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {["Mystery", "Tech books", "Sci-fi"].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setInput(`Suggest me some ${tag}`)}
                                            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:border-primary hover:text-primary transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-start gap-2",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    msg.role === "user" ? "bg-secondary text-white" : "bg-primary text-white"
                                )}>
                                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm max-w-[80%] shadow-sm",
                                    msg.role === "user"
                                        ? "bg-primary text-white rounded-tr-none"
                                        : "bg-white text-text-primary rounded-tl-none border border-gray-100"
                                )}>
                                    {msg.parts}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask about a book..."
                                className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2 text-sm text-text-primary"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="bg-primary text-white p-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
