import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, User, MessageCircle, Sparkles, Clock, Inbox, Filter, Heart } from 'lucide-react';
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

    const formatTimestamp = (ts) => {
        if (!ts) return 'Just now';
        const date = new Date(ts);
        const diff = Date.now() - date.getTime();
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

    if (loading) return (
        <div style={{ padding: '8rem 0', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #1e3a8a', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }} />
        </div>
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                        {activeTab === 'requests' ? 'Incoming Requests' : 'Notifications'}
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>
                        {activeTab === 'requests' ? 'Review people who want to connect with you.' : 'Stay updated with your latest activities.'}
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    padding: '0.4rem',
                    borderRadius: '14px',
                    gap: '0.25rem'
                }}>
                    {[
                        { id: 'all', label: 'All', icon: <Bell size={16} /> },
                        { id: 'requests', label: 'Requests', icon: <Inbox size={16} /> },
                        { id: 'unread', label: 'Unread', icon: <Filter size={16} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSearchParams({ tab: tab.id })}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.6rem 1.25rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: activeTab === tab.id ? 'white' : 'transparent',
                                color: activeTab === tab.id ? '#1e3a8a' : '#64748b',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                transition: '0.2s'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <AnimatePresence mode='popLayout'>
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    background: 'white',
                                    padding: '1.75rem',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1.5rem',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: notif.read ? 'none' : '0 10px 15px -3px rgba(30, 58, 138, 0.05)',
                                    opacity: notif.read ? 0.7 : 1,
                                    position: 'relative'
                                }}
                            >
                                {!notif.read && (
                                    <div style={{ position: 'absolute', top: '2rem', right: '2rem', width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%' }} />
                                )}

                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: notif.type === 'match_request' ? '#eff6ff' : notif.type === 'new_message' ? '#fdf2f8' : notif.type === 'match_declined' ? '#fefce8' : '#f0fdf4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: notif.type === 'match_request' ? '#2563eb' : notif.type === 'new_message' ? '#db2777' : notif.type === 'match_declined' ? '#d97706' : '#16a34a',
                                    flexShrink: 0
                                }}>
                                    {notif.type === 'match_request' ? <User size={28} /> :
                                        notif.type === 'new_message' ? <MessageCircle size={28} /> :
                                            notif.type === 'match_declined' ? <Heart size={28} /> :
                                                <Sparkles size={28} />}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>
                                            {notif.type === 'match_request' ? 'Match Request' :
                                                notif.type === 'new_message' ? 'New Message' :
                                                    notif.type === 'match_declined' ? 'A note from your mentor' :
                                                        'Notification'}
                                        </h4>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                                            {formatTimestamp(notif.timestamp)}
                                        </span>
                                    </div>
                                    <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                        {notif.text}
                                    </p>

                                    {notif.type === 'match_request' && (
                                        <div style={{
                                            background: '#f8fafc',
                                            padding: '1.5rem',
                                            borderRadius: '16px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <img
                                                    src={notif.menteeDetails?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.fromId}`}
                                                    alt=""
                                                    style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e2e8f0' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#1e3a8a' }}>{notif.menteeDetails?.name || 'Potential Match'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{notif.menteeDetails?.career}</div>
                                                </div>
                                            </div>
                                            {(dealtWith.has(notif.id) || notif.read) ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, fontSize: '0.9rem', padding: '0.5rem 0' }}>
                                                    <Check size={18} /> Dealt with
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <button
                                                        onClick={() => handleAccept(notif)}
                                                        className="btn btn-primary"
                                                        style={{ flex: 1, padding: '0.6rem', borderRadius: '10px' }}
                                                    >
                                                        Accept Connection
                                                    </button>
                                                    <button
                                                        onClick={() => handleDismiss(notif)}
                                                        className="btn"
                                                        style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0' }}
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {notif.type === 'match_declined' && (
                                        <div style={{ background: '#fefce8', border: '1px solid #fde68a', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <img
                                                    src={notif.mentorDetails?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=mentor`}
                                                    alt={notif.mentorDetails?.name}
                                                    style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e2e8f0', flexShrink: 0 }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>{notif.mentorDetails?.name}</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#a16207' }}>{notif.mentorDetails?.career}</div>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '0.95rem', color: '#78350f', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>"{notif.rejectionMessage}"</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontSize: '0.8rem', fontWeight: 600 }}>
                                                <Heart size={13} /> Keep going — there's a perfect mentor match waiting for you!
                                            </div>
                                        </div>
                                    )}

                                    {notif.type !== 'match_request' && notif.type !== 'match_declined' && !notif.read && (
                                        <button
                                            onClick={() => handleMarkRead(notif.id)}
                                            style={{ color: '#3b82f6', background: 'transparent', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '6rem 0', opacity: 0.5 }}>
                            <Bell size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No {activeTab} yet</h3>
                            <p>Check back later for new updates.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <DeclineRequestModal
                isOpen={isDeclineModalOpen}
                onClose={() => setIsDeclineModalOpen(false)}
                onConfirm={handleDeclineConfirm}
                menteeName={selectedNotif?.menteeDetails?.name || 'the mentee'}
            />
        </div>
    );
};

export default Notifications;
