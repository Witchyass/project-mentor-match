import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, Video, MessageSquare,
    MoreHorizontal, ChevronRight, Filter, Search, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserSessions, completeSession } from '../lib/sessionService';
import { generateGoogleCalendarUrl } from '../utils/calendarUtils';
import BookingModal from '../components/BookingModal';
import FeedbackModal from '../components/FeedbackModal';

const Sessions = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(null); // sessionId
    const [rescheduleData, setRescheduleData] = useState({ isOpen: false, session: null });
    const [feedbackData, setFeedbackData] = useState({ isOpen: false, mentorName: '', sessionId: '' });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsub = subscribeToUserSessions(user.uid, (sessionData) => {
            setSessions(sessionData);
            setLoading(false);
        });

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 8000);

        return () => {
            unsub();
            clearTimeout(timeout);
        };
    }, [user]);

    const handleComplete = async (sessionId, partnerName) => {
        setCompleting(sessionId);
        try {
            const result = await completeSession(sessionId);
            if (result.success) {
                setFeedbackData({
                    isOpen: true,
                    mentorName: partnerName,
                    sessionId: sessionId
                });
            }
        } catch (error) {
            console.error("Failed to complete session:", error);
            alert("Failed to mark session as done. Please try again.");
        } finally {
            setCompleting(null);
        }
    };

    const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
    const pastSessions = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');
    const displaySessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions;

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '2rem' }}>

            {/* Header / Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '2rem' : '3rem' }}>
                <div style={{
                    background: 'white',
                    padding: '6px',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '4px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '10px' : '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            background: activeTab === 'upcoming' ? '#3b82f6' : 'transparent',
                            color: activeTab === 'upcoming' ? 'white' : '#475569',
                            transition: '0.3s'
                        }}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '10px' : '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            background: activeTab === 'past' ? '#3b82f6' : 'transparent',
                            color: activeTab === 'past' ? 'white' : '#475569',
                            transition: '0.3s'
                        }}
                    >
                        History
                    </button>
                </div>
            </div>

            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '1.5rem', textAlign: isMobile ? 'center' : 'left' }}>
                {activeTab === 'upcoming' ? 'Scheduled Sessions' : 'Recent History'}
            </h1>

            {displaySessions.length === 0 ? (
                <div style={{ background: 'white', padding: isMobile ? '3rem 1.5rem' : '4rem', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <Calendar size={48} color="#475569" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>No sessions found</h3>
                    <p style={{ color: '#475569' }}>{activeTab === 'upcoming' ? "You don't have any scheduled sessions yet." : "No session history found."}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {displaySessions.map(session => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'white',
                                padding: isMobile ? '1.5rem' : '2rem',
                                borderRadius: '24px',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                            }}
                        >
                            {(() => {
                                const isMentor = user.uid === session.mentorId;
                                const partnerName = isMentor ? session.menteeName : session.mentorName;
                                const partnerImage = isMentor ? session.menteeImage : session.mentorImage;

                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'nowrap' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                                            <img src={partnerImage || `https://ui-avatars.com/api/?name=${partnerName}&background=random`} alt={partnerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{partnerName}</h3>
                                                <span style={{ padding: '2px 10px', background: '#eff6ff', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Video size={10} /> {isMentor ? 'Mentee' : 'Mentor'}
                                                </span>
                                            </div>
                                            <p style={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Topic: {session.topic || 'Mentorship Session'}</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div style={{ display: 'flex', gap: isMobile ? '1rem' : '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontWeight: 700, fontSize: '0.85rem' }}>
                                    <Calendar size={16} color="#475569" />
                                    {new Date(session.dateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontWeight: 700, fontSize: '0.85rem' }}>
                                    <Clock size={16} color="#475569" />
                                    {new Date(session.dateTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {activeTab === 'upcoming' ? (
                                    <>
                                        <button onClick={() => window.open(session.meetLink, '_blank')} style={{ flex: 1, minWidth: '140px', padding: '0.8rem', borderRadius: '12px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>Join Meeting</button>
                                        <button onClick={() => window.open(generateGoogleCalendarUrl(session), '_blank')} style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#1e3a8a', fontWeight: 700, cursor: 'pointer' }} title="Add to Calendar"><Calendar size={18} /></button>
                                        {profile?.role === 'mentor' && (
                                            <button onClick={() => handleComplete(session.id, session.menteeName)} disabled={completing === session.id} style={{ flex: 1, minWidth: '140px', padding: '0.8rem', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>{completing === session.id ? '...' : 'Mark Done'}</button>
                                        )}
                                        <button onClick={() => navigate('/messages', { state: { userId: user.uid === session.mentorId ? session.menteeId : session.mentorId } })} style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}><MessageSquare size={18} /></button>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: session.status === 'completed' ? '#10b981' : '#ef4444', textTransform: 'capitalize' }}>Status: {session.status}</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <BookingModal isOpen={rescheduleData.isOpen} onClose={() => setRescheduleData({ isOpen: false, session: null })} rescheduleMode={true} sessionToReschedule={rescheduleData.session} mentorId={rescheduleData.session?.mentorId} mentorProfile={{ name: rescheduleData.session?.mentorName, id: rescheduleData.session?.mentorId }} />
            <FeedbackModal isOpen={feedbackData.isOpen} onClose={() => setFeedbackData({ ...feedbackData, isOpen: false })} mentorName={feedbackData.mentorName} />
        </div>
    );
};

export default Sessions;
