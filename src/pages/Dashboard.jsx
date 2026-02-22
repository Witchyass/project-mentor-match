import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Video, Star, Target, Clock, Calendar,
    ArrowRight, MessageSquare, MoreHorizontal,
    Users, Check, X, Eye, Edit, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserSessions, getSessionStats } from '../lib/sessionService';
import { db } from '../lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import { acceptMatchRequest, declineMatchRequest } from '../lib/matchService';
import DeclineRequestModal from '../components/DeclineRequestModal';

const Dashboard = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [requests, setRequests] = useState([]);
    const [sessionStats, setSessionStats] = useState({ total: 0, completed: 0, upcoming: 0, totalHours: 0 });
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

    const isMentor = profile?.role === 'mentor';

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user || !profile) return;

        // Subscribe to sessions
        const unsubSessions = subscribeToUserSessions(user.uid, (sessionData) => {
            setSessions(sessionData);
        });

        // Get session stats
        getSessionStats(user.uid, profile.role).then(stats => {
            setSessionStats(stats);
        });

        // If mentor, subscribe to incoming requests
        let unsubRequests = () => { };
        if (isMentor) {
            const requestsRef = ref(db, 'requests');
            unsubRequests = onValue(requestsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const incoming = Object.values(data)
                        .filter(req => req.to === user.uid && req.status === 'pending');
                    setRequests(incoming);
                } else {
                    setRequests([]);
                }
            });
        }

        return () => {
            unsubSessions();
            unsubRequests();
        };
    }, [user, profile, isMentor]);

    const handleAcceptRequest = async (request) => {
        try {
            await acceptMatchRequest(request);
            alert(`Match request from ${request.fromName} accepted!`);
        } catch (error) {
            console.error("Error accepting request:", error);
            alert("Failed to accept request. Please try again.");
        }
    };

    const handleDeclineRequest = async (reason) => {
        if (!selectedRequest) return;
        try {
            await declineMatchRequest(selectedRequest, reason);
            setIsDeclineModalOpen(false);
            setSelectedRequest(null);
            alert("Request declined.");
        } catch (error) {
            console.error("Error declining request:", error);
            alert("Failed to decline request. Please try again.");
        }
    };

    if (authLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    const stats = [
        {
            label: isMentor ? 'Completed Sessions' : 'Sessions Attended',
            value: sessionStats.completed,
            icon: <Video size={20} />,
            color: '#2563eb'
        },
        {
            label: isMentor ? 'Active Mentees' : 'Total Matches',
            value: isMentor ? requests.length + sessions.length : '3',
            icon: <Users size={20} />,
            color: '#7c3aed'
        },
        {
            label: 'Total Hours',
            value: `${sessionStats.totalHours.toFixed(0)}H`,
            icon: <Clock size={20} />,
            color: '#f59e0b'
        },
        {
            label: 'Success Rate',
            value: isMentor ? '94%' : '65%',
            icon: <Target size={20} />,
            color: '#10b981'
        }
    ];

    const upcomingSessions = sessions
        .filter(s => s.status === 'upcoming')
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        .slice(0, 3);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2.5rem' }}>

            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    borderRadius: '24px',
                    padding: isMobile ? '2rem 1.5rem' : '3rem',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                        Welcome back, {profile?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', opacity: 0.9, fontWeight: 500, maxWidth: '600px' }}>
                        {isMentor
                            ? "You have new mentorship requests waiting. Ready to inspire?"
                            : "Your journey to growth continues. Check your upcoming sessions."
                        }
                    </p>
                </div>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
            </motion.div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
                gap: isMobile ? '1rem' : '1.5rem',
            }}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            background: 'white',
                            padding: isMobile ? '1.25rem' : '1.5rem',
                            borderRadius: '20px',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '0.75rem' : '1.25rem',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div style={{
                            width: isMobile ? '40px' : '48px',
                            height: isMobile ? '40px' : '48px',
                            borderRadius: '12px',
                            background: `${stat.color}10`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: stat.color,
                            flexShrink: 0
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.1rem' }}>{stat.label}</p>
                            <p style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 800, color: '#1e293b' }}>{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isMobile ? '1.5rem' : '2.5rem', alignItems: 'start' }}>

                {/* Left Column: Requests & Sessions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2.5rem' }}>

                    {/* Incoming Requests (Mentor Only) */}
                    {isMentor && (
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>Match Requests</h2>
                                <button onClick={() => navigate('/notifications')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>View All</button>
                            </div>

                            {requests.length === 0 ? (
                                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                    <p style={{ color: '#64748b', fontWeight: 600 }}>No pending requests.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {requests.map(request => (
                                        <div key={request.id} style={{
                                            background: 'white',
                                            padding: isMobile ? '1.25rem' : '1.5rem',
                                            borderRadius: '24px',
                                            border: '1px solid #f1f5f9',
                                            display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img src={`https://ui-avatars.com/api/?name=${request.fromName}&background=random`} alt={request.fromName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{request.fromName}</h4>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{request.menteeDetails?.bio || 'Would like guidance on career growth.'}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
                                                <button onClick={() => navigate(`/profile/${request.from}`)} style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '10px', background: '#f1f5f9', color: '#1e3a8a', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Profile</button>
                                                <button onClick={() => handleAcceptRequest(request)} style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '10px', background: '#1e3a8a', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Accept</button>
                                                <button onClick={() => { setSelectedRequest(request); setIsDeclineModalOpen(true); }} style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'white', color: '#ef4444', border: '1px solid #fecaca', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Upcoming Sessions */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>Upcoming Sessions</h2>
                            <button onClick={() => navigate('/sessions')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>See Schedule</button>
                        </div>

                        {upcomingSessions.length === 0 ? (
                            <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                <p style={{ color: '#64748b', fontWeight: 600 }}>No upcoming sessions scheduled.</p>
                                <button onClick={() => navigate(isMentor ? '/sessions' : '/matcher')} style={{ marginTop: '1rem', background: '#1e3a8a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                                    {isMentor ? 'Set Availability' : 'Find a Mentor'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {upcomingSessions.map(session => (
                                    <div key={session.id} style={{
                                        background: 'white',
                                        padding: '1.25rem',
                                        borderRadius: '20px',
                                        border: '1px solid #f1f5f9',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                                <Calendar size={22} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>{session.topic || 'Mentorship Session'}</p>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                                    {new Date(session.dateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate(`/sessions/${session.id}`)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#f1f5f9', color: '#1e3a8a', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>View</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <DeclineRequestModal
                isOpen={isDeclineModalOpen}
                onClose={() => setIsDeclineModalOpen(false)}
                onConfirm={handleDeclineRequest}
                requestName={selectedRequest?.fromName}
            />
        </div>
    );
};

export default Dashboard;
