import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Video, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserSessions } from '../lib/sessionService';
import { useNavigate } from 'react-router-dom';

const ReminderManager = () => {
    const { user, profile } = useAuth();
    const [activeReminder, setActiveReminder] = useState(null);
    const [dismissedReminders, setDismissedReminders] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !profile?.settings?.notifications?.reminders) {
            setActiveReminder(null);
            return;
        }

        const unsubscribe = subscribeToUserSessions(user.uid, (sessions) => {
            const now = new Date();
            const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);

            // Find an upcoming session starting within 15 minutes
            const upcoming = sessions.find(s => {
                const startTime = new Date(s.dateTime);
                return s.status === 'scheduled' &&
                    startTime > now &&
                    startTime <= fifteenMinutesFromNow &&
                    !dismissedReminders.has(s.id);
            });

            if (upcoming) {
                setActiveReminder(upcoming);
            } else {
                setActiveReminder(null);
            }
        });

        return () => unsubscribe();
    }, [user, profile, dismissedReminders]);

    const handleDismiss = () => {
        if (activeReminder) {
            setDismissedReminders(prev => new Set([...prev, activeReminder.id]));
            setActiveReminder(null);
        }
    };

    return (
        <AnimatePresence>
            {activeReminder && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        width: '90%',
                        maxWidth: '400px',
                        background: 'white',
                        borderRadius: '20px',
                        padding: '1.25rem',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                        border: '1px solid #3b82f6',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center'
                    }}
                >
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#eff6ff',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#3b82f6'
                    }}>
                        <Bell className="animate-bounce" size={24} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', marginBottom: '0.1rem' }}>Session Starting Soon!</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activeReminder.topic || 'Mentorship Strategy Session'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => {
                                handleDismiss();
                                navigate('/sessions');
                            }}
                            style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            Join
                        </button>
                        <button
                            onClick={handleDismiss}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                padding: '0.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ReminderManager;
