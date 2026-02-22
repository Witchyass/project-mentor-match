import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Search, Video, Info, Calendar, Star, MessageCircle, Clock, ChevronLeft, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { ref, push, set, onValue, query, orderByChild, serverTimestamp, get } from 'firebase/database';
import { sendMessageNotification } from '../lib/matchService';
import { subscribeToUserSessions } from '../lib/sessionService';
import BookingModal from '../components/BookingModal';
import FeedbackModal from '../components/FeedbackModal';

const Messages = () => {
    const { user, profile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSessions, setActiveSessions] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [view, setView] = useState('list'); // 'list' or 'chat'
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (view === 'chat') scrollToBottom();
    }, [messages, view]);

    useEffect(() => {
        if (!user) return;
        const matchesRef = ref(db, 'matches');
        const unsubscribe = onValue(matchesRef, async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const matchedUserIds = [...new Set(Object.values(data)
                    .filter(m => m.users?.includes(user.uid))
                    .map(m => m.users?.find(id => id !== user.uid))
                    .filter(id => !!id))];

                if (matchedUserIds.length === 0) {
                    setMatches([]);
                    setLoading(false);
                    return;
                }

                const profiles = [];
                for (const uid of matchedUserIds) {
                    const pSnap = await get(ref(db, `users/${uid}`));
                    if (pSnap.exists()) {
                        profiles.push({
                            id: uid,
                            ...pSnap.val(),
                            avatar: pSnap.val().profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pSnap.val().name || uid}`
                        });
                    }
                }
                setMatches(profiles);
            } else setMatches([]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (matches.length > 0 && location.state?.userId) {
            const match = matches.find(m => m.id === location.state.userId);
            if (match) {
                setSelectedMatch(match);
                if (isMobile) setView('chat');
            }
        }
    }, [matches, location.state, isMobile]);

    useEffect(() => {
        if (!user || !selectedMatch) return;
        const chatId = [user.uid, selectedMatch.id].sort().join('_');
        const unsubscribe = onValue(ref(db, `chats/${chatId}`), (snapshot) => {
            if (snapshot.exists()) {
                const msgList = Object.keys(snapshot.val()).map(key => ({
                    id: key,
                    ...snapshot.val()[key],
                    timestamp: snapshot.val()[key].timestamp ? new Date(snapshot.val()[key].timestamp) : new Date()
                })).sort((a, b) => a.timestamp - b.timestamp);
                setMessages(msgList);
            } else setMessages([]);
        });
        return () => unsubscribe();
    }, [user, selectedMatch]);

    useEffect(() => {
        if (!user) return;
        return subscribeToUserSessions(user.uid, (sessions) => {
            setActiveSessions(sessions.filter(s => s.status === 'scheduled' && new Date(s.dateTime) > new Date()));
        });
    }, [user]);

    const activeSession = useMemo(() => {
        if (!selectedMatch) return null;
        return activeSessions.find(s => s.mentorId === selectedMatch.id || s.menteeId === selectedMatch.id);
    }, [activeSessions, selectedMatch]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = message.trim();
        if (!text || !selectedMatch || !user) return;
        setMessage('');
        try {
            const chatId = [user.uid, selectedMatch.id].sort().join('_');
            await set(push(ref(db, `chats/${chatId}`)), {
                text, sender: user.uid, senderName: profile?.name || 'Anonymous', timestamp: serverTimestamp()
            });
            sendMessageNotification(user, profile, selectedMatch.id, text).catch(() => { });
        } catch (err) { setMessage(text); alert("Failed to send."); }
    };

    const iceBreakers = profile?.role === 'mentee'
        ? ["How do you handle hard projects?", "What skills should I focus on?", "Could we do a resume review?"]
        : ["What are your goals this month?", "Tell me about your background.", "How can I support you?"];

    const filteredMatches = matches.filter(m => m.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ display: 'flex', height: isMobile ? 'calc(100vh - 5rem)' : 'calc(100vh - 10rem)', gap: isMobile ? 0 : '1.5rem', background: '#f8fafc', borderRadius: isMobile ? 0 : '24px', overflow: 'hidden', padding: isMobile ? 0 : '1rem' }}>

            {/* Sidebar / Match List */}
            {(!isMobile || view === 'list') && (
                <div style={{ width: isMobile ? '100%' : '320px', background: 'white', display: 'flex', flexDirection: 'column', borderRight: isMobile ? 'none' : '1px solid #f1f5f9', flexShrink: 0 }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', marginBottom: '1rem' }}>Messages</h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search matches..." style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.4rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                        {filteredMatches.map(m => (
                            <div key={m.id} onClick={() => { setSelectedMatch(m); if (isMobile) setView('chat'); }} style={{ padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: selectedMatch?.id === m.id ? '#eff6ff' : 'transparent', marginBottom: '0.25rem' }}>
                                <img src={m.avatar} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f1f5f9' }} alt="" />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name || 'User'}</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.career || 'Community Member'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Area */}
            {(!isMobile || view === 'chat') && (
                <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                    {selectedMatch ? (
                        <>
                            <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {isMobile && <ChevronLeft size={24} onClick={() => setView('list')} style={{ cursor: 'pointer', color: '#64748b' }} />}
                                    <img src={selectedMatch.avatar} style={{ width: '36px', height: '36px', borderRadius: '50%' }} alt="" />
                                    <div>
                                        <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{selectedMatch.name}</h3>
                                        <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Mentorship Active</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {activeSession ? (
                                        <button onClick={() => window.open(activeSession.meetLink, '_blank')} style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>Join Video</button>
                                    ) : (
                                        <button onClick={() => setIsBookingOpen(true)} style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', background: '#1e3a8a', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>Schedule</button>
                                    )}
                                    <button onClick={() => setIsFeedbackOpen(true)} style={{ padding: '0.5rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}><Star size={16} /></button>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {messages.map(msg => (
                                    <div key={msg.id} style={{ alignSelf: msg.sender === user?.uid ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                        <div style={{ padding: '0.75rem 1rem', borderRadius: '16px', background: msg.sender === user?.uid ? '#1e3a8a' : '#f1f5f9', color: msg.sender === user?.uid ? 'white' : '#1e293b', fontSize: '0.95rem', fontWeight: 500 }}>
                                            {msg.text}
                                        </div>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem', textAlign: msg.sender === user?.uid ? 'right' : 'left' }}>
                                            {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }} className="no-scrollbar">
                                    {iceBreakers.map((ib, i) => (
                                        <button key={i} onClick={() => setMessage(ib)} style={{ padding: '0.4rem 0.8rem', borderRadius: '100px', background: '#eff6ff', color: '#1e3a8a', border: 'none', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>{ib}</button>
                                    ))}
                                </div>
                                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message..." style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }} />
                                    <button type="submit" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1e3a8a', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={20} /></button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, pdding: '2rem', textAlign: 'center' }}>
                            <MessageCircle size={48} style={{ marginBottom: '1rem', color: '#cbd5e1' }} />
                            <h3 style={{ fontWeight: 800, color: '#1e293b' }}>Select a chat to begin</h3>
                            <p style={{ fontSize: '0.85rem' }}>Connect with your matches and start growing together.</p>
                        </div>
                    )}
                </div>
            )}

            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} mentorProfile={selectedMatch} mentorId={selectedMatch?.id} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} mentorName={selectedMatch?.name} />
        </div>
    );
};

export default Messages;
