import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Video, Star, Target, Clock, Calendar,
    ArrowRight, MessageSquare, MoreHorizontal,
    Users, Check, X, Eye, Edit
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
    const isMentor = profile?.role === 'mentor';

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
            console.log("🛠️ Dashboard: Subscribing to requests for mentor UID:", user.uid);

            // Baseline test: Can we read it once?
            get(ref(db, 'requests')).then(snap => {
                console.log("📦 Dashboard: Initial get() test. Exists:", snap.exists(), "Count:", snap.exists() ? Object.keys(snap.val()).length : 0);
            }).catch(err => {
                console.error("❌ Dashboard: Initial get() test failed:", err);
            });

            const requestsRef = ref(db, 'requests');
            unsubRequests = onValue(requestsRef, (snapshot) => {
                console.log("📡 Dashboard: onValue fired. Exists:", snapshot.exists());
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const incoming = Object.values(data)
                        .filter(req => {
                            const isMatch = req.to === user.uid && req.status === 'pending';
                            if (req.to === user.uid) {
                                console.log(`🎯 Dashboard: Found request FOR this mentor. status=${req.status} from=${req.fromName} match=${isMatch}`);
                            }
                            return isMatch;
                        })
                        .sort((a, b) => b.timestamp - a.timestamp);
                    console.log(`✅ Dashboard: ${incoming.length} pending matches found.`);
                    setRequests(incoming);
                } else {
                    console.log("⚠️ Dashboard: No requests node found in DB.");
                    setRequests([]);
                }
            }, (error) => {
                console.error("❌ Dashboard: onValue error handler triggered:", error);
            });
        }

        return () => {
            unsubSessions();
            unsubRequests();
        };
    }, [user, profile, isMentor]);

    if (authLoading) return null;

    const upcomingSessions = sessions.filter(s => s.status === 'scheduled').slice(0, 2);

    const handleAcceptRequest = async (request) => {
        try {
            await acceptMatchRequest(request, profile);
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const handleDeclineRequest = async (customMessage) => {
        if (!selectedRequest) return;
        try {
            await declineMatchRequest(selectedRequest.id, profile, customMessage);
            setIsDeclineModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error("Error declining request:", error);
            alert("Failed to decline request. Please try again.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* Welcome Banner */}
            <section style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #4f46e5 50%, #3b82f6 100%)',
                borderRadius: '24px',
                padding: '3rem 4rem',
                color: 'white',
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                        Welcome back, {profile?.name?.split(' ')[0] || 'John'}! 👋
                    </h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 500 }}>
                        Here's what's happening with your mentorship journey
                    </p>
                </div>

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '8px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        position: 'relative'
                    }}>
                        {profile?.name?.split(' ').map(n => n[0]).join('') || 'AB'}
                        <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            width: '24px',
                            height: '24px',
                            background: '#22c55e',
                            border: '4px solid #6366f1',
                            borderRadius: '50%'
                        }} />
                    </div>
                </div>

                {/* Abstract Background elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', zIndex: 1 }} />
            </section>

            {/* This Month Stats */}
            <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '2rem' }}>This Month</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {[
                        {
                            label: isMentor ? 'Sessions Conducted' : 'Sessions Completed',
                            value: sessionStats.completed,
                            change: '+3 this month',
                            icon: <Video size={24} />,
                            color: '#eff6ff',
                            iconColor: '#2563eb'
                        },
                        {
                            label: isMentor ? 'Active Mentees' : 'Active Mentors',
                            value: isMentor ? requests.length + upcomingSessions.length : '3',
                            change: 'Highly matched',
                            icon: <Users size={24} />,
                            color: '#f5f3ff',
                            iconColor: '#7c3aed'
                        },
                        {
                            label: isMentor ? 'Success Rate' : 'Goals Progress',
                            value: isMentor ? '94%' : '65%',
                            change: '+15% this month',
                            icon: <Target size={24} />,
                            color: '#f0fdf4',
                            iconColor: '#10b981'
                        },
                        {
                            label: isMentor ? 'Hours Mentored' : 'Hours Learned',
                            value: `${sessionStats.totalHours.toFixed(0)} Hours`,
                            change: '+6 hours this month',
                            icon: <Clock size={24} />,
                            color: '#fffbeb',
                            iconColor: '#f59e0b'
                        }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: 'white',
                            padding: '2.5rem 2rem',
                            borderRadius: '20px',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: stat.iconColor,
                                marginBottom: '1.5rem'
                            }}>
                                {stat.icon}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.25rem' }}>{stat.value}</h3>
                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.125rem' }}>{stat.label}</p>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: stat.iconColor }}>{stat.change}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mentor Specific: Incoming Requests */}
            {isMentor && (
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Incoming Requests</h2>
                        <button
                            onClick={() => navigate('/notifications?tab=requests')}
                            style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                        >
                            View All
                        </button>
                    </div>

                    {requests.length === 0 ? (
                        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontWeight: 600 }}>No pending requests at the moment.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {requests.map(request => (
                                <div key={request.id} style={{
                                    background: 'white',
                                    padding: '1.5rem 2rem',
                                    borderRadius: '24px',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem'
                                }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden' }}>
                                        <img src={`https://ui-avatars.com/api/?name=${request.fromName}&background=random`} alt={request.fromName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{request.fromName}</h4>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{request.menteeDetails?.bio || 'Would like guidance on career growth.'}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => navigate(`/profile/${request.fromId}`)}
                                            style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: '#f1f5f9', color: '#1e3a8a', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => handleAcceptRequest(request)}
                                            style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#1e3a8a', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setIsDeclineModalOpen(true);
                                            }}
                                            style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Upcoming Sessions */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Upcoming Sessions</h2>
                    <button
                        onClick={() => navigate('/sessions')}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        View All <ArrowRight size={18} />
                    </button>
                </div>

                {upcomingSessions.length === 0 ? (
                    <div style={{ background: 'white', padding: '4rem', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                        <Calendar size={48} color="#94a3b8" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>No sessions scheduled</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            {isMentor ? "You don't have any upcoming sessions with mentees." : "Start your journey by matching with an expert mentor."}
                        </p>
                        {!isMentor && <button onClick={() => navigate('/discover')} className="btn btn-primary" style={{ margin: '0 auto' }}>Find a Mentor</button>}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {upcomingSessions.map(session => (
                            <div key={session.id} style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '24px',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2rem',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: '#f1f5f9'
                                }}>
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${isMentor ? session.menteeName : session.mentorName}&background=random`}
                                        alt={isMentor ? session.menteeName : session.mentorName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{isMentor ? session.menteeName : session.mentorName}</h3>
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
                                        {profile?.career || 'Professional'} • Topic: {session.topic || 'Strategy Session'}
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
                                <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                                    <button
                                        onClick={() => window.open(session.meetLink, '_blank')}
                                        className="btn btn-primary"
                                        style={{ padding: '0.85rem 2rem', borderRadius: '12px' }}
                                    >
                                        Join Session
                                    </button>
                                    <button
                                        onClick={() => navigate('/messages', { state: { userId: isMentor ? session.menteeId : session.mentorId } })}
                                        className="btn"
                                        style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white' }}
                                    >
                                        Message
                                    </button>
                                    <button
                                        onClick={() => navigate('/sessions')}
                                        className="btn"
                                        style={{ padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white' }}
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Mentor Specific: Quick Actions */}
            {isMentor && (
                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '2rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { label: 'Update Availability', sub: 'Manage your schedule', icon: <Clock size={20} color="#1e3a8a" />, path: '/availability' },
                            { label: 'Edit Profile', sub: 'Update your information', icon: <Edit size={20} color="#1e3a8a" />, path: '/profile' },
                            { label: 'View Public Profile', sub: 'See how mentees see you', icon: <Eye size={20} color="#1e3a8a" />, path: '/profile' }
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                style={{
                                    background: 'white',
                                    padding: '1.5rem 2rem',
                                    borderRadius: '24px',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: '0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {action.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{action.label}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: 0 }}>{action.sub}</p>
                                </div>
                                <ArrowRight size={20} color="#cbd5e1" />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Mentor Tip Box */}
            {isMentor && (
                <div style={{ background: '#e0eaff', borderRadius: '24px', padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.5rem' }}>💡</div>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>Mentor Tip</h4>
                        <p style={{ color: '#44619b', fontWeight: 600, margin: 0 }}>Responding to requests within 24 hours increases your acceptance rate by 40%.</p>
                    </div>
                </div>
            )}
            {/* Rejection Modal */}
            <DeclineRequestModal
                isOpen={isDeclineModalOpen}
                onClose={() => setIsDeclineModalOpen(false)}
                onConfirm={handleDeclineRequest}
                menteeName={selectedRequest?.fromName || 'the mentee'}
            />
        </div>
    );
};

export default Dashboard;
