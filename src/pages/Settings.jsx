import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Shield, Lock, Trash2, Clock, Eye, Loader2,
    RefreshCcw, Check, AlertTriangle, EyeOff, KeyRound, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { ref, update, onValue, remove } from 'firebase/database';
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    deleteUser
} from 'firebase/auth';

const Toggle = ({ checked, onChange, disabled }) => (
    <button
        disabled={disabled}
        onClick={onChange}
        style={{
            width: '44px', height: '24px',
            background: checked ? '#3b82f6' : '#e2e8f0',
            borderRadius: '100px', border: 'none',
            position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
            transition: '0.3s', opacity: disabled ? 0.6 : 1, flexShrink: 0
        }}
    >
        <div style={{
            position: 'absolute', top: '3px',
            left: checked ? '23px' : '3px',
            width: '18px', height: '18px',
            background: 'white', borderRadius: '50%', transition: '0.3s'
        }} />
    </button>
);

const Card = ({ children, danger, isMobile }) => (
    <section style={{
        background: 'white',
        borderRadius: '24px',
        padding: isMobile ? '1.5rem' : '2rem',
        border: `1px solid ${danger ? '#fecaca' : '#f1f5f9'}`,
        borderLeft: danger ? '4px solid #ef4444' : undefined
    }}>
        {children}
    </section>
);

const SectionTitle = ({ icon, children, danger }) => (
    <h2 style={{
        fontSize: '1rem', fontWeight: 800,
        color: danger ? '#ef4444' : '#1e293b',
        marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        textTransform: 'uppercase', letterSpacing: '0.02em'
    }}>
        {icon}{children}
    </h2>
);

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [settings, setSettings] = useState({
        notifications: { reminders: true, alerts: true },
        privacy: { profileVisibility: true }
    });

    const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
    const [pwLoading, setPwLoading] = useState(false);

    const [deleteStep, setDeleteStep] = useState(0);
    const [deletePass, setDeletePass] = useState(''); // Keep for now in case of future use but unused in UI
    const [deleteLoading, setDeleteLoading] = useState(false);


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (!user) return;
        const unsubscribe = onValue(ref(db, `users/${user.uid}/settings`), (snapshot) => {
            if (snapshot.exists()) setSettings(prev => ({ ...prev, ...snapshot.val() }));
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const saveSettings = async (newSettings) => {
        if (!user) return;
        setSaving(true);
        try {
            await update(ref(db, `users/${user.uid}`), { settings: newSettings });
        } catch (err) { showToast('Failed to save settings.', 'error'); }
        finally { setSaving(false); }
    };

    const toggleNotif = (key) => {
        const updated = { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } };
        setSettings(updated);
        saveSettings(updated);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (pw.new !== pw.confirm) return showToast('Passwords do not match.', 'error');
        setPwLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, pw.current);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, pw.new);
            setPw({ current: '', new: '', confirm: '' });
            showToast('Password updated!');
        } catch (err) { showToast('Update failed. Check current password.', 'error'); }
        finally { setPwLoading(false); }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            // 1. Delete data from database
            await remove(ref(db, `users/${user.uid}`));

            // 2. Clear auth and redirect
            // We navigate first to avoid ProtectedRoute redirecting us to /login
            navigate('/');
            await deleteUser(auth.currentUser);

            showToast('Account deleted successfully.');
        } catch (err) {
            console.error("Deletion error:", err);
            showToast('Failed to delete account completely.', 'error');
            setDeleteLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
            <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 900, color: '#1e293b', marginBottom: '2rem' }}>Account Settings</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card isMobile={isMobile}>
                    <SectionTitle icon={<Bell size={16} />}>Notifications</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { label: 'Session Reminders', desc: 'Alerts before upcoming sessions', key: 'reminders' },
                            { label: 'Match Alerts', desc: 'When you get a new request', key: 'alerts' }
                        ].map((item) => (
                            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{item.label}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</p>
                                </div>
                                <Toggle checked={settings.notifications[item.key] ?? true} onChange={() => toggleNotif(item.key)} disabled={saving} />
                            </div>
                        ))}
                    </div>
                </Card>

                <Card isMobile={isMobile}>
                    <SectionTitle icon={<Eye size={16} />}>Privacy</SectionTitle>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <div>
                            <p style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Profile Visibility</p>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{settings.privacy?.profileVisibility ? 'Public' : 'Hidden'}</p>
                        </div>
                        <Toggle checked={settings.privacy?.profileVisibility ?? true} onChange={() => {
                            const updated = { ...settings, privacy: { ...settings.privacy, profileVisibility: !settings.privacy.profileVisibility } };
                            setSettings(updated);
                            saveSettings(updated);
                        }} disabled={saving} />
                    </div>
                </Card>

                <Card isMobile={isMobile}>
                    <SectionTitle icon={<KeyRound size={16} />}>Security</SectionTitle>
                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['Current Password', 'New Password'].map((lbl, i) => (
                            <div key={i}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>{lbl}</label>
                                <input type="password" required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
                                    value={i === 0 ? pw.current : pw.new} onChange={e => setPw(p => ({ ...p, [i === 0 ? 'current' : 'new']: e.target.value }))} />
                            </div>
                        ))}
                        <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ padding: '0.8rem', borderRadius: '10px', fontSize: '0.9rem', marginTop: '0.5rem' }}>{pwLoading ? '...' : 'Update Password'}</button>
                    </form>
                </Card>

                <Card danger isMobile={isMobile}>
                    <SectionTitle icon={<AlertTriangle size={16} />} danger>Danger Zone</SectionTitle>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>Once deleted, your account and profile data cannot be recovered.</p>

                    {deleteStep === 0 ? (
                        <button
                            onClick={() => setDeleteStep(1)}
                            style={{ padding: '0.7rem 1.25rem', borderRadius: '10px', border: '1px solid #fecaca', background: 'white', color: '#ef4444', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                            <p style={{ fontWeight: 800, color: '#dc2626', marginBottom: '0.5rem', fontSize: '1rem' }}>Are you absolutely sure?</p>
                            <p style={{ fontSize: '0.85rem', color: '#991b1b', marginBottom: '1.25rem' }}>
                                This action is permanent and all your profile data will be erased.
                            </p>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading}
                                    style={{
                                        flex: 2, padding: '0.75rem', borderRadius: '10px',
                                        background: '#ef4444', color: 'white', border: 'none',
                                        fontWeight: 800, cursor: 'pointer'
                                    }}
                                >
                                    {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                                </button>
                                <button
                                    onClick={() => setDeleteStep(0)}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '10px',
                                        background: 'white', color: '#475569', border: '1px solid #e2e8f0',
                                        fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    No, Keep It
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', fontWeight: 800, boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
