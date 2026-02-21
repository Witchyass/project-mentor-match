import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AIChatbot = () => {
    const { user, profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your MentorMatch AI assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const getResponse = (text) => {
        const input = text.toLowerCase();
        const role = profile?.role || 'user';
        const name = profile?.name?.split(' ')[0] || '';

        // Greetings
        if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
            const greetings = [
                `Hello ${name}! Great to see you. How can I assist you today?`,
                `Hi there! Hope you're having a productive day. What can I help you with?`,
                `Hey! I'm here to help you get the most out of MentorMatch.`
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // Matching
        if (input.includes('match') || input.includes('find') || input.includes('swipe')) {
            if (role === 'mentor') {
                return "As a mentor, you'll receive match requests from mentees on your 'My Mentees' page. You can accept or decline requests, and manage all your active mentees from there!";
            }
            return "To find a mentor, go to the 'Discover' page. You can filter by skills and swipe right on mentors you'd like to work with. Once they accept, you can start chatting!";
        }

        // Booking
        if (input.includes('book') || input.includes('session') || input.includes('calendar') || input.includes('meeting')) {
            return "Booking is easy! Open a chat with one of your matches and click the Calendar icon. You can propose a time and once it's confirmed, it will show up on your Dashboard.";
        }

        // Profile
        if (input.includes('profile') || input.includes('update') || input.includes('skill') || input.includes('bio')) {
            return "Your profile is your digital business card here. Head to the 'Profile' page and click the Edit button to update your skills, bio, or career path.";
        }

        // Resources
        if (input.includes('resource') || input.includes('article') || input.includes('learn')) {
            return "We just added a new 'Resources' page! It's packed with expert articles on career growth and mentorship. Check it out in the sidebar or navbar.";
        }

        // Help / Service
        if (input.includes('help') || input.includes('support') || input.includes('problem')) {
            return "I can help with general navigation! If you have a technical issue or need account support, please contact our services at support@mentormatch.io.";
        }

        // Default Fallback
        return "That's an interesting question! I'm still learning some parts of the platform. For specific inquiries, feel free to contact our services or check the 'Help' page.";
    };

    const handleSend = (e, customText = null) => {
        if (e) e.preventDefault();
        const textToSend = customText || input;
        if (!textToSend.trim()) return;

        const userMsg = { text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate "Thinking"
        setTimeout(() => {
            const response = getResponse(textToSend);
            setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="glass"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 2000,
                    background: 'var(--primary)',
                    color: 'white',
                    boxShadow: '0 8px 32px var(--primary-glow)'
                }}
            >
                <Bot size={32} />
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid white' }}
                />
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="glass"
                        style={{
                            position: 'fixed',
                            bottom: '6rem',
                            right: '2rem',
                            width: '400px',
                            maxHeight: '600px',
                            height: '80vh',
                            borderRadius: 'var(--radius-xl)',
                            zIndex: 2000,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.25rem', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', display: 'block' }}>Mentor AI</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online & helper-ready</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--background)' }}
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        padding: '1rem',
                                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.sender === 'user' ? 'var(--primary)' : 'var(--card-bg)',
                                        color: msg.sender === 'user' ? 'white' : 'var(--text)',
                                        fontSize: '0.9rem',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                        lineHeight: 1.5,
                                        border: msg.sender === 'user' ? 'none' : '1px solid var(--border)'
                                    }}
                                >
                                    {msg.text}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: 'var(--card-bg)', padding: '0.75rem 1.25rem', borderRadius: '20px 20px 20px 4px', display: 'flex', gap: '4px', border: '1px solid var(--border)' }}>
                                    <Loader2 className="animate-spin" size={16} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Thinking...</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Suggestions */}
                        <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
                            {[
                                "👋 Hello",
                                "🔍 How to match?",
                                "📅 Booking tips",
                                "👤 Profile help"
                            ].map(q => (
                                <button
                                    key={q}
                                    onClick={() => handleSend(null, q)}
                                    className="glass"
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        border: '1px solid var(--primary)',
                                        color: 'var(--primary)',
                                        fontWeight: 600,
                                        transition: 'var(--transition)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'var(--primary)';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = 'var(--primary)';
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} style={{ padding: '1.25rem', background: 'var(--background)', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                            <input
                                className="glass"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Write a message..."
                                style={{
                                    flex: 1,
                                    padding: '0.875rem 1.25rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.9rem',
                                    color: 'inherit',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ padding: '0.875rem', borderRadius: 'var(--radius-lg)', width: '48px', height: '48px', justifyContent: 'center' }}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;
