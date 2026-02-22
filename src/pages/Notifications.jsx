import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, User, MessageCircle, Sparkles, Clock, Inbox, Filter, Heart, ChevronLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToNotifications, markNotificationAsRead, acceptMatchRequest, declineMatchRequest } from '../lib/matchService';
import DeclineRequestModal from '../components/DeclineRequestModal';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Notifications = () => {
    const { user, profile } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'all';

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dealtWith, setDealtWith] = useState(new Set());
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const unsubscribe = subscribeToNotifications(user.uid, (data) => {
                setNotifications(data || []);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (err) {
            console.error("❌ Notifications Page: Subscription error:", err);
            setError(err.message);
            setLoading(false);
        }
    }, [user]);

    const handleAccept = async (notif) => {
        if (!notif.requestId || !notif.fromId) {
            alert("Cannot accept: Missing request metadata.");
            return;
        }
        try {
            const request = { id: notif.requestId, from: notif.fromId, to: user.uid, status: 'pending' };
            const result = await acceptMatchRequest(request, profile);
            if (result && result.success) {
                await markNotificationAsRead(user.uid, notif.id);
                setDealtWith(prev => new Set([...prev, notif.id]));
                navigate('/messages');
            }
        } catch (error) {
            console.error("Error in handleAccept:", error);
            alert("Failed to accept match.");
        }
    };

    const handleDismiss = (notif) => {
        setSelectedNotif(notif);
        setIsDeclineModalOpen(true);
    };

    const handleDeclineConfirm = async (customMessage) => {
        if (!selectedNotif) return;
        try {
            await declineMatchRequest(selectedNotif.requestId, profile, customMessage);
            await markNotificationAsRead(user.uid, selectedNotif.id);
            setDealtWith(prev => new Set([...prev, selectedNotif.id]));
            setIsDeclineModalOpen(false);
            setSelectedNotif(null);
        } catch (error) {
            console.error("Error declining:", error);
            alert("Failed to decline request.");
        }
    };

    const handleMarkRead = async (notifId) => {
        try {
            await markNotificationAsRead(user.uid, notifId);
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const formatTimestamp = (ts, now) => {
        if (!ts) return 'Just now';
        const date = new Date(ts);
        const diff = now - date.getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'requests') return notif.type === 'match_request';
        if (activeTab === 'unread') return !notif.read;
        return true;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'flex-end',
                marginBottom: isMobile ? '2rem' : '3rem',
                gap: '1.5rem'
            }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                        {activeTab === 'requests' ? 'Match Requests' : 'Activity'}
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem' }}>
                        {activeTab === 'requests' ? 'Review people who want to connect with you.' : 'Stay updated with your latest activities.'}
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    padding: '4px',
                    borderRadius: '12px',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'requests', label: 'Requests' },
                        { id: 'unread', label: 'Unread' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSearchParams({ tab: tab.id })}
                            style={{
                                flex: isMobile ? 1 : 'none',
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === tab.id ? 'white' : 'transparent',
                                color: activeTab === tab.id ? '#1e3a8a' : '#64748b',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence mode='popLayout'>
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    background: 'white',
                                    padding: isMobile ? '1.25rem' : '1.75rem',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    border: '1px solid #f1f5f9',
                                    position: 'relative',
                                    boxShadow: notif.read ? 'none' : '0 4px 6px -1px rgba(30, 58, 138, 0.04)'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: notif.type === 'match_request' ? '#eff6ff' : notif.type === 'new_message' ? '#fdf2f8' : notif.type === 'match_declined' ? '#f0f9ff' : '#f0fdf4',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: notif.type === 'match_request' ? '#3b82f6' : notif.type === 'new_message' ? '#db2777' : notif.type === 'match_declined' ? '#0284c7' : '#16a34a',
                                        flexShrink: 0
                                    }}>
                                        {notif.type === 'match_request' ? <User size={24} /> : notif.type === 'new_message' ? <MessageCircle size={24} /> : notif.type === 'match_declined' ? <MessageCircle size={24} /> : <Sparkles size={24} />}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
                                                {notif.type === 'match_request' ? 'Match Request' : notif.type === 'new_message' ? 'New Message' : notif.type === 'match_declined' ? 'Mentor Connection Update' : 'Team Update'}
                                            </h4>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{formatTimestamp(notif.timestamp, Date.now())}</span>
                                        </div>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5 }}>{notif.text}</p>
                                    </div>
                                </div>

                                {notif.type === 'match_request' && (
                                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <img src={notif.menteeDetails?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.fromId}`} style={{ width: '40px', height: '40px', borderRadius: '10px' }} alt="" />
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.9rem' }}>{notif.menteeDetails?.name || 'Potential Match'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{notif.menteeDetails?.career}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/profile/${notif.fromId}`)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#3b82f6',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                View Profile <ArrowRight size={14} />
                                            </button>
                                        </div>
                                        {dealtWith.has(notif.id) || notif.read ? (
                                            <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>Completed</div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button onClick={() => handleAccept(notif)} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>Accept</button>
                                                <button onClick={() => handleDismiss(notif)} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Decline</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {notif.type === 'match_declined' && notif.rejectionMessage && (
                                    <div style={{
                                        background: '#f0f9ff',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '16px',
                                        border: '1px solid #e0f2fe',
                                        marginTop: '0.5rem',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            left: '20px',
                                            width: '16px',
                                            height: '16px',
                                            background: '#f0f9ff',
                                            borderLeft: '1px solid #e0f2fe',
                                            borderTop: '1px solid #e0f2fe',
                                            transform: 'rotate(45deg)'
                                        }}></div>
                                        <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Advice & Feedback from {notif.mentorDetails?.name || 'Mentor'}
                                        </div>
                                        <p style={{ color: '#075985', fontSize: '0.9rem', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.5 }}>
                                            "{notif.rejectionMessage}"
                                        </p>
                                    </div>
                                )}

                                {!notif.read && (
                                    <button onClick={() => handleMarkRead(notif.id)} style={{ color: '#3b82f6', background: 'transparent', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', alignSelf: 'flex-start' }}>Mark Read</button>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '6rem 0', opacity: 0.5 }}>
                            <Bell size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>All caught up!</h3>
                            <p style={{ fontSize: '0.9rem' }}>You have no {activeTab} notifications.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <DeclineRequestModal isOpen={isDeclineModalOpen} onClose={() => setIsDeclineModalOpen(false)} onConfirm={handleDeclineConfirm} menteeName={selectedNotif?.menteeDetails?.name || 'the mentee'} />
        </div>
    );
};

export default Notifications;
