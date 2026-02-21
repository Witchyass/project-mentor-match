import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Search, Video, Info, Calendar, Star, MessageCircle, Clock } from 'lucide-react';
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
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch Confirmed Matches
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

                // Fetch profiles for matched users
                const profiles = [];
                for (const uid of matchedUserIds) {
                    const profileRef = ref(db, `users/${uid}`);
                    try {
                        const pSnap = await get(profileRef);
                        if (pSnap.exists()) {
                            profiles.push({
                                id: uid,
                                ...pSnap.val(),
                                avatar: pSnap.val().profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pSnap.val().name || uid}`
                            });
                        }
                    } catch (err) {
                        console.error(`Error fetching profile for ${uid}:`, err);
                    }
                }
                setMatches(profiles);
            } else {
                setMatches([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("❌ Error fetching matches:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    // Handle initial selection from navigation state
    useEffect(() => {
        if (matches.length > 0 && location.state?.userId) {
            const matchToSelect = matches.find(m => m.id === location.state.userId);
            if (matchToSelect) {
                setSelectedMatch(matchToSelect);
            }
        }
    }, [matches, location.state]);

    // Fetch Messages for Selected Match
    useEffect(() => {
        if (!user || !selectedMatch) {
            setMessages([]);
            return;
        }

        const chatId = [user.uid, selectedMatch.id].sort().join('_');
        const chatRef = ref(db, `chats/${chatId}`);

        const unsubscribe = onValue(chatRef, (snapshot) => {
            console.log(`📥 [DEBUG] Firebase Sync: Received data for ${chatId}`);
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log(`📥 [DEBUG] Found ${Object.keys(data).length} messages.`);

                const msgList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    timestamp: data[key].timestamp ? new Date(data[key].timestamp) : new Date()
                })).sort((a, b) => a.timestamp - b.timestamp);

                setMessages(msgList);
            } else {
                console.log("📥 [DEBUG] Chat exists but no messages yet.");
                setMessages([]);
            }
        }, (error) => {
            console.error(`❌ [DEBUG] Firebase Read Error for ${chatId}:`, error);
        });

        return () => unsubscribe();
    }, [user, selectedMatch]);

    // Fetch Active Sessions for Adaptive UI
    useEffect(() => {
        if (!user) return;
        return subscribeToUserSessions(user.uid, (sessions) => {
            setActiveSessions(sessions.filter(s => s.status === 'scheduled' && new Date(s.dateTime) > new Date()));
        });
    }, [user]);

    const activeSessionForMatch = useMemo(() => {
        if (!selectedMatch) return null;
        return activeSessions.find(s => s.mentorId === selectedMatch.id || s.menteeId === selectedMatch.id);
    }, [activeSessions, selectedMatch]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const msgText = message.trim();
        if (!msgText || !selectedMatch || !user) return;

        setSaving(true);
        const chatId = [user.uid, selectedMatch.id].sort().join('_');
        const chatRef = ref(db, `chats/${chatId}`);
        const newMessageRef = push(chatRef);

        try {
            console.log("📤 Sending message to chatId:", chatId);

            // Clear input first for snappy feel
            setMessage('');

            await set(newMessageRef, {
                text: msgText,
                sender: user.uid,
                senderName: profile?.name || 'Anonymous',
                timestamp: serverTimestamp()
            });

            console.log("✅ Message sent successfully!");

            // Send notification to the recipient (Background)
            sendMessageNotification(user, profile, selectedMatch.id, msgText).catch(err => console.error("Notification fail:", err));

        } catch (error) {
            console.error("❌ Error sending message:", error);
            // Restore message text on failure
            setMessage(msgText);

            const errorMsg = error.message?.includes("PERMISSION_DENIED")
                ? "Permission Denied: Ensure you've updated the Realtime Database Rules in the Firebase Console."
                : `Failed to send: ${error.message}`;
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const [showGuide, setShowGuide] = useState(false);

    const menteeIceBreakers = [
        "What's your favorite project so far?",
        "How do you usually approach learning a new skill?",
        "I'd love to hear more about your background!",
        "What are your top 3 goals for a mentor?"
    ];

    const mentorIceBreakers = [
        "What's your biggest career challenge right now?",
        "What skills are you looking to develop most?",
        "Tell me about your long-term career aspirations.",
        "How can I best support your growth this month?"
    ];

    const currentIceBreakers = profile?.role === 'mentee' ? menteeIceBreakers : mentorIceBreakers;

    const menteeGuide = {
        approachTips: [
            "Be specific about your goals",
            "Be respectful of their time",
            "Prepare a clear agenda for sessions",
            "Show you've researched their background"
        ],
        sessionSuggestions: [
            "30-min Virtual Coffee (Intro)",
            "Portfolio/Resume Review",
            "Mock Interview Session",
            "Career Strategy & Goal Setting"
        ],
        questionsToAsk: [
            "What was your biggest career turning point?",
            "How do you stay updated with industry trends?",
            "What's one skill you wish you'd learned earlier?",
            "How do you handle difficult work situations?"
        ]
    };

    const filteredMatches = matches.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.career?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 10rem)', gap: '1.5rem' }}>
            {/* Sidebar - Match List */}
            <div className="glass" style={{ width: '350px', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Chats</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input
                            className="glass"
                            placeholder="Search matches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'inherit' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Loading...</div>
                    ) : filteredMatches.length > 0 ? (
                        filteredMatches.map(match => (
                            <div
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    background: selectedMatch?.id === match.id ? 'var(--primary)' : 'transparent',
                                    color: selectedMatch?.id === match.id ? 'white' : 'inherit',
                                    transition: 'var(--transition)',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                <img src={match.avatar} alt={match.name} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', objectFit: 'cover' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.name || 'Anonymous User'}</h4>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.career || 'New User'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No matches found</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="glass" style={{ flex: 1, borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {selectedMatch ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={selectedMatch.avatar} alt={selectedMatch.name} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white' }} />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h3 style={{ fontWeight: 800 }}>{selectedMatch.name || 'User'}</h3>
                                        <button
                                            onClick={() => navigate(`/profile/${selectedMatch.id}`)}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                            title="View Profile"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Active Member</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {profile?.role === 'mentee' && (
                                    <button
                                        onClick={() => setShowGuide(!showGuide)}
                                        className={`btn ${showGuide ? 'btn-primary' : 'glass'}`}
                                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}
                                    >
                                        <Sparkles size={16} /> Guide
                                    </button>
                                )}

                                <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }} />
                                {activeSessionForMatch ? (
                                    <button
                                        onClick={() => window.open(activeSessionForMatch.meetLink, '_blank')}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.6rem 1.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: '0.85rem',
                                            background: '#22c55e', // Green for Join
                                            boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
                                        }}
                                    >
                                        <Video size={18} /> Join Session
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsBookingOpen(true)}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.6rem 1.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: '0.85rem',
                                            background: '#1e3a8a'
                                        }}
                                    >
                                        <Calendar size={18} /> Schedule Session
                                    </button>
                                )}
                                <button onClick={() => setIsFeedbackOpen(true)} className="btn glass" style={{ padding: '0.5rem' }}>
                                    <Star size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <div className="glass" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', alignItems: 'center', gap: '0.75rem' }}>
                                        <Sparkles size={16} color="var(--primary)" />
                                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Connected in {selectedMatch.career || 'Mentorship'}</p>
                                    </div>
                                </div>

                                {messages.map(msg => (
                                    <div key={msg.id} style={{ alignSelf: msg.sender === user?.uid ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                        <div style={{
                                            padding: '0.75rem 1.25rem',
                                            borderRadius: 'var(--radius-lg)',
                                            background: msg.sender === 'system' ? '#eff6ff' : (msg.sender === user?.uid ? 'var(--primary)' : 'var(--glass)'),
                                            color: msg.sender === 'system' ? '#1e40af' : (msg.sender === user?.uid ? 'white' : 'inherit'),
                                            border: msg.sender === user?.uid ? 'none' : '1px solid var(--border)',
                                            fontWeight: msg.sender === 'system' ? 700 : 400,
                                            textAlign: msg.sender === 'system' ? 'center' : 'left'
                                        }}>
                                            {msg.text}
                                            {msg.type === 'session_invite' && (
                                                <button
                                                    onClick={() => window.open(msg.meetLink, '_blank')}
                                                    style={{
                                                        display: 'block',
                                                        margin: '0.75rem auto 0',
                                                        padding: '0.5rem 1rem',
                                                        background: '#1e3a8a',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Join Meeting
                                                </button>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.25rem', textAlign: msg.sender === user?.uid ? 'right' : 'left' }}>
                                            {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                        </p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Mentee Guide Side Panel */}
                            <AnimatePresence>
                                {showGuide && profile?.role === 'mentee' && (
                                    <motion.div
                                        initial={{ x: 300, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 300, opacity: 0 }}
                                        className="glass"
                                        style={{ width: '300px', borderLeft: '1px solid var(--border)', overflowY: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: 'var(--primary)' }}>
                                            <Sparkles size={20} />
                                            <h4 style={{ fontWeight: 800 }}>Mentorship Guide</h4>
                                        </div>

                                        <div style={{ marginBottom: '2rem' }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '1rem' }}>How to approach</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {menteeGuide.approachTips.map((tip, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                                                        <div style={{ color: 'var(--primary)', marginTop: '2px' }}>•</div>
                                                        <p style={{ opacity: 0.8 }}>{tip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '2rem' }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '1rem' }}>Suggested Sessions</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {menteeGuide.sessionSuggestions.map((session, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setMessage(`Hi ${selectedMatch.name}, I'd love to schedule a ${session}.`)}
                                                        className="glass"
                                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', textAlign: 'left', border: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--transition)' }}
                                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                                    >
                                                        {session}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '1rem' }}>What to ask</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {menteeGuide.questionsToAsk.map((q, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setMessage(q)}
                                                        className="glass"
                                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', textAlign: 'left', border: '1px solid var(--border)', cursor: 'pointer' }}
                                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {currentIceBreakers.map((ib, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setMessage(ib)}
                                        className="glass"
                                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', whiteSpace: 'nowrap', color: 'inherit', border: '1px solid var(--border)', cursor: 'pointer' }}
                                    >
                                        {ib}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    className="glass"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', color: 'inherit' }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                        <MessageCircle size={64} style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontWeight: 800 }}>Start a conversation</h3>
                        <p style={{ fontSize: '0.9rem' }}>Select a match from the sidebar to begin chatting</p>
                    </div>
                )}
            </div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                mentorProfile={selectedMatch}
                mentorId={selectedMatch?.id}
            />
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                mentorName={selectedMatch?.name}
            />
        </div>
    );
};

export default Messages;
