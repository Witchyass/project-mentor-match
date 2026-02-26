import React, { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { subscribeToNotifications } from '../lib/matchService';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ onToggleSidebar, isSidebarCollapsed }) => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
            setUnreadCount(notifs.filter(n => !n.read).length);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <header style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: window.innerWidth <= 768 ? '0 1rem' : '0 2.5rem',
            background: 'white',
            borderBottom: '1px solid #f1f5f9',
            position: 'sticky',
            top: 0,
            zIndex: 90
        }}>
            {/* Left: hamburger + logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onToggleSidebar}
                    className="animate-hover"
                    style={{
                        background: '#f8fafc',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1e293b',
                        transition: '0.2s'
                    }}
                >
                    <Menu size={22} />
                </button>
                <div style={{
                    opacity: (isSidebarCollapsed || window.innerWidth <= 768) ? 1 : 0,
                    transition: '0.3s',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Logo size={20} showText={window.innerWidth > 380} />
                </div>
            </div>

            {/* Right: notification bell + avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {/* Notification Bell */}
                <button
                    onClick={() => navigate('/notifications')}
                    title="Notifications"
                    style={{
                        position: 'relative',
                        background: '#f8fafc',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#475569',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: '0.2s'
                    }}
                >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: '#ef4444',
                            color: 'white',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            minWidth: '16px',
                            height: '16px',
                            borderRadius: '99px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 3px',
                            border: '2px solid white'
                        }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                <div style={{ height: '32px', width: '1px', background: '#f1f5f9' }} />

                {/* User info + avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right', display: window.innerWidth <= 768 ? 'none' : 'block' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{profile?.name || 'User'}</p>
                        <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0, textTransform: 'capitalize' }}>{profile?.role || 'Member'}</p>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: 'white',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                    }}
                        onClick={() => navigate('/profile')}
                    >
                        {profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
