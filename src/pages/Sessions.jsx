import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, Video, MessageSquare,
    MoreHorizontal, ChevronRight, Filter, Search
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

    useEffect(() => {
        if (!user || !profile) return;

        const unsub = subscribeToUserSessions(user.uid, (sessionData) => {
            setSessions(sessionData);
            setLoading(false);
        });

        return () => unsub();
    }, [user, profile]);

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

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* Header / Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <div style={{
                    background: 'white',
                    padding: '8px',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '8px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                }}>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            background: activeTab === 'upcoming' ? '#6366f1' : 'transparent',
                            color: activeTab === 'upcoming' ? 'white' : '#64748b',
                            transition: '0.3s'
                        }}
                    >
                        Upcoming Sessions
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            background: activeTab === 'past' ? '#6366f1' : 'transparent',
                            color: activeTab === 'past' ? 'white' : '#64748b',
                            transition: '0.3s'
                        }}
                    >
                        Past
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
                    {activeTab === 'upcoming' ? 'Upcoming Sessions' : 'Past Sessions'}
                </h1>
                <button style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View All <ChevronRight size={16} />
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                </div>
            ) : displaySessions.length === 0 ? (
                <div style={{ background: 'white', padding: '4rem', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <Calendar size={48} color="#94a3b8" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                        No {activeTab} sessions
                    </h3>
                    <p style={{ color: '#64748b' }}>
                        {activeTab === 'upcoming' ? "You don't have any scheduled sessions yet." : "No session history found."}
                    </p>
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
                                padding: '2rem',
                                borderRadius: '24px',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2rem',
                                flexWrap: 'wrap'
                            }}
                        >
                            {(() => {
                                const isMentor = user.uid === session.mentorId;
                                const partnerName = isMentor ? session.menteeName : session.mentorName;
                                const partnerImage = isMentor ? session.menteeImage : session.mentorImage;
                                const partnerInitial = partnerName?.charAt(0) || '?';

                                return (
                                    <>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            background: '#f1f5f9'
                                        }}>
                                            <img
                                                src={partnerImage || `https://ui-avatars.com/api/?name=${partnerName}&background=random`}
                                                alt={partnerName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, minWidth: '250px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                                                    {isMentor ? 'Mentee: ' : 'Mentor: '} {partnerName}
                                                </h3>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '100px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    color: '#64748b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <Video size={12} /> Video Call
                                                </span>
                                            </div>
                                            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>
                                                {isMentor ? 'Mentorship Session' : (profile?.career || 'Aspiring Professional')} • Topic: {session.topic || 'Strategy Session'}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Calendar size={18} color="#64748b" />
                                                    {new Date(session.dateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Clock size={18} color="#64748b" />
                                                    {new Date(session.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                            <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                                {activeTab === 'upcoming' ? (
                                    <>
                                        <button
                                            onClick={() => window.open(session.meetLink, '_blank')}
                                            className="btn btn-primary"
                                            style={{ padding: '0.85rem 2rem', borderRadius: '12px' }}
                                        >
                                            Join Session
                                        </button>
                                        <button
                                            onClick={() => window.open(generateGoogleCalendarUrl(session), '_blank')}
                                            className="btn"
                                            style={{
                                                padding: '0.85rem 1.5rem',
                                                borderRadius: '12px',
                                                border: '1.5px solid #e2e8f0',
                                                background: 'white',
                                                color: '#1e3a8a',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <Calendar size={18} /> Add to Calendar
                                        </button>
                                        <button
                                            onClick={() => setRescheduleData({ isOpen: true, session })}
                                            className="btn"
                                            style={{
                                                padding: '0.85rem 1.5rem',
                                                borderRadius: '12px',
                                                border: '1.5px solid #e2e8f0',
                                                background: 'white',
                                                color: '#475569',
                                                fontWeight: 700
                                            }}
                                        >
                                            Reschedule
                                        </button>
                                        <button
                                            onClick={() => {
                                                const isMentor = user.uid === session.mentorId;
                                                const partnerId = isMentor ? session.menteeId : session.mentorId;
                                                navigate('/messages', { state: { userId: partnerId } });
                                            }}
                                            className="btn"
                                            style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white' }}
                                        >
                                            Message
                                        </button>
                                        {profile?.role === 'mentor' && (
                                            <button
                                                onClick={() => handleComplete(session.id, session.menteeName)}
                                                disabled={completing === session.id}
                                                className="btn"
                                                style={{
                                                    padding: '0.85rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    border: 'none',
                                                    opacity: completing === session.id ? 0.7 : 1
                                                }}
                                            >
                                                {completing === session.id ? 'Saving...' : 'Mark as Done'}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <button className="btn" style={{ padding: '0.85rem 2rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white' }}>View Recording</button>
                                        <button className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '12px' }}>Book Again</button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <BookingModal
                isOpen={rescheduleData.isOpen}
                onClose={() => setRescheduleData({ isOpen: false, session: null })}
                rescheduleMode={true}
                sessionToReschedule={rescheduleData.session}
                mentorId={rescheduleData.session?.mentorId}
                mentorProfile={{
                    name: rescheduleData.session?.mentorName,
                    id: rescheduleData.session?.mentorId
                }}
            />
            <FeedbackModal
                isOpen={feedbackData.isOpen}
                onClose={() => setFeedbackData({ ...feedbackData, isOpen: false })}
                mentorName={feedbackData.mentorName}
            />
        </div>
    );
};

export default Sessions;
